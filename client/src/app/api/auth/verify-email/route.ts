import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User.js';

/**
 * Email Verification Endpoint
 * Verifies user email using the token sent via email
 */
export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');

    console.log('🔍 Verification attempt with token:', token?.substring(0, 20) + '...');

    if (!token) {
      return NextResponse.json(
        { error: 'Verification token is required' },
        { status: 400 }
      );
    }

    // Find user with this verification token
    const user = await User.findOne({
      verificationToken: token,
      verificationTokenExpiry: { $gt: new Date() } // Token not expired
    });

    console.log('👤 User found:', user ? `${user.email} (verified: ${user.emailVerified})` : 'None');

    if (!user) {
      // Check if token exists but is expired
      const expiredUser = await User.findOne({ verificationToken: token });
      if (expiredUser) {
        console.log('⏰ Token expired for user:', expiredUser.email);
        return NextResponse.json(
          { 
            error: 'Verification token has expired',
            message: 'The verification link has expired. Please request a new one.',
            email: expiredUser.email
          },
          { status: 400 }
        );
      }

      console.log('❌ No user found with this token');
      return NextResponse.json(
        { 
          error: 'Invalid verification token',
          message: 'This verification link is invalid. Please request a new one.' 
        },
        { status: 400 }
      );
    }

    // Check if already verified
    if (user.emailVerified) {
      return NextResponse.json(
        { 
          message: 'Email already verified. You can now login.',
          alreadyVerified: true 
        },
        { status: 200 }
      );
    }

    // Mark email as verified
    user.emailVerified = true;
    user.verificationToken = undefined;
    user.verificationTokenExpiry = undefined;
    await user.save();

    console.log('✅ Email verified for user:', user.email);

    // Return success response with redirect info
    return NextResponse.json(
      { 
        message: 'Email verified successfully! You can now login.',
        success: true,
        user: {
          email: user.email,
          role: user.role
        }
      },
      { status: 200 }
    );

  } catch (error: any) {
    console.error('Email verification error:', error);
    return NextResponse.json(
      { error: 'Failed to verify email. Please try again.' },
      { status: 500 }
    );
  }
}

/**
 * Resend Verification Email
 * Allows users to request a new verification email
 */
export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      // Don't reveal if user exists or not (security)
      return NextResponse.json(
        { message: 'If an account exists with this email, a verification link will be sent.' },
        { status: 200 }
      );
    }

    if (user.emailVerified) {
      return NextResponse.json(
        { error: 'Email is already verified' },
        { status: 400 }
      );
    }

    // Generate new verification token
    const { generateVerificationToken } = await import('@/lib/jwt');
    const { sendVerificationEmail } = await import('@/lib/email');

    const verificationToken = generateVerificationToken();
    const verificationTokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000);

    user.verificationToken = verificationToken;
    user.verificationTokenExpiry = verificationTokenExpiry;
    await user.save();

    // Send new verification email
    const emailResult = await sendVerificationEmail(user.email, verificationToken);

    if (!emailResult.success) {
      return NextResponse.json(
        { error: 'Failed to send verification email' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { message: 'Verification email sent successfully. Please check your inbox.' },
      { status: 200 }
    );

  } catch (error: any) {
    console.error('Resend verification error:', error);
    return NextResponse.json(
      { error: 'Failed to resend verification email' },
      { status: 500 }
    );
  }
}
