// web_app/server/routes/auth.js

const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET || 'somerandomsecretstring123';

// --- Registration Route ---
router.post('/register', async (req, res) => {
  const { username, password } = req.body;
  
  // Validation
  if (!username || !password) {
    return res.status(400).json({ msg: 'Please provide username and password' });
  }
  
  if (password.length < 6) {
    return res.status(400).json({ msg: 'Password must be at least 6 characters' });
  }
  
  try {
    let user = await User.findOne({ username });
    if (user) {
      return res.status(400).json({ msg: 'Username already exists' });
    }
    
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    
    user = new User({ username, password: hashedPassword });
    await user.save();
    
    const payload = { user: { id: user.id, username: user.username } };
    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '24h' });
    
    res.status(201).json({ 
      msg: 'User registered successfully',
      token,
      user: { id: user.id, username: user.username }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ msg: 'Server error during registration' });
  }
});

// --- Login Route ---
router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  
  if (!username || !password) {
    return res.status(400).json({ msg: 'Please provide username and password' });
  }
  
  try {
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(400).json({ msg: 'Invalid credentials' });
    }
    
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ msg: 'Invalid credentials' });
    }
    
    const payload = { user: { id: user.id, username: user.username } };
    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '24h' });
    
    res.json({ 
      token,
      user: { id: user.id, username: user.username }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ msg: 'Server error during login' });
  }
});

// --- Verify Token Route ---
router.get('/verify', async (req, res) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  
  if (!token) {
    return res.status(401).json({ msg: 'No token provided' });
  }
  
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await User.findById(decoded.user.id).select('-password');
    
    if (!user) {
      return res.status(401).json({ msg: 'User not found' });
    }
    
    res.json({ user });
  } catch (error) {
    res.status(401).json({ msg: 'Token is not valid' });
  }
});

module.exports = router;