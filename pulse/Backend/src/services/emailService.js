import { Resend } from 'resend';

let resendClient = null;

const getResendClient = () => {
  if (!resendClient && process.env.RESEND_API_KEY) {
    resendClient = new Resend(process.env.RESEND_API_KEY);
  }
  return resendClient;
};

// In-memory test store for sent emails to prevent spamming during tests
let mockMode = process.env.NODE_ENV === 'test';
const mockSentEmails = [];

export const setMockMode = (enabled) => {
  mockMode = enabled;
};

export const getSentEmails = () => [...mockSentEmails];

export const getLastSentEmail = () => mockSentEmails[mockSentEmails.length - 1] || null;

export const clearSentEmails = () => {
  mockSentEmails.length = 0;
};

/**
 * Send email verification link
 */
export const sendVerificationEmail = async ({ to, name, token }) => {
  const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
  const verificationUrl = `${clientUrl}/verify-email?token=${token}`;
  const fromEmail = process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev';

  const emailData = {
    from: fromEmail,
    to,
    subject: 'Verify your PULSE account',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
        <h2 style="color: #2563eb;">Welcome to PULSE, ${name}!</h2>
        <p>Thank you for registering. Please click the button below to verify your email address and activate your account:</p>
        <div style="margin: 30px 0; text-align: center;">
          <a href="${verificationUrl}" style="background-color: #2563eb; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">Verify Email</a>
        </div>
        <p style="color: #666; font-size: 14px;">Or copy and paste this link into your browser:</p>
        <p style="color: #2563eb; font-size: 14px; word-break: break-all;">${verificationUrl}</p>
        <p style="color: #999; font-size: 12px; margin-top: 30px;">This link will expire in 24 hours. If you did not sign up for PULSE, please ignore this email.</p>
      </div>
    `,
    text: `Welcome to PULSE, ${name}!\n\nPlease verify your email by visiting: ${verificationUrl}\n\nThis link will expire in 24 hours.`,
    token,
    type: 'verification',
  };

  if (mockMode) {
    mockSentEmails.push({ ...emailData, sentAt: new Date() });
    return { success: true, id: `mock-${Date.now()}` };
  }

  const client = getResendClient();
  if (!client) {
    // If no client available and not mock mode, record fallback
    mockSentEmails.push({ ...emailData, sentAt: new Date(), fallback: true });
    return { success: true, id: `fallback-${Date.now()}` };
  }

  const result = await client.emails.send({
    from: emailData.from,
    to: emailData.to,
    subject: emailData.subject,
    html: emailData.html,
    text: emailData.text,
  });

  return { success: true, id: result.data?.id };
};

/**
 * Send password reset link
 */
export const sendPasswordResetEmail = async ({ to, name, token }) => {
  const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
  const resetUrl = `${clientUrl}/reset-password?token=${token}`;
  const fromEmail = process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev';

  const emailData = {
    from: fromEmail,
    to,
    subject: 'Reset your PULSE password',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
        <h2 style="color: #2563eb;">Password Reset Request</h2>
        <p>Hello ${name || 'there'},</p>
        <p>We received a request to reset your PULSE account password. Click the button below to choose a new password:</p>
        <div style="margin: 30px 0; text-align: center;">
          <a href="${resetUrl}" style="background-color: #2563eb; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">Reset Password</a>
        </div>
        <p style="color: #666; font-size: 14px;">Or copy and paste this link into your browser:</p>
        <p style="color: #2563eb; font-size: 14px; word-break: break-all;">${resetUrl}</p>
        <p style="color: #999; font-size: 12px; margin-top: 30px;">This link will expire in 1 hour. If you did not request a password reset, you can safely ignore this email.</p>
      </div>
    `,
    text: `Hello ${name || 'there'},\n\nReset your PULSE password by visiting: ${resetUrl}\n\nThis link will expire in 1 hour.`,
    token,
    type: 'password_reset',
  };

  if (mockMode) {
    mockSentEmails.push({ ...emailData, sentAt: new Date() });
    return { success: true, id: `mock-${Date.now()}` };
  }

  const client = getResendClient();
  if (!client) {
    mockSentEmails.push({ ...emailData, sentAt: new Date(), fallback: true });
    return { success: true, id: `fallback-${Date.now()}` };
  }

  const result = await client.emails.send({
    from: emailData.from,
    to: emailData.to,
    subject: emailData.subject,
    html: emailData.html,
    text: emailData.text,
  });

  return { success: true, id: result.data?.id };
};

export default {
  sendVerificationEmail,
  sendPasswordResetEmail,
  setMockMode,
  getSentEmails,
  getLastSentEmail,
  clearSentEmails,
};
