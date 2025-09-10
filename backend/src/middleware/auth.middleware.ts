import { Request, Response, NextFunction } from 'express';
import { clerkClient } from '@clerk/clerk-sdk-node';
import { pool } from '../db/pool';

export const authenticate = async (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Authentication required. No token provided.' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const payload = await clerkClient.verifyToken(token);
    const clerkUserId = payload.sub;

    if (!clerkUserId) {
      return res.status(401).json({ message: 'Invalid token' });
    }
    
    // Find the corresponding user in your local DB
    const userResult = await pool.query('SELECT id FROM users WHERE clerk_id = $1', [clerkUserId]);
    if (userResult.rows.length === 0) {
        return res.status(404).json({ message: 'User not found in local database. Please sync.' });
    }

    // Attach your internal user ID to the request object
    (req as any).user = {
      id: userResult.rows[0].id, // Your internal DB user ID
      clerkId: clerkUserId
    };
    
    next();
  } catch (error) {
    console.error('Authentication error:', error);
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
};