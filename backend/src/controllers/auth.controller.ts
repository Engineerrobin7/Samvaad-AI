import { Request, Response } from 'express';
import { supabase } from '../config/supabase';

export const authController = {
  async register(req: Request, res: Response) {
    try {
      const { email, password, name, nativeLanguage, learningLanguages } = req.body;

      // Create auth user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password
      });

      if (authError) {
        return res.status(400).json({ message: authError.message });
      }

      // Create user profile
      const { error: profileError } = await supabase
        .from('users')
        .insert([
          {
            id: authData.user!.id,
            email,
            name,
            native_language: nativeLanguage,
            learning_languages: learningLanguages
          }
        ]);

      if (profileError) {
        return res.status(400).json({ message: profileError.message });
      }

      res.status(201).json({
        user: {
          id: authData.user!.id,
          email,
          name,
          nativeLanguage,
          learningLanguages
        }
      });
    } catch (error) {
      console.error('Registration error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  },

  async login(req: Request, res: Response) {
    try {
      const { email, password } = req.body;

      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (authError) {
        return res.status(400).json({ message: authError.message });
      }

      // Get user profile
      const { data: profile, error: profileError } = await supabase
        .from('users')
        .select('*')
        .eq('id', authData.user.id)
        .single();

      if (profileError) {
        return res.status(400).json({ message: profileError.message });
      }

      res.json({
        user: profile,
        session: authData.session
      });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  }
};