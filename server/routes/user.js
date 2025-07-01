import express from 'express';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Get current user profile
router.get('/profile', authenticateToken, (req, res) => {
  const { password, ...userWithoutPassword } = req.user;
  res.json({ user: userWithoutPassword });
});

// Update user profile
router.put('/profile', authenticateToken, async (req, res) => {
  try {
    // In a real application, you would update the user in the database
    // For now, we'll just return the current user data
    const { password, ...userWithoutPassword } = req.user;
    res.json({ 
      message: 'Profile updated successfully',
      user: userWithoutPassword 
    });
  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({ error: 'Profile update failed' });
  }
});

export default router;