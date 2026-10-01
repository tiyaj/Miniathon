import {
  register as registerUser,
  login as loginUser,
  verifyEmail as verifyUserEmail,
  forgotPassword as sendResetEmail,
  resetPassword as resetUserPassword,
} from '../services/authService.js';
import { sendSuccess, sendError } from '../utils/response.js';

export const register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body || {};
    const result = await registerUser({ name, email, password });
    return sendSuccess(
      res,
      {
        message: 'Registration successful. Please check your email to verify your account.',
        user: result.user,
      },
      201
    );
  } catch (error) {
    if (error.statusCode) {
      return sendError(res, error.message, error.code, error.statusCode);
    }
    next(error);
  }
};

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body || {};
    const result = await loginUser({ email, password });
    return sendSuccess(res, result, 200);
  } catch (error) {
    if (error.statusCode) {
      return sendError(res, error.message, error.code, error.statusCode);
    }
    next(error);
  }
};

export const getMe = async (req, res) => {
  return sendSuccess(res, { user: req.user.toJSON() }, 200);
};

export const verifyEmail = async (req, res, next) => {
  try {
    const token = req.body?.token || req.query?.token;
    const result = await verifyUserEmail(token);
    return sendSuccess(res, result, 200);
  } catch (error) {
    if (error.statusCode) {
      return sendError(res, error.message, error.code, error.statusCode);
    }
    next(error);
  }
};

export const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body || {};
    const result = await sendResetEmail(email);
    return sendSuccess(res, result, 200);
  } catch (error) {
    if (error.statusCode) {
      return sendError(res, error.message, error.code, error.statusCode);
    }
    next(error);
  }
};

export const resetPassword = async (req, res, next) => {
  try {
    const { token, newPassword } = req.body || {};
    const result = await resetUserPassword({ token, newPassword });
    return sendSuccess(res, result, 200);
  } catch (error) {
    if (error.statusCode) {
      return sendError(res, error.message, error.code, error.statusCode);
    }
    next(error);
  }
};

export default {
  register,
  login,
  getMe,
  verifyEmail,
  forgotPassword,
  resetPassword,
};
