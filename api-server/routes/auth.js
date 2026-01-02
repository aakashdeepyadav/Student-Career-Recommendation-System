const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const router = express.Router();

// Register
router.post('/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // Check if user exists
    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' });
    }

    // Create user
    const user = new User({ username, email, password });
    await user.save();

    // Generate token
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        profileImage: null, // New users have no profile image
        userInfo: null // New users have no additional info
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Generate token
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Check if user has completed profile
    const hasProfile = !!user.profile?.riasec_profile;
    
    console.log(`[AUTH] User logged in: ${user.username} (ID: ${user._id})`);
    console.log(`[AUTH] Has completed profile: ${hasProfile}`);
    if (hasProfile) {
      console.log(`[AUTH] RIASEC scores:`, user.profile.riasec_profile);
      console.log(`[AUTH] Cluster: ${user.cluster?.cluster_name || 'None'}`);
      console.log(`[AUTH] Recommendations: ${user.recommendations?.length || 0}`);
    }
    
    res.json({
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        hasProfile: hasProfile, // Indicate if user has completed questionnaire
        profileImage: user.profileImage || null, // Include profile image URL
        userInfo: user.userInfo || null // Include additional user info
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;

