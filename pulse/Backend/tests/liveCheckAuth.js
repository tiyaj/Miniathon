import dotenv from 'dotenv';
dotenv.config();

import mongoose from 'mongoose';
import http from 'http';
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

async function runLiveAuthVerification() {
  console.log('\n=== STARTING LIVE AUTHENTICATION VERIFICATION ===');
  await connectDB();
  emailService.setMockMode(true); // capture in memory during test

  server = http.createServer(app);
  await new Promise((resolve) => server.listen(0, resolve));
  const port = server.address().port;
  baseUrl = `http://127.0.0.1:${port}`;

  const cleanEmail = `live.test.user.${Date.now()}@example.com`;
  const adminEmail = `live.admin.user.${Date.now()}@example.com`;

  try {
    // 1. Register a test user
    console.log('1. Registering test volunteer user...');
    emailService.clearSentEmails();
    const regRes = await request('/api/auth/register', {
      method: 'POST',
      body: {
        name: 'Live Test Volunteer',
        email: cleanEmail,
        password: 'LiveSecurePassword123!',
      },
    });
    if (regRes.status !== 201) throw new Error(`Registration failed: ${regRes.status}`);
    console.log('   -> Registration returned 201 Created');

    // 2. Confirm user created
    console.log('2. Confirming user created in MongoDB...');
    const userInDb = await User.findOne({ email: cleanEmail }).select('+passwordHash');
    if (!userInDb) throw new Error('User not found in MongoDB');
    console.log('   -> Confirmed user created with role:', userInDb.role);

    // 3. Confirm password is hashed
    console.log('3. Confirming password is hashed...');
    const isHashed = userInDb.passwordHash.startsWith('$2') && userInDb.passwordHash.length > 30;
    if (!isHashed) throw new Error('Password was not hashed properly');
    console.log('   -> Confirmed password stored as bcrypt hash');

    // 4. Verify email through verification flow
    console.log('4. Verifying email through token flow...');
    const sentEmail = emailService.getSentEmails().find((e) => e.to === cleanEmail);
    if (!sentEmail || !sentEmail.token) throw new Error('Verification token not captured');
    const verifRes = await request('/api/auth/verify-email', {
      method: 'POST',
      body: { token: sentEmail.token },
    });
    if (verifRes.status !== 200) throw new Error('Email verification failed');
    console.log('   -> Email verified successfully (200 OK)');

    // 5 & 6. Login and capture JWT in memory only
    console.log('5 & 6. Logging in and capturing JWT in memory...');
    const loginRes = await request('/api/auth/login', {
      method: 'POST',
      body: {
        email: cleanEmail,
        password: 'LiveSecurePassword123!',
      },
    });
    if (loginRes.status !== 200 || !loginRes.body?.data?.token) throw new Error('Login failed');
    const volunteerToken = loginRes.body.data.token;
    console.log('   -> Logged in successfully; JWT captured in memory');

    // 7. Call /api/auth/me
    console.log('7. Calling /api/auth/me with bearer token...');
    const meRes = await request('/api/auth/me', {
      headers: { Authorization: `Bearer ${volunteerToken}` },
    });
    if (meRes.status !== 200 || meRes.body?.data?.user?.email !== cleanEmail) {
      throw new Error('/api/auth/me failed');
    }
    console.log('   -> /api/auth/me returned 200 OK with authenticated user profile');

    // 8. Access an allowed coordinator endpoint with proper role
    console.log('8. Promoting user to COORDINATOR and accessing coordinator endpoint...');
    userInDb.role = ROLES.COORDINATOR;
    await userInDb.save();
    // Re-login to get updated token
    const coordLoginRes = await request('/api/auth/login', {
      method: 'POST',
      body: {
        email: cleanEmail,
        password: 'LiveSecurePassword123!',
      },
    });
    const coordinatorToken = coordLoginRes.body.data.token;
    const coordRes = await request('/api/events', {
      method: 'POST',
      headers: { Authorization: `Bearer ${coordinatorToken}` },
      body: {
        name: 'Live Verified Test Event',
        startDate: new Date('2026-12-01T09:00:00.000Z'),
        endDate: new Date('2026-12-01T18:00:00.000Z'),
      },
    });
    if (coordRes.status !== 201) throw new Error(`Coordinator event creation failed: ${coordRes.status}`);
    const createdEventId = coordRes.body.data.id || coordRes.body.data._id;
    console.log('   -> Coordinator successfully created event (201 Created)');

    // 9 & 10. Attempt an admin endpoint as coordinator -> confirm 403
    console.log('9 & 10. Attempting admin endpoint as coordinator...');
    const coordAdminRes = await request('/api/users', {
      headers: { Authorization: `Bearer ${coordinatorToken}` },
    });
    if (coordAdminRes.status !== 403) throw new Error(`Expected 403, got ${coordAdminRes.status}`);
    console.log('   -> Confirmed coordinator denied admin endpoint (403 FORBIDDEN)');

    // 11 & 12. Login as admin -> confirm admin endpoint works
    console.log('11 & 12. Logging in as admin and accessing admin endpoint...');
    const adminUser = await User.create({
      name: 'Live Admin User',
      email: adminEmail,
      passwordHash: await User.hashPassword('AdminLivePass123!'),
      role: ROLES.ADMIN,
      isEmailVerified: true,
      isActive: true,
    });
    const adminLoginRes = await request('/api/auth/login', {
      method: 'POST',
      body: {
        email: adminEmail,
        password: 'AdminLivePass123!',
      },
    });
    const adminToken = adminLoginRes.body.data.token;
    const adminUsersRes = await request('/api/users', {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    if (adminUsersRes.status !== 200 || !Array.isArray(adminUsersRes.body?.data)) {
      throw new Error(`Admin users list failed: ${adminUsersRes.status}`);
    }
    console.log('   -> Confirmed admin endpoint works (200 OK, users array returned)');

    // 13. Confirm resilience requires authentication
    console.log('13. Confirming resilience requires authentication...');
    const unauthResil = await request(`/api/events/${createdEventId}/resilience`);
    if (unauthResil.status !== 401) throw new Error(`Expected 401, got ${unauthResil.status}`);
    console.log('   -> Confirmed unauthenticated resilience rejected (401 AUTH_REQUIRED)');

    // 14. Confirm simulator requires authentication
    console.log('14. Confirming simulator requires authentication...');
    const unauthSim = await request(`/api/events/${createdEventId}/simulate`, {
      method: 'POST',
      body: { dropoutVolunteerIds: ['6abde8a0934498ccd75fc39f'] },
    });
    if (unauthSim.status !== 401) throw new Error(`Expected 401, got ${unauthSim.status}`);
    console.log('   -> Confirmed unauthenticated simulator rejected (401 AUTH_REQUIRED)');

    // 15. Confirm volunteer cannot access coordinator-only features
    console.log('15. Confirming volunteer cannot access coordinator-only features...');
    // Demote user back to VOLUNTEER in MongoDB
    userInDb.role = ROLES.VOLUNTEER;
    await userInDb.save();
    const volResilRes = await request(`/api/events/${createdEventId}/resilience`, {
      headers: { Authorization: `Bearer ${coordinatorToken}` }, // Even with old coordinator token, DB reload rejects!
    });
    if (volResilRes.status !== 403) throw new Error(`Expected 403, got ${volResilRes.status}`);
    console.log('   -> Confirmed volunteer denied resilience access (403 FORBIDDEN)');

    // 16. Confirm inactive account is rejected
    console.log('16. Confirming inactive account is rejected...');
    userInDb.isActive = false;
    await userInDb.save();
    const inactiveRes = await request('/api/auth/me', {
      headers: { Authorization: `Bearer ${coordinatorToken}` },
    });
    if (inactiveRes.status !== 403) throw new Error(`Expected 403, got ${inactiveRes.status}`);
    console.log('   -> Confirmed inactive account rejected (403 ACCOUNT_INACTIVE)');

    console.log('\n>>> LIVE AUTHENTICATION VERIFICATION: ALL 16 CHECKS PASSED SUCCESSFULLY <<<\n');
  } finally {
    console.log('Cleaning up live test entities...');
    await User.deleteMany({ email: { $in: [cleanEmail, adminEmail] } });
    await Event.deleteMany({ name: 'Live Verified Test Event' });
    server.close();
    await mongoose.disconnect();
    console.log('Cleanup complete.');
  }
}

runLiveAuthVerification().catch((err) => {
  console.error('FATAL: Live verification failed:', err);
  if (server) server.close();
  process.exit(1);
});
