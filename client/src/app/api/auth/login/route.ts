import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User.js';
import { generateToken } from '@/lib/jwt';

// Define types for User document methods
interface UserDocument {
  _id: any;
  email: string;
  password: string;
  role: 'customer' | 'admin';
  profile?: {
    firstName?: string;
    lastName?: string;
    phone?: string;
    company?: string;
  };
  addresses: any[];
  isActive: boolean;
  emailVerified: boolean;
  lastLogin?: Date;
  fullName: string;
  comparePassword: (candidatePassword: string) => Promise<boolean>;
  save: () => Promise<any>;
}

export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const { email, password } = await request.json();

    // Validate required fields
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    // Find user by email
    const user = await User.findOne({ email: email.toLowerCase() }) as UserDocument | null;
    
    if (!user) {
      return NextResponse.json(
        { 
          error: 'User not found', 
          errorType: 'USER_NOT_FOUND',
          message: 'No account found with this email address'
        },
        { status: 404 }
      );
    }

    // Check if user is active
    if (!user.isActive) {
      return NextResponse.json(
        { 
          error: 'Account is disabled. Please contact support.',
          errorType: 'ACCOUNT_DISABLED'
        },
        { status: 403 }
      );
    }

    // Skip email verification for hardcoded admin account
    const isHardcodedAdmin = user.email === 'admin@csms.com';
    
    // Check if email is verified (skip for hardcoded admin)
    if (!isHardcodedAdmin && !user.emailVerified) {
      return NextResponse.json(
        { 
          error: 'Please verify your email before logging in. Check your inbox for the verification link.',
          errorType: 'EMAIL_NOT_VERIFIED',
          email: user.email
        },
        { status: 403 }
      );
    }

    // Verify password
    const isPasswordValid = await user.comparePassword(password);
    
    if (!isPasswordValid) {
      return NextResponse.json(
        { 
          error: 'Invalid password', 
          errorType: 'INVALID_PASSWORD',
          message: 'The password you entered is incorrect'
        },
        { status: 401 }
      );
    }

    // Generate JWT token
    const token = generateToken(user._id.toString(), user.email, user.role);

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    // Remove password from response
    const userResponse = {
      _id: user._id,
      email: user.email,
      role: user.role,
      profile: user.profile,
      addresses: user.addresses,
      isActive: user.isActive,
      emailVerified: user.emailVerified,
      lastLogin: user.lastLogin,
      fullName: user.fullName,
    };

    // Create response with httpOnly cookie
    const response = NextResponse.json(
      { 
        message: 'Login successful',
        user: userResponse,
        token // Also return token in response for localStorage (temporary)
      },
      { status: 200 }
    );

    // Set JWT token as httpOnly cookie (more secure)
    response.cookies.set('auth-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/',
    });

    return response;
  } catch (error: any) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Login failed. Please try again.' },
      { status: 500 }
    );
  }
}
