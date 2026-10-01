import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { sendError } from '../utils/response.js';

/**
 * Authentication middleware to verify JWT and attach active user to req.user
 */
export const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return sendError(res, 'Authentication token is required', 'AUTH_REQUIRED', 401);
    }

    const token = authHeader.split(' ')[1]?.trim();
    if (!token) {
      return sendError(res, 'Authentication token is required', 'AUTH_REQUIRED', 401);
    }

    const secret = process.env.JWT_SECRET || 'pulse-jwt-dev-secret-key-replace-in-prod';
    let decoded;

    try {
      decoded = jwt.verify(token, secret);
    } catch (jwtErr) {
      if (jwtErr.name === 'TokenExpiredError') {
        return sendError(res, 'Authentication token has expired', 'TOKEN_EXPIRED', 401);
      }
      return sendError(res, 'Invalid authentication token', 'INVALID_TOKEN', 401);
    }

    if (!decoded || !decoded.sub) {
      return sendError(res, 'Invalid authentication token claims', 'INVALID_TOKEN', 401);
    }

    // Load active user from database to ensure up-to-date status and permissions
    const user = await User.findById(decoded.sub);
    if (!user) {
      return sendError(res, 'User associated with this token no longer exists', 'INVALID_TOKEN', 401);
    }

    if (!user.isActive) {
      return sendError(res, 'User account is inactive', 'ACCOUNT_INACTIVE', 403);
    }

    req.user = user;
    next();
  } catch (error) {
    next(error);
  }
};

/**
 * Role-Based Access Control (RBAC) authorization middleware
 * @param  {...string} allowedRoles - List of roles permitted to access the route
 */
export const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return sendError(res, 'Authentication required before authorization check', 'AUTH_REQUIRED', 401);
    }

    if (!allowedRoles.includes(req.user.role)) {
      return sendError(
        res,
        `Access denied. Requires one of roles: [${allowedRoles.join(', ')}]`,
        'FORBIDDEN',
        403
      );
    }

    next();
  };
};

export default {
  authenticate,
  authorize,
};
