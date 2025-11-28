import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User.js';

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
      lastLogin: user.lastLogin,
      fullName: user.fullName,
    };

    return NextResponse.json(
      { 
        message: 'Login successful',
        user: userResponse 
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Login failed. Please try again.' },
      { status: 500 }
    );
  }
}
