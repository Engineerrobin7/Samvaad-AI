import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import pool from '../config/db';

// JWT secret from environment variables
const JWT_SECRET = process.env.JWT_SECRET || 'samvaad-ai-secret-key';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

/**
 * Register a new user
 * @route POST /api/auth/register
 */
export const register = async (req: Request, res: Response) => {
  try {
    const { name, email, password, preferredLanguage } = req.body;
    
    // Validate input
    if (!name || !email || !password) {
      return res.status(400).json({ 
        success: false, 
        message: 'Name, email, and password are required' 
      });
    }
    
    // Check if user already exists
    const userExists = await pool.query(
      'SELECT * FROM users WHERE email = $1',
      [email]
    );
    
    if (userExists.rows.length > 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'User with this email already exists' 
      });
    }
    
    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    
    // Create user
    const newUser = await pool.query(
      'INSERT INTO users (name, email, password, preferred_language) VALUES ($1, $2, $3, $4) RETURNING id, name, email, preferred_language',
      [name, email, hashedPassword, preferredLanguage || 'en']
    );
    
    // Generate JWT token
    const token = jwt.sign(
      { id: newUser.rows[0].id },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );
    
    return res.status(201).json({
      success: true,
      data: {
        user: {
          id: newUser.rows[0].id,
          name: newUser.rows[0].name,
          email: newUser.rows[0].email,
          preferredLanguage: newUser.rows[0].preferred_language
        },
        token
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Error registering user' 
    });
  }
};

/**
 * Login a user
 * @route POST /api/auth/login
 */
export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    
    // Validate input
    if (!email || !password) {
      return res.status(400).json({ 
        success: false, 
        message: 'Email and password are required' 
      });
    }
    
    // Check if user exists
    const user = await pool.query(
      'SELECT * FROM users WHERE email = $1',
      [email]
    );
    
    if (user.rows.length === 0) {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid credentials' 
      });
    }
    
    // Check password
    const isMatch = await bcrypt.compare(password, user.rows[0].password);
    
    if (!isMatch) {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid credentials' 
      });
    }
    
    // Generate JWT token
    const token = jwt.sign(
      { id: user.rows[0].id },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );
    
    return res.status(200).json({
      success: true,
      data: {
        user: {
          id: user.rows[0].id,
          name: user.rows[0].name,
          email: user.rows[0].email,
          preferredLanguage: user.rows[0].preferred_language
        },
        token
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Error logging in' 
    });
  }
};

/**
 * Get user profile
 * @route GET /api/auth/profile
 */
export const getProfile = async (req: Request, res: Response) => {
  try {
    // User ID is attached by the authentication middleware
    const userId = (req as any).user.id;
    
    const user = await pool.query(
      'SELECT id, name, email, preferred_language, created_at FROM users WHERE id = $1',
      [userId]
    );
    
    if (user.rows.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }
    
    return res.status(200).json({
      success: true,
      data: {
        user: {
          id: user.rows[0].id,
          name: user.rows[0].name,
          email: user.rows[0].email,
          preferredLanguage: user.rows[0].preferred_language,
          createdAt: user.rows[0].created_at
        }
      }
    });
  } catch (error) {
    console.error('Get profile error:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Error getting user profile' 
    });
  }
};