import { Request, Response, NextFunction } from 'express'
import { supabase } from '../config/supabase'

export const authMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = req.headers.authorization?.split(' ')[1]
    
    if (!token) {
      return res.status(401).json({ message: 'No token provided' })
    }

    const { data: { user }, error } = await supabase.auth.getUser(token)

    if (error || !user) {
      return res.status(401).json({ message: 'Invalid token' })
    }

    // Add user to request object
    ;(req as any).user = user
    next()
  } catch (error) {
    res.status(401).json({ message: 'Authentication failed' })
  }
}