import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User.js';
import { generateVerificationToken } from '@/lib/jwt';
import { sendVerificationEmail } from '@/lib/email';

export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const { email, password, role, profile } = await request.json();

    // Validate required fields
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 409 }
      );
    }

    // Generate verification token
    const verificationToken = generateVerificationToken();
    const verificationTokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    console.log('🔐 Generated verification token:', verificationToken.substring(0, 20) + '...');
    console.log('⏰ Token expiry:', verificationTokenExpiry);

    // Create new user
    const user = await User.create({
      email: email.toLowerCase(),
      password,
      role: role || 'customer',
      profile: profile || {},
      isActive: true,
      emailVerified: false,
      verificationToken,
      verificationTokenExpiry,
    });

    console.log('✅ User created with ID:', user._id);
    console.log('📧 Email:', user.email);
    console.log('🔑 Token saved:', user.verificationToken ? 'YES' : 'NO');
    console.log('⏱️ Expiry saved:', user.verificationTokenExpiry ? 'YES' : 'NO');

    // Send verification email
    const emailResult = await sendVerificationEmail(user.email, verificationToken);
    
    if (!emailResult.success) {
      console.warn('⚠️ Failed to send verification email, but user was created');
    }

    // Remove sensitive fields from response
    const userResponse = {
      _id: user._id,
      email: user.email,
      role: user.role,
      profile: user.profile,
      isActive: user.isActive,
      emailVerified: user.emailVerified,
      createdAt: user.createdAt,
    };

    return NextResponse.json(
      { 
        message: 'User created successfully. Please check your email to verify your account.',
        user: userResponse,
        emailSent: emailResult.success
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Signup error:', error);
    
    if (error.code === 11000) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to create user. Please try again.' },
      { status: 500 }
    );
  }
}
