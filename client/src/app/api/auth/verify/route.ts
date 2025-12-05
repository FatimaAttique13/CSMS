import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User.js';

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    // Get user ID or email from query params
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const email = searchParams.get('email');

    if (!userId && !email) {
      return NextResponse.json(
        { error: 'User ID or email is required' },
        { status: 400 }
      );
    }

    // Find user by ID or email
    let user;
    if (userId) {
      user = await User.findById(userId).select('-password');
    } else if (email) {
      user = await User.findOne({ email: email.toLowerCase() }).select('-password');
    }
    
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    if (!user.isActive) {
      return NextResponse.json(
        { error: 'Account is disabled' },
        { status: 403 }
      );
    }

    return NextResponse.json(
      { user: {
        _id: user._id,
        email: user.email,
        role: user.role,
        profile: user.profile,
        fullName: user.fullName,
        isActive: user.isActive
      } },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Verify error:', error);
    return NextResponse.json(
      { error: 'Verification failed' },
      { status: 500 }
    );
  }
}
