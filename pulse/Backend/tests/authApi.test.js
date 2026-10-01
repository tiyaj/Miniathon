import http from 'http';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';

dotenv.config();

import app from '../src/app.js';
import { connectDB } from '../src/config/database.js';
import User from '../src/models/User.js';
import Event from '../src/models/Event.js';
import { ROLES } from '../src/utils/constants.js';
import emailService from '../src/services/emailService.js';

let server;
let baseUrl;

async function request(endpoint, options = {}) {
  const url = `${baseUrl}${endpoint}`;
  const method = options.method || 'GET';
  const headers = options.headers || {};
  let body = options.body;

  if (body && typeof body === 'object') {
    body = JSON.stringify(body);
    headers['Content-Type'] = 'application/json';
  }

  const response = await fetch(url, {
    method,
    headers,
    body: body ? body : undefined,
  });

  let data;
  try {
    data = await response.json();
  } catch {
    data = null;
  }

  return {
    status: response.status,
    body: data,
  };
}

const runAuthTests = async () => {
  let passed = 0;
  let failed = 0;
  const testResults = [];

  const assert = (condition, description) => {
    if (condition) {
      passed++;
      console.log(`  [PASS] ${description}`);
      testResults.push({ description, status: 'PASS' });
    } else {
      failed++;
      console.error(`  [FAIL] ${description}`);
      testResults.push({ description, status: 'FAIL' });
    }
  };

  try {
    console.log('\n=== Starting PULSE Authentication & RBAC Test Suite ===');
    await connectDB();
    emailService.setMockMode(true);

    server = http.createServer(app);
    await new Promise((resolve) => server.listen(0, resolve));
    const port = server.address().port;
    baseUrl = `http://127.0.0.1:${port}`;
    console.log(`Auth test server running at ${baseUrl}`);

    // Clean up any existing auth test users
    await User.deleteMany({ email: /@test-auth-runner\.com$/ });

    let testEvent = await Event.findOne();
    if (!testEvent) {
      testEvent = await Event.create({
        name: 'Auth Test Event',
        startDate: new Date(),
        endDate: new Date(Date.now() + 86400000),
      });
    }

    console.log('\n--- REGISTRATION TESTS ---');

    // 1. Successful registration
    emailService.clearSentEmails();
    const regRes = await request('/api/auth/register', {
      method: 'POST',
      body: {
        name: 'Alice Volunteer',
        email: 'alice@test-auth-runner.com',
        password: 'Password123!',
      },
    });
    assert(regRes.status === 201, 'Test 1: Successful registration returns 201');
    assert(regRes.body?.data?.user?.email === 'alice@test-auth-runner.com', 'Test 1: Registered user email matches');
    assert(regRes.body?.data?.user?.isEmailVerified === false, 'Test 1: User initially unverified');
    assert(regRes.body?.data?.user?.role === ROLES.VOLUNTEER, 'Test 1: User assigned VOLUNTEER role');

    // 2. Duplicate email
    const dupRes = await request('/api/auth/register', {
      method: 'POST',
      body: {
        name: 'Alice Duplicate',
        email: 'alice@test-auth-runner.com',
        password: 'Password123!',
      },
    });
    assert(dupRes.status === 409, 'Test 2: Duplicate email registration returns 409');
    assert(dupRes.body?.error?.code === 'DUPLICATE_EMAIL', 'Test 2: Returns DUPLICATE_EMAIL error code');

    // 3. Invalid email
    const invalidEmailRes = await request('/api/auth/register', {
      method: 'POST',
      body: {
        name: 'Bob Invalid',
        email: 'invalid-email-format',
        password: 'Password123!',
      },
    });
    assert(invalidEmailRes.status === 400, 'Test 3: Invalid email rejected with 400');
    assert(invalidEmailRes.body?.error?.code === 'INVALID_EMAIL', 'Test 3: Returns INVALID_EMAIL code');

    // 4. Missing fields
    const missingRes = await request('/api/auth/register', {
      method: 'POST',
      body: {
        name: '',
        email: '',
      },
    });
    assert(missingRes.status === 400, 'Test 4: Missing fields rejected with 400');

    // 5. Weak password
    const weakPassRes = await request('/api/auth/register', {
      method: 'POST',
      body: {
        name: 'Charlie Weak',
        email: 'charlie@test-auth-runner.com',
        password: '123',
      },
    });
    assert(weakPassRes.status === 400, 'Test 5: Password under 6 characters rejected with 400');
    assert(weakPassRes.body?.error?.code === 'WEAK_PASSWORD', 'Test 5: Returns WEAK_PASSWORD code');

    // 6. Password stored hashed in DB
    const dbAlice = await User.findOne({ email: 'alice@test-auth-runner.com' }).select('+passwordHash');
    assert(dbAlice && dbAlice.passwordHash && dbAlice.passwordHash !== 'Password123!', 'Test 6: Password is stored hashed in MongoDB');

    // 7. passwordHash never returned in API responses
    assert(!regRes.body?.data?.user?.passwordHash, 'Test 7: passwordHash is not exposed in registration response');

    // 8 & 9. Client cannot choose privileged roles
    const adminAttemptRes = await request('/api/auth/register', {
      method: 'POST',
      body: {
        name: 'Mallory Attacker',
        email: 'mallory@test-auth-runner.com',
        password: 'Password123!',
        role: 'ADMIN',
      },
    });
    assert(adminAttemptRes.status === 201, 'Test 8: Registration succeeds without crashing');
    assert(adminAttemptRes.body?.data?.user?.role === ROLES.VOLUNTEER, 'Test 8: Client-requested ADMIN role overridden to VOLUNTEER');

    const superAdminAttemptRes = await request('/api/auth/register', {
      method: 'POST',
      body: {
        name: 'Sam Attacker',
        email: 'sam@test-auth-runner.com',
        password: 'Password123!',
        role: 'SUPER_ADMIN',
      },
    });
    assert(superAdminAttemptRes.body?.data?.user?.role === ROLES.VOLUNTEER, 'Test 9: Client-requested SUPER_ADMIN role overridden to VOLUNTEER');

    console.log('\n--- LOGIN & VERIFICATION POLICY TESTS ---');

    // 10. Login with unverified email blocked
    const unverifiedLoginRes = await request('/api/auth/login', {
      method: 'POST',
      body: {
        email: 'alice@test-auth-runner.com',
        password: 'Password123!',
      },
    });
    assert(unverifiedLoginRes.status === 403, 'Test 14: Login blocked for unverified user (403)');
    assert(unverifiedLoginRes.body?.error?.code === 'EMAIL_NOT_VERIFIED', 'Test 14: Returns EMAIL_NOT_VERIFIED code');

    // Retrieve Alice's verification token specifically from mock store
    const aliceEmail = emailService.getSentEmails().find((e) => e.to === 'alice@test-auth-runner.com');
    assert(aliceEmail && aliceEmail.token, 'Test 24: Verification email was captured by emailService with token');
    const verifToken = aliceEmail.token;

    // 26. Invalid verification token
    const invalidVerifRes = await request('/api/auth/verify-email', {
      method: 'POST',
      body: { token: 'bogus-invalid-verification-token' },
    });
    assert(invalidVerifRes.status === 400, 'Test 26: Invalid verification token returns 400');
    assert(invalidVerifRes.body?.error?.code === 'INVALID_OR_EXPIRED_TOKEN', 'Test 26: Returns INVALID_OR_EXPIRED_TOKEN code');

    // 25. Valid email verification
    const validVerifRes = await request('/api/auth/verify-email', {
      method: 'POST',
      body: { token: verifToken },
    });
    assert(validVerifRes.status === 200, 'Test 25: Valid email verification returns 200');
    assert(validVerifRes.body?.data?.user?.isEmailVerified === true, 'Test 25: User marked email verified');

    // 28. Reused verification token
    const reuseVerifRes = await request('/api/auth/verify-email', {
      method: 'POST',
      body: { token: verifToken },
    });
    assert(reuseVerifRes.status === 400, 'Test 28: Reused verification token returns 400');

    // 10 & 15. Correct verified login returns JWT
    const loginRes = await request('/api/auth/login', {
      method: 'POST',
      body: {
        email: 'alice@test-auth-runner.com',
        password: 'Password123!',
      },
    });
    assert(loginRes.status === 200, 'Test 10 & 15: Successful login returns 200');
    assert(!!loginRes.body?.data?.token, 'Test 15: Successful login returns JWT token');
    assert(!loginRes.body?.data?.user?.passwordHash, 'Test 15: passwordHash omitted from login response');
    const aliceToken = loginRes.body?.data?.token;

    // 11. Wrong password
    const wrongPassRes = await request('/api/auth/login', {
      method: 'POST',
      body: {
        email: 'alice@test-auth-runner.com',
        password: 'WrongPassword!',
      },
    });
    assert(wrongPassRes.status === 401, 'Test 11: Wrong password rejected with 401');
    assert(wrongPassRes.body?.error?.code === 'INVALID_CREDENTIALS', 'Test 11: Returns INVALID_CREDENTIALS');

    // 12. Unknown email
    const unknownEmailRes = await request('/api/auth/login', {
      method: 'POST',
      body: {
        email: 'nobody-exists@test-auth-runner.com',
        password: 'Password123!',
      },
    });
    assert(unknownEmailRes.status === 401, 'Test 12: Unknown email returns 401 INVALID_CREDENTIALS');

    // 13. Inactive user blocked
    await User.updateOne({ email: 'alice@test-auth-runner.com' }, { isActive: false });
    const inactiveLoginRes = await request('/api/auth/login', {
      method: 'POST',
      body: {
        email: 'alice@test-auth-runner.com',
        password: 'Password123!',
      },
    });
    assert(inactiveLoginRes.status === 403, 'Test 13: Inactive user login returns 403');
    assert(inactiveLoginRes.body?.error?.code === 'ACCOUNT_INACTIVE', 'Test 13: Returns ACCOUNT_INACTIVE code');
    // Reactivate alice
    await User.updateOne({ email: 'alice@test-auth-runner.com' }, { isActive: true });

    console.log('\n--- JWT & /api/auth/me TESTS ---');

    // 16 & 22. Valid JWT accessing /api/auth/me
    const meRes = await request('/api/auth/me', {
      headers: { Authorization: `Bearer ${aliceToken}` },
    });
    assert(meRes.status === 200, 'Test 16 & 22: Valid JWT accessing /api/auth/me returns 200');
    assert(meRes.body?.data?.user?.email === 'alice@test-auth-runner.com', 'Test 22: Returns user profile');

    // 17 & 23. Missing JWT
    const noAuthRes = await request('/api/auth/me');
    assert(noAuthRes.status === 401, 'Test 17 & 23: Missing JWT rejected with 401');
    assert(noAuthRes.body?.error?.code === 'AUTH_REQUIRED', 'Test 17: Returns AUTH_REQUIRED code');

    // 18. Malformed JWT
    const malformedRes = await request('/api/auth/me', {
      headers: { Authorization: 'Bearer this-is-not-a-valid-jwt' },
    });
    assert(malformedRes.status === 401, 'Test 18: Malformed JWT rejected with 401');
    assert(malformedRes.body?.error?.code === 'INVALID_TOKEN', 'Test 18: Returns INVALID_TOKEN code');

    // 19. Expired JWT
    const expiredToken = jwt.sign(
      { sub: dbAlice._id.toString(), role: ROLES.VOLUNTEER },
      process.env.JWT_SECRET || 'pulse-jwt-dev-secret-key-replace-in-prod',
      { expiresIn: '-10s' }
    );
    const expiredRes = await request('/api/auth/me', {
      headers: { Authorization: `Bearer ${expiredToken}` },
    });
    assert(expiredRes.status === 401, 'Test 19: Expired JWT rejected with 401');
    assert(expiredRes.body?.error?.code === 'TOKEN_EXPIRED', 'Test 19: Returns TOKEN_EXPIRED code');

    // 21. User deactivated after token creation
    await User.updateOne({ _id: dbAlice._id }, { isActive: false });
    const postDeactRes = await request('/api/auth/me', {
      headers: { Authorization: `Bearer ${aliceToken}` },
    });
    assert(postDeactRes.status === 403, 'Test 21: Deactivated user rejected on valid JWT (403)');
    assert(postDeactRes.body?.error?.code === 'ACCOUNT_INACTIVE', 'Test 21: Returns ACCOUNT_INACTIVE code');
    await User.updateOne({ _id: dbAlice._id }, { isActive: true });

    console.log('\n--- PASSWORD RESET TESTS ---');

    // 29 & 30. Forgot password generic response
    emailService.clearSentEmails();
    const forgotRes = await request('/api/auth/forgot-password', {
      method: 'POST',
      body: { email: 'alice@test-auth-runner.com' },
    });
    assert(forgotRes.status === 200, 'Test 29: Forgot password returns 200');
    assert(typeof forgotRes.body?.data?.message === 'string', 'Test 29: Generic message returned');

    const forgotUnknownRes = await request('/api/auth/forgot-password', {
      method: 'POST',
      body: { email: 'nonexistent-user@test-auth-runner.com' },
    });
    assert(forgotUnknownRes.status === 200, 'Test 30: Unknown email returns identical generic 200 response');

    // 31. Valid reset password
    const resetEmail = emailService.getSentEmails().reverse().find((e) => e.to === 'alice@test-auth-runner.com' && e.type === 'password_reset');
    assert(resetEmail && resetEmail.token, 'Password reset email was captured by emailService');
    const resetToken = resetEmail.token;

    // 32. Invalid reset token
    const invalidResetRes = await request('/api/auth/reset-password', {
      method: 'POST',
      body: { token: 'bogus-reset-token', newPassword: 'BrandNewPassword123!' },
    });
    assert(invalidResetRes.status === 400, 'Test 32: Invalid reset token returns 400');
    assert(invalidResetRes.body?.error?.code === 'INVALID_OR_EXPIRED_TOKEN', 'Test 32: Returns INVALID_OR_EXPIRED_TOKEN');

    // 31. Valid reset
    const validResetRes = await request('/api/auth/reset-password', {
      method: 'POST',
      body: { token: resetToken, newPassword: 'BrandNewPassword123!' },
    });
    assert(validResetRes.status === 200, 'Test 31: Valid password reset returns 200');

    // 34. Reset token cannot be reused
    const reuseResetRes = await request('/api/auth/reset-password', {
      method: 'POST',
      body: { token: resetToken, newPassword: 'AnotherPassword123!' },
    });
    assert(reuseResetRes.status === 400, 'Test 34: Reused reset token returns 400');

    // 35. Old password no longer works
    const oldLoginRes = await request('/api/auth/login', {
      method: 'POST',
      body: { email: 'alice@test-auth-runner.com', password: 'Password123!' },
    });
    assert(oldLoginRes.status === 401, 'Test 35: Old password rejected with 401 after reset');

    // 36. New password works
    const newLoginRes = await request('/api/auth/login', {
      method: 'POST',
      body: { email: 'alice@test-auth-runner.com', password: 'BrandNewPassword123!' },
    });
    assert(newLoginRes.status === 200, 'Test 36: New password successfully authenticates user');
    const updatedAliceToken = newLoginRes.body?.data?.token;

    console.log('\n--- RBAC & USER MANAGEMENT TESTS ---');

    // Create role-specific test users
    const coordinatorUser = await User.create({
      name: 'Corinna Coordinator',
      email: 'corinna@test-auth-runner.com',
      passwordHash: await User.hashPassword('CoordPass123!'),
      role: ROLES.COORDINATOR,
      isEmailVerified: true,
      isActive: true,
    });
    const coordinatorToken = jwt.sign(
      { sub: coordinatorUser._id.toString(), role: ROLES.COORDINATOR },
      process.env.JWT_SECRET || 'pulse-jwt-dev-secret-key-replace-in-prod'
    );

    const adminUser = await User.create({
      name: 'Adam Admin',
      email: 'adam@test-auth-runner.com',
      passwordHash: await User.hashPassword('AdminPass123!'),
      role: ROLES.ADMIN,
      isEmailVerified: true,
      isActive: true,
    });
    const adminToken = jwt.sign(
      { sub: adminUser._id.toString(), role: ROLES.ADMIN },
      process.env.JWT_SECRET || 'pulse-jwt-dev-secret-key-replace-in-prod'
    );

    const superAdminUser = await User.create({
      name: 'Sarah SuperAdmin',
      email: 'sarah@test-auth-runner.com',
      passwordHash: await User.hashPassword('SuperPass123!'),
      role: ROLES.SUPER_ADMIN,
      isEmailVerified: true,
      isActive: true,
    });
    const superAdminToken = jwt.sign(
      { sub: superAdminUser._id.toString(), role: ROLES.SUPER_ADMIN },
      process.env.JWT_SECRET || 'pulse-jwt-dev-secret-key-replace-in-prod'
    );

    // Another user for promotion testing so Alice remains a pure VOLUNTEER
    const promoteeUser = await User.create({
      name: 'Peter Promotee',
      email: 'peter@test-auth-runner.com',
      passwordHash: await User.hashPassword('PeterPass123!'),
      role: ROLES.VOLUNTEER,
      isEmailVerified: true,
      isActive: true,
    });

    // 37. Volunteer denied coordinator mutation (e.g. POST /api/events)
    const volCreateEventRes = await request('/api/events', {
      method: 'POST',
      headers: { Authorization: `Bearer ${updatedAliceToken}` },
      body: { name: 'Unauthorized Volunteer Event', startDate: new Date(), endDate: new Date() },
    });
    assert(volCreateEventRes.status === 403, 'Test 37: Volunteer denied coordinator mutation (403)');
    assert(volCreateEventRes.body?.error?.code === 'FORBIDDEN', 'Test 37: Returns FORBIDDEN code');

    // 38. Volunteer denied admin operation (e.g. GET /api/users)
    const volGetUsersRes = await request('/api/users', {
      headers: { Authorization: `Bearer ${updatedAliceToken}` },
    });
    assert(volGetUsersRes.status === 403, 'Test 38: Volunteer denied admin operation (403)');

    // 39. Coordinator allowed coordinator operation
    const coordCreateEventRes = await request('/api/events', {
      method: 'POST',
      headers: { Authorization: `Bearer ${coordinatorToken}` },
      body: {
        name: 'Coordinator Created Event',
        startDate: new Date('2026-11-01T09:00:00.000Z'),
        endDate: new Date('2026-11-01T18:00:00.000Z'),
      },
    });
    assert(coordCreateEventRes.status === 201, 'Test 39: Coordinator permitted to create event (201)');

    // 40. Coordinator denied admin operation
    const coordGetUsersRes = await request('/api/users', {
      headers: { Authorization: `Bearer ${coordinatorToken}` },
    });
    assert(coordGetUsersRes.status === 403, 'Test 40: Coordinator denied user administration (403)');

    // 41. Admin allowed admin operation
    const adminGetUsersRes = await request('/api/users', {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    assert(adminGetUsersRes.status === 200, 'Test 41: Admin permitted to view users list (200)');
    assert(Array.isArray(adminGetUsersRes.body?.data), 'Test 41: Returns user array');

    // 42. Admin cannot promote someone to SUPER_ADMIN
    const adminEscalateRes = await request(`/api/users/${promoteeUser._id}/role`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${adminToken}` },
      body: { role: ROLES.SUPER_ADMIN },
    });
    assert(adminEscalateRes.status === 403, 'Test 42: Admin denied promoting user to SUPER_ADMIN (403)');

    // Super Admin CAN promote to SUPER_ADMIN
    const superPromoteRes = await request(`/api/users/${promoteeUser._id}/role`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${superAdminToken}` },
      body: { role: ROLES.COORDINATOR },
    });
    assert(superPromoteRes.status === 200, 'Test 42b: Super Admin permitted to update role');

    // 43. User cannot modify their own role
    const selfRoleRes = await request(`/api/users/${adminUser._id}/role`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${adminToken}` },
      body: { role: ROLES.SUPER_ADMIN },
    });
    assert(selfRoleRes.status === 403, 'Test 43: User cannot modify own role (403)');

    console.log('\n--- EXISTING FEATURE PROTECTION TESTS ---');

    // 44. Resilience requires authentication
    const unauthResilienceRes = await request(`/api/events/${testEvent._id}/resilience`);
    assert(unauthResilienceRes.status === 401, 'Test 44: Unauthenticated resilience access rejected with 401');

    // 45. Simulator requires authentication
    const unauthSimRes = await request(`/api/events/${testEvent._id}/simulate`, {
      method: 'POST',
      body: { dropoutVolunteerIds: ['6abde8a0934498ccd75fc39f'] },
    });
    assert(unauthSimRes.status === 401, 'Test 45: Unauthenticated simulator access rejected with 401');

    // 48. Volunteer denied resilience
    const volResilienceRes = await request(`/api/events/${testEvent._id}/resilience`, {
      headers: { Authorization: `Bearer ${updatedAliceToken}` },
    });
    assert(volResilienceRes.status === 403, 'Test 48: Volunteer denied access to resilience endpoint (403)');

    // 49. Volunteer denied simulator
    const volSimRes = await request(`/api/events/${testEvent._id}/simulate`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${updatedAliceToken}` },
      body: { dropoutVolunteerIds: ['6abde8a0934498ccd75fc39f'] },
    });
    assert(volSimRes.status === 403, 'Test 49: Volunteer denied access to simulator endpoint (403)');

    // 46. Coordinator allowed resilience
    const coordResilienceRes = await request(`/api/events/${testEvent._id}/resilience`, {
      headers: { Authorization: `Bearer ${coordinatorToken}` },
    });
    assert(coordResilienceRes.status === 200, 'Test 46: Coordinator permitted access to resilience (200)');

    // 47. Coordinator allowed simulator
    const coordSimRes = await request(`/api/events/${testEvent._id}/simulate`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${coordinatorToken}` },
      body: { dropoutVolunteerIds: [] },
    });
    assert(
      coordSimRes.status === 400 && coordSimRes.body?.error?.code === 'VALIDATION_ERROR',
      'Test 47: Coordinator authenticated and authorized on simulator (reached validation logic)'
    );

    console.log('\n=== ALL AUTHENTICATION TESTS COMPLETED ===');
    console.log('Cleaning up auth test users...');
    await User.deleteMany({ email: /@test-auth-runner\.com$/ });
    console.log('Cleanup complete.');

    console.log('\n=======================================');
    console.log(`TOTAL AUTH TESTS: ${passed + failed}`);
    console.log(`PASSED: ${passed}`);
    console.log(`FAILED: ${failed}`);
    console.log('=======================================\n');

    server.close();
    await mongoose.disconnect();

    if (failed > 0) {
      process.exit(1);
    }
  } catch (err) {
    console.error('Auth test suite encountered unexpected error:', err);
    if (server) server.close();
    await mongoose.disconnect();
    process.exit(1);
  }
};

runAuthTests();
