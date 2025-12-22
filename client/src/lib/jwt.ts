import jwt from 'jsonwebtoken';

// Use environment variable for JWT secret in production
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-this-in-production';
const JWT_EXPIRES_IN = '7d'; // Token expires in 7 days

export interface JWTPayload {
  userId: string;
  email: string;
  role: string;
  iat?: number;
  exp?: number;
}

/**
 * Generate JWT token for authenticated user
 */
export const generateToken = (userId: string, email: string, role: string): string => {
  const payload: JWTPayload = {
    userId,
    email,
    role
  };

  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN
  });
};

/**
 * Verify and decode JWT token
 */
export const verifyToken = (token: string): JWTPayload | null => {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as JWTPayload;
    return decoded;
  } catch (error) {
    console.error('JWT verification failed:', error);
    return null;
  }
};

/**
 * Generate verification token for email verification
 * Using crypto random string instead of JWT for simplicity
 */
export const generateVerificationToken = (): string => {
  // Generate a random 32-byte hex string
  const crypto = require('crypto');
  return crypto.randomBytes(32).toString('hex');
};

/**
 * Generate reset password token
 * Using crypto random string instead of JWT for simplicity
 */
export const generateResetToken = (): string => {
  // Generate a random 32-byte hex string
  const crypto = require('crypto');
  return crypto.randomBytes(32).toString('hex');
};
