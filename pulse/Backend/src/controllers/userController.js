import User from '../models/User.js';
import { ROLES } from '../utils/constants.js';
import { sendSuccess, sendError } from '../utils/response.js';

/**
 * List all users (Admin/SuperAdmin only)
 */
export const getUsers = async (req, res, next) => {
  try {
    const { role, isActive, search } = req.query;
    const filter = {};

    if (role && Object.values(ROLES).includes(role)) {
      filter.role = role;
    }

    if (isActive !== undefined) {
      filter.isActive = isActive === 'true';
    }

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }

    const users = await User.find(filter).sort({ createdAt: -1 });
    return sendSuccess(res, users, 200);
  } catch (error) {
    next(error);
  }
};

/**
 * Get single user by ID
 */
export const getUserById = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const user = await User.findById(userId);

    if (!user) {
      return sendError(res, 'User not found', 'USER_NOT_FOUND', 404);
    }

    return sendSuccess(res, user, 200);
  } catch (error) {
    next(error);
  }
};

/**
 * Update user active status (deactivate/activate user)
 */
export const updateUserStatus = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const { isActive } = req.body || {};

    if (typeof isActive !== 'boolean') {
      return sendError(res, 'isActive must be a boolean', 'VALIDATION_ERROR', 400);
    }

    // Prevent modifying own status
    if (req.user._id.toString() === userId) {
      return sendError(res, 'You cannot deactivate your own account', 'FORBIDDEN', 403);
    }

    const targetUser = await User.findById(userId);
    if (!targetUser) {
      return sendError(res, 'User not found', 'USER_NOT_FOUND', 404);
    }

    // Admin cannot deactivate a Super Admin
    if (req.user.role === ROLES.ADMIN && targetUser.role === ROLES.SUPER_ADMIN) {
      return sendError(res, 'Admins cannot modify Super Admin accounts', 'FORBIDDEN', 403);
    }

    targetUser.isActive = isActive;
    await targetUser.save();

    return sendSuccess(res, targetUser, 200);
  } catch (error) {
    next(error);
  }
};

/**
 * Update user role
 */
export const updateUserRole = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const { role } = req.body || {};

    if (!role || !Object.values(ROLES).includes(role)) {
      return sendError(
        res,
        `Role must be one of: [${Object.values(ROLES).join(', ')}]`,
        'VALIDATION_ERROR',
        400
      );
    }

    // Prevent modifying own role
    if (req.user._id.toString() === userId) {
      return sendError(res, 'You cannot modify your own role', 'FORBIDDEN', 403);
    }

    const targetUser = await User.findById(userId);
    if (!targetUser) {
      return sendError(res, 'User not found', 'USER_NOT_FOUND', 404);
    }

    // Admin cannot modify a Super Admin
    if (req.user.role === ROLES.ADMIN && targetUser.role === ROLES.SUPER_ADMIN) {
      return sendError(res, 'Admins cannot modify Super Admin accounts', 'FORBIDDEN', 403);
    }

    // Admin cannot promote anyone to Super Admin
    if (req.user.role === ROLES.ADMIN && role === ROLES.SUPER_ADMIN) {
      return sendError(res, 'Only Super Admins can promote users to Super Admin', 'FORBIDDEN', 403);
    }

    targetUser.role = role;
    await targetUser.save();

    return sendSuccess(res, targetUser, 200);
  } catch (error) {
    next(error);
  }
};

export default {
  getUsers,
  getUserById,
  updateUserStatus,
  updateUserRole,
};
