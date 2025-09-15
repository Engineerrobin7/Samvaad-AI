import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '@clerk/express';
import pool from '../db/pool.js';

// Declare a local interface for Request to include the 'user' property
declare module 'express' {
  interface Request {
    user?: {
      id: string;
      clerkId: string;
    };
  }
}

export const authenticate = async (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Authentication required. No token provided.' });
  }

  const token = authHeader.split(' ')[1];

  try {
    // ✅ Verify token with Clerk
    const payload = await verifyToken(token, {
      secretKey: process.env.CLERK_SECRET_KEY!,  // add this in your .env
    });

    const clerkUserId = payload.sub;

    if (!clerkUserId) {
      return res.status(401).json({ message: 'Invalid token' });
    }

    // ✅ Lookup local user in DB
    const userResult = await pool.query(
      'SELECT id FROM users WHERE clerk_id = $1',
      [clerkUserId]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({
        message: 'User not found in local database. Please sync.',
      });
    }

    // Attach your internal user ID to the request
    req.user = { // No need for (req as any) anymore
      id: userResult.rows[0].id, // Your internal DB user ID
      clerkId: clerkUserId,
    };

    next();
  } catch (error) {
    console.error('Authentication error:', error);
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
};
