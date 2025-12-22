import { NextRequest, NextResponse } from 'next/server';
import { verifyToken, JWTPayload } from './jwt';

/**
 * Authentication middleware for API routes
 * Validates JWT token from cookies or Authorization header
 */
export async function requireAuth(request: NextRequest) {
  try {
    // Try to get token from cookie first
    let token = request.cookies.get('auth-token')?.value;

    // If no cookie, try Authorization header
    if (!token) {
      const authHeader = request.headers.get('Authorization');
      if (authHeader?.startsWith('Bearer ')) {
        token = authHeader.substring(7);
      }
    }

    if (!token) {
      return {
        success: false,
        error: 'No authentication token provided',
        response: NextResponse.json(
          { error: 'Authentication required. Please login.' },
          { status: 401 }
        )
      };
    }

    // Verify token
    const decoded = verifyToken(token);

    if (!decoded) {
      return {
        success: false,
        error: 'Invalid or expired token',
        response: NextResponse.json(
          { error: 'Invalid or expired authentication token. Please login again.' },
          { status: 401 }
        )
      };
    }

    // Return decoded user info
    return {
      success: true,
      user: decoded
    };

  } catch (error) {
    console.error('Auth middleware error:', error);
    return {
      success: false,
      error: 'Authentication failed',
      response: NextResponse.json(
        { error: 'Authentication failed' },
        { status: 401 }
      )
    };
  }
}

/**
 * Role-based authorization middleware
 * Checks if authenticated user has required role
 */
export async function requireRole(request: NextRequest, allowedRoles: string[]) {
  const authResult = await requireAuth(request);

  if (!authResult.success) {
    return authResult;
  }

  const user = authResult.user as JWTPayload;

  if (!allowedRoles.includes(user.role)) {
    return {
      success: false,
      error: 'Insufficient permissions',
      response: NextResponse.json(
        { error: 'You do not have permission to access this resource' },
        { status: 403 }
      )
    };
  }

  return {
    success: true,
    user
  };
}

/**
 * Admin-only middleware
 */
export async function requireAdmin(request: NextRequest) {
  return requireRole(request, ['admin']);
}

/**
 * Helper to extract user from request
 * Use this in API routes after auth middleware
 */
export function getUserFromToken(request: NextRequest): JWTPayload | null {
  let token = request.cookies.get('auth-token')?.value;

  if (!token) {
    const authHeader = request.headers.get('Authorization');
    if (authHeader?.startsWith('Bearer ')) {
      token = authHeader.substring(7);
    }
  }

  if (!token) return null;

  return verifyToken(token);
}
