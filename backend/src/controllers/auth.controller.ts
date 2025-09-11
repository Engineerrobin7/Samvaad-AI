import { Request, Response } from 'express';
import { clerkClient } from '@clerk/express';
import pool from '../db/pool';
export const authController = {
  // Syncs Clerk user with your local database
  async syncUser(req: Request, res: Response) {
    try {
      const { clerkId, email, name, preferred_language } = req.body;

      if (!clerkId || !email || !name) {
        return res.status(400).json({ message: 'Missing required user data for sync' });
      }

      // Check if user already exists
      const userExists = await pool.query('SELECT * FROM users WHERE clerk_id = $1', [clerkId]);
      
      if (userExists.rows.length > 0) {
        // User exists, return their data
        const user = userExists.rows[0];
        return res.status(200).json({ message: 'User already synced', user });
      }

      // If user does not exist, create them
      const newUserQuery = `
        INSERT INTO users (clerk_id, email, name, preferred_language) 
        VALUES ($1, $2, $3, $4) 
        RETURNING *
      `;
      const newUser = await pool.query(newUserQuery, [clerkId, email, name, preferred_language || 'en']);

      res.status(201).json({ message: 'User synced successfully', user: newUser.rows[0] });

    } catch (error) {
      console.error('User sync error:', error);
      res.status(500).json({ message: 'Server error during user sync' });
    }
  },

  // Get current user's profile
  async getProfile(req: Request, res: Response) {
    try {
        const userId = (req as any).user?.id;
        const userResult = await pool.query('SELECT id, clerk_id, name, email, preferred_language, points, level FROM users WHERE id = $1', [userId]);

        if (userResult.rows.length === 0) {
            return res.status(404).json({ message: "User not found" });
        }

        res.json(userResult.rows[0]);
    } catch (error) {
        console.error('Get profile error:', error);
        res.status(500).json({ message: "Server error" });
    }
  }
};