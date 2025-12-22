import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User.js';

/**
 * Admin Setup Endpoint
 * Creates or updates the hardcoded admin account
 * Access: GET /api/admin/setup?secret=your-secret-key
 * 
 * For security, requires a secret key in production
 */
export async function GET(request: NextRequest) {
  try {
    // Security check for production
    const { searchParams } = new URL(request.url);
    const secret = searchParams.get('secret');
    const expectedSecret = process.env.ADMIN_SETUP_SECRET || 'dev-secret-123';
    
    if (process.env.NODE_ENV === 'production' && secret !== expectedSecret) {
      return NextResponse.json(
        { error: 'Unauthorized. Invalid secret key.' },
        { status: 401 }
      );
    }

    await connectDB();

    const ADMIN_EMAIL = 'admin@csms.com';
    const ADMIN_PASSWORD = 'admin123';

    // Check if admin exists
    let admin = await User.findOne({ email: ADMIN_EMAIL });

    if (admin) {
      // Update existing admin to be verified
      admin.emailVerified = true;
      admin.verificationToken = undefined;
      admin.verificationTokenExpiry = undefined;
      admin.role = 'admin';
      admin.isActive = true;
      
      // Update password if needed
      admin.password = ADMIN_PASSWORD;
      await admin.save();

      return NextResponse.json({
        message: 'Admin user updated successfully',
        admin: {
          email: admin.email,
          role: admin.role,
          emailVerified: admin.emailVerified,
          isActive: admin.isActive
        }
      });
    } else {
      // Create new admin
      admin = await User.create({
        email: ADMIN_EMAIL,
        password: ADMIN_PASSWORD,
        role: 'admin',
        isActive: true,
        emailVerified: true,
        profile: {
          firstName: 'Admin',
          lastName: 'CSMS'
        }
      });

      return NextResponse.json({
        message: 'Admin user created successfully',
        admin: {
          email: admin.email,
          role: admin.role,
          emailVerified: admin.emailVerified,
          isActive: admin.isActive
        }
      });
    }

  } catch (error: any) {
    console.error('Admin setup error:', error);
    return NextResponse.json(
      { error: 'Failed to setup admin user', details: error.message },
      { status: 500 }
    );
  }
}
