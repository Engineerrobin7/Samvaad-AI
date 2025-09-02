import express from 'express';
import { authController } from '../controllers/authController';
import { authMiddleware } from '../middleware/auth';
import { User } from '../models/User'; // Add this import

const router = express.Router();

router.post('/register', async (req, res) => {
  const { name, email, password } = req.body;

  try {
    // Check if the user already exists
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Create a new user
    user = new User({ name, email, password });
    await user.save();

    res.status(201).json({ message: 'User registered successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/login', authController.login);

// Protected route example
router.get('/me', authMiddleware, async (req: any, res) => {
  try {
    const user = await User.findById(req.userId).select('-password');
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

export const authRouter = router;