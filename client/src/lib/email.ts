import nodemailer from 'nodemailer';

// Email configuration - using Gmail SMTP
// For production, use environment variables
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER || 'your-email@gmail.com', // Add to .env.local
    pass: process.env.EMAIL_PASSWORD || 'your-app-password' // Use App Password for Gmail
  }
});

export const sendVerificationEmail = async (email: string, verificationToken: string) => {
  const verificationUrl = `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/auth/verify-email?token=${verificationToken}`;

  const mailOptions = {
    from: '"CSMS Support" <noreply@csms.com>',
    to: email,
    subject: 'Verify Your Email - CSMS',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #2563eb 0%, #1e40af 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
          .button { display: inline-block; padding: 15px 30px; background: #2563eb; color: white; text-decoration: none; border-radius: 8px; font-weight: bold; margin: 20px 0; }
          .footer { text-align: center; margin-top: 20px; font-size: 12px; color: #6b7280; }
          .link { color: #2563eb; word-break: break-all; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Welcome to CSMS!</h1>
          </div>
          <div class="content">
            <h2>Verify Your Email Address</h2>
            <p>Thank you for registering with Construction Supply Management System (CSMS).</p>
            <p>Please click the button below to verify your email address and activate your account:</p>
            <p style="text-align: center;">
              <a href="${verificationUrl}" class="button">Verify Email</a>
            </p>
            <p>Or copy and paste this link into your browser:</p>
            <p class="link">${verificationUrl}</p>
            <p><strong>This link will expire in 24 hours.</strong></p>
            <p>If you didn't create an account with CSMS, please ignore this email.</p>
          </div>
          <div class="footer">
            <p>© 2025 CSMS - Construction Supply Management System</p>
            <p>This is an automated email, please do not reply.</p>
          </div>
        </div>
      </body>
      </html>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('✅ Verification email sent to:', email);
    return { success: true };
  } catch (error) {
    console.error('❌ Failed to send verification email:', error);
    return { success: false, error };
  }
};

export const sendPasswordResetEmail = async (email: string, resetToken: string) => {
  const resetUrl = `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/reset-password?token=${resetToken}`;

  const mailOptions = {
    from: '"CSMS Support" <noreply@csms.com>',
    to: email,
    subject: 'Reset Your Password - CSMS',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #2563eb 0%, #1e40af 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
          .button { display: inline-block; padding: 15px 30px; background: #2563eb; color: white; text-decoration: none; border-radius: 8px; font-weight: bold; margin: 20px 0; }
          .footer { text-align: center; margin-top: 20px; font-size: 12px; color: #6b7280; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Password Reset Request</h1>
          </div>
          <div class="content">
            <p>You requested to reset your password for your CSMS account.</p>
            <p>Click the button below to reset your password:</p>
            <p style="text-align: center;">
              <a href="${resetUrl}" class="button">Reset Password</a>
            </p>
            <p><strong>This link will expire in 1 hour.</strong></p>
            <p>If you didn't request this, please ignore this email and your password will remain unchanged.</p>
          </div>
          <div class="footer">
            <p>© 2025 CSMS - Construction Supply Management System</p>
          </div>
        </div>
      </body>
      </html>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('✅ Password reset email sent to:', email);
    return { success: true };
  } catch (error) {
    console.error('❌ Failed to send password reset email:', error);
    return { success: false, error };
  }
};
