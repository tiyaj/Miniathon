import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { ROLES } from '../utils/constants.js';
import { sendVerificationEmail, sendPasswordResetEmail } from './emailService.js';

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const hashToken = (token) => {
  return crypto.createHash('sha256').update(token).digest('hex');
};

/**
 * Generate a JWT token containing minimal claims
 */
export const generateToken = (user) => {
  const secret = process.env.JWT_SECRET || 'pulse-jwt-dev-secret-key-replace-in-prod';
  const expiresIn = process.env.JWT_EXPIRES_IN || '1h';

  const payload = {
    sub: user._id.toString(),
    role: user.role,
  };

  return jwt.sign(payload, secret, { expiresIn });
};

/**
 * Register a new volunteer user
 */
export const register = async ({ name, email, password }) => {
  if (!name || typeof name !== 'string' || name.trim().length < 2) {
    const error = new Error('Name must be at least 2 characters long');
    error.statusCode = 400;
    error.code = 'VALIDATION_ERROR';
    throw error;
  }

  if (!email || typeof email !== 'string' || !emailRegex.test(email.trim())) {
    const error = new Error('A valid email address is required');
    error.statusCode = 400;
    error.code = 'INVALID_EMAIL';
    throw error;
  }

  if (!password || typeof password !== 'string' || password.length < 6) {
    const error = new Error('Password must be at least 6 characters long');
    error.statusCode = 400;
    error.code = 'WEAK_PASSWORD';
    throw error;
  }

  const normalizedEmail = email.trim().toLowerCase();

  // Check if email already registered
  const existingUser = await User.findOne({ email: normalizedEmail });
  if (existingUser) {
    const error = new Error('An account with this email address already exists');
    error.statusCode = 409;
    error.code = 'DUPLICATE_EMAIL';
    throw error;
  }

  // Hash password
  const passwordHash = await User.hashPassword(password);

  // Generate email verification token (32 bytes hex)
  const rawVerificationToken = crypto.randomBytes(32).toString('hex');
  const verificationTokenHash = hashToken(rawVerificationToken);
  const verificationTokenExpiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

  // Public registration is ALWAYS forced to VOLUNTEER role
  const user = new User({
    name: name.trim(),
    email: normalizedEmail,
    passwordHash,
    role: ROLES.VOLUNTEER,
    isEmailVerified: false,
    isActive: true,
    verificationTokenHash,
    verificationTokenExpiresAt,
  });

  await user.save();

  // Send verification email via Resend (or in-memory mock during tests)
  try {
    await sendVerificationEmail({
      to: user.email,
      name: user.name,
      token: rawVerificationToken,
    });
  } catch (emailErr) {
    // Log but don't fail registration if external mailer fails
    console.warn(`Verification email delivery failed: ${emailErr.message}`);
  }

  return { user };
};

/**
 * Authenticate an existing user and generate JWT
 */
export const login = async ({ email, password }) => {
  if (!email || !password) {
    const error = new Error('Email and password are required');
    error.statusCode = 400;
    error.code = 'VALIDATION_ERROR';
    throw error;
  }

  const normalizedEmail = email.trim().toLowerCase();
  const user = await User.findOne({ email: normalizedEmail }).select('+passwordHash');

  if (!user) {
    const error = new Error('Invalid email or password');
    error.statusCode = 401;
    error.code = 'INVALID_CREDENTIALS';
    throw error;
  }

  const isPasswordValid = await user.comparePassword(password);
  if (!isPasswordValid) {
    const error = new Error('Invalid email or password');
    error.statusCode = 401;
    error.code = 'INVALID_CREDENTIALS';
    throw error;
  }

  if (!user.isActive) {
    const error = new Error('Your account has been deactivated. Please contact an administrator.');
    error.statusCode = 403;
    error.code = 'ACCOUNT_INACTIVE';
    throw error;
  }

  // Policy: Login is blocked until email verification
  if (!user.isEmailVerified) {
    const error = new Error('Please verify your email before logging in. Check your inbox for the verification link.');
    error.statusCode = 403;
    error.code = 'EMAIL_NOT_VERIFIED';
    throw error;
  }

  const token = generateToken(user);

  return {
    user: user.toJSON(),
    token,
  };
};

/**
 * Verify a user's email with token
 */
export const verifyEmail = async (token) => {
  if (!token || typeof token !== 'string') {
    const error = new Error('Verification token is required');
    error.statusCode = 400;
    error.code = 'INVALID_OR_EXPIRED_TOKEN';
    throw error;
  }

  const hashedToken = hashToken(token.trim());

  const user = await User.findOne({
    verificationTokenHash: hashedToken,
    verificationTokenExpiresAt: { $gt: new Date() },
  });

  if (!user) {
    const error = new Error('Invalid or expired verification token');
    error.statusCode = 400;
    error.code = 'INVALID_OR_EXPIRED_TOKEN';
    throw error;
  }

  user.isEmailVerified = true;
  user.verificationTokenHash = undefined;
  user.verificationTokenExpiresAt = undefined;
  await user.save();

  return {
    message: 'Email verified successfully. You can now log in.',
    user: user.toJSON(),
  };
};

/**
 * Request password reset instructions
 */
export const forgotPassword = async (email) => {
  const genericMessage = 'If an account exists for that email, password reset instructions have been sent.';

  if (!email || typeof email !== 'string') {
    return { message: genericMessage };
  }

  const normalizedEmail = email.trim().toLowerCase();
  const user = await User.findOne({ email: normalizedEmail });

  if (user && user.isActive) {
    const rawResetToken = crypto.randomBytes(32).toString('hex');
    const resetPasswordTokenHash = hashToken(rawResetToken);
    const resetPasswordExpiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    user.resetPasswordTokenHash = resetPasswordTokenHash;
    user.resetPasswordExpiresAt = resetPasswordExpiresAt;
    await user.save();

    try {
      await sendPasswordResetEmail({
        to: user.email,
        name: user.name,
        token: rawResetToken,
      });
    } catch (emailErr) {
      console.warn(`Password reset email delivery failed: ${emailErr.message}`);
    }
  }

  return { message: genericMessage };
};

/**
 * Reset password using token
 */
export const resetPassword = async ({ token, newPassword }) => {
  if (!token || typeof token !== 'string') {
    const error = new Error('Reset token is required');
    error.statusCode = 400;
    error.code = 'INVALID_OR_EXPIRED_TOKEN';
    throw error;
  }

  if (!newPassword || typeof newPassword !== 'string' || newPassword.length < 6) {
    const error = new Error('New password must be at least 6 characters long');
    error.statusCode = 400;
    error.code = 'WEAK_PASSWORD';
    throw error;
  }

  const hashedToken = hashToken(token.trim());

  const user = await User.findOne({
    resetPasswordTokenHash: hashedToken,
    resetPasswordExpiresAt: { $gt: new Date() },
  });

  if (!user) {
    const error = new Error('Invalid or expired password reset token');
    error.statusCode = 400;
    error.code = 'INVALID_OR_EXPIRED_TOKEN';
    throw error;
  }

  user.passwordHash = await User.hashPassword(newPassword);
  user.resetPasswordTokenHash = undefined;
  user.resetPasswordExpiresAt = undefined;
  await user.save();

  return {
    message: 'Password has been reset successfully. You can now log in with your new password.',
    user: user.toJSON(),
  };
};

export default {
  register,
  login,
  verifyEmail,
  forgotPassword,
  resetPassword,
  generateToken,
};
