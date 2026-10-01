import jwt from 'jsonwebtoken';
import User from '../src/models/User.js';
import { ROLES } from '../src/utils/constants.js';

let cachedUsers = {};
let cachedTokens = {};
let interceptorEnabled = false;

export const ensureTestUser = async (role = ROLES.COORDINATOR) => {
  const roleKey = role.toLowerCase();
  const email = `test.${roleKey}@pulse-testing.local`;

  let user = await User.findOne({ email });
  if (!user) {
    const passwordHash = await User.hashPassword('PulseTestPassword123!');
    user = await User.create({
      name: `Test ${role}`,
      email,
      passwordHash,
      role,
      isEmailVerified: true,
      isActive: true,
    });
  } else if (!user.isActive || !user.isEmailVerified || user.role !== role) {
    user.isActive = true;
    user.isEmailVerified = true;
    user.role = role;
    await user.save();
  }

  const secret = process.env.JWT_SECRET || 'pulse-jwt-dev-secret-key-replace-in-prod';
  const token = jwt.sign({ sub: user._id.toString(), role: user.role }, secret, { expiresIn: '2h' });

  cachedUsers[role] = user;
  cachedTokens[role] = token;

  return { user, token };
};

export const getAuthHeaders = async (role = ROLES.COORDINATOR) => {
  const { token } = await ensureTestUser(role);
  return {
    Authorization: `Bearer ${token}`,
  };
};

export const cleanupTestUsers = async () => {
  await User.deleteMany({ email: /@pulse-testing\.local$/ });
};

/**
 * Automatically authenticates all test requests to localhost with a Coordinator JWT token
 * unless an explicit Authorization header (or empty Authorization) is supplied.
 */
export const enableTestAuthInterceptor = async (role = ROLES.COORDINATOR) => {
  if (interceptorEnabled) return;
  interceptorEnabled = true;

  const originalFetch = globalThis.fetch;
  globalThis.fetch = async (input, init = {}) => {
    try {
      const urlStr = typeof input === 'string' ? input : input?.url || '';
      const isLocalPulseRequest = urlStr.includes('127.0.0.1') || urlStr.includes('localhost');

      if (isLocalPulseRequest) {
        let headers = init.headers;
        let hasAuth = false;

        if (headers) {
          if (typeof headers.has === 'function') {
            hasAuth = headers.has('Authorization') || headers.has('authorization');
          } else if (Array.isArray(headers)) {
            hasAuth = headers.some(([k]) => k.toLowerCase() === 'authorization');
          } else if (typeof headers === 'object') {
            hasAuth = Object.keys(headers).some((k) => k.toLowerCase() === 'authorization');
          }
        }

        // If no explicit authorization header was given, attach valid coordinator token
        if (!hasAuth) {
          const auth = await getAuthHeaders(role);
          if (headers instanceof Headers) {
            headers.set('Authorization', auth.Authorization);
          } else if (Array.isArray(headers)) {
            headers.push(['Authorization', auth.Authorization]);
          } else {
            headers = { ...(headers || {}), ...auth };
          }
          init = { ...init, headers };
        }
      }
    } catch (e) {
      // Continue without modifying if error
    }

    return originalFetch(input, init);
  };
};

export default {
  ensureTestUser,
  getAuthHeaders,
  cleanupTestUsers,
  enableTestAuthInterceptor,
};
