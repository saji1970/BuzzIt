const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const twilio = require('twilio');
const { v4: uuidv4 } = require('uuid');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Twilio configuration
const twilioClient = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

// JWT secret (use environment variable in production)
const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key';

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// In-memory database (replace with real database in production)
let users = [];
let buzzes = [];
let socialAccounts = [];
let verificationCodes = new Map(); // Store verification codes temporarily

// Helper function to generate IDs
const generateId = () => Date.now().toString();

// Helper function to generate JWT token
const generateToken = (userId) => {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: '7d' });
};

// Middleware to verify JWT token
const verifyToken = (req, res, next) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  
  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.userId = decoded.userId;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid token' });
  }
};

// API Routes

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: '🔥 Buzz it Backend API',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth',
      users: '/api/users',
      buzzes: '/api/buzzes',
      social: '/api/social',
    },
  });
});

// Authentication endpoints
app.post('/api/auth/send-verification', async (req, res) => {
  try {
    const { mobileNumber, username } = req.body;

    if (!mobileNumber || !username) {
      return res.status(400).json({ error: 'Mobile number and username are required' });
    }

    // Check if username already exists
    const existingUser = users.find(u => u.username === username);
    if (existingUser) {
      return res.status(400).json({ error: 'Username already exists' });
    }

    // Generate 6-digit verification code
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const verificationId = uuidv4();

    // Store verification code with expiration (5 minutes)
    verificationCodes.set(verificationId, {
      code,
      mobileNumber,
      username,
      expiresAt: Date.now() + 5 * 60 * 1000, // 5 minutes
    });

    // Send SMS via Twilio
    try {
      await twilioClient.messages.create({
        body: `Your Buzzit verification code is: ${code}. This code expires in 5 minutes.`,
        from: process.env.TWILIO_PHONE_NUMBER,
        to: mobileNumber,
      });

      res.json({
        success: true,
        message: 'Verification code sent successfully',
        verificationId,
      });
    } catch (twilioError) {
      console.error('Twilio error:', twilioError);
      // For development, still return success with demo code
      res.json({
        success: true,
        message: `Demo mode: Verification code is ${code}`,
        verificationId,
      });
    }
  } catch (error) {
    console.error('Send verification error:', error);
    res.status(500).json({ error: 'Failed to send verification code' });
  }
});

app.post('/api/auth/verify-code', async (req, res) => {
  try {
    const { mobileNumber, code, verificationId } = req.body;

    if (!mobileNumber || !code || !verificationId) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    // Check verification code
    const storedData = verificationCodes.get(verificationId);
    
    if (!storedData) {
      return res.status(400).json({ error: 'Invalid verification ID' });
    }

    if (storedData.expiresAt < Date.now()) {
      verificationCodes.delete(verificationId);
      return res.status(400).json({ error: 'Verification code expired' });
    }

    if (storedData.mobileNumber !== mobileNumber || storedData.code !== code) {
      return res.status(400).json({ error: 'Invalid verification code' });
    }

    // Create new user
    const newUser = {
      id: generateId(),
      username: storedData.username,
      mobileNumber: mobileNumber,
      displayName: storedData.username,
      email: `${storedData.username}@buzzit.app`,
      bio: '',
      avatar: null,
      interests: [],
      followers: 0,
      following: 0,
      buzzCount: 0,
      createdAt: new Date().toISOString(),
      subscribedChannels: [],
      blockedUsers: [],
      isVerified: true,
    };

    users.push(newUser);

    // Generate JWT token
    const token = generateToken(newUser.id);

    // Clean up verification code
    verificationCodes.delete(verificationId);

    res.json({
      success: true,
      user: newUser,
      token,
    });
  } catch (error) {
    console.error('Verify code error:', error);
    res.status(500).json({ error: 'Failed to verify code' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required' });
    }

    // Find user by username
    const user = users.find(u => u.username === username);
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // For demo purposes, accept any password
    // In production, you would hash and compare passwords
    const token = generateToken(user.id);

    res.json({
      success: true,
      user,
      token,
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

// User endpoints
app.get('/api/users', (req, res) => {
  res.json(users);
});

app.get('/api/users/me', verifyToken, (req, res) => {
  const user = users.find(u => u.id === req.userId);
  if (user) {
    res.json(user);
  } else {
    res.status(404).json({ error: 'User not found' });
  }
});

app.get('/api/users/:id', (req, res) => {
  const user = users.find(u => u.id === req.params.id);
  if (user) {
    res.json(user);
  } else {
    res.status(404).json({ error: 'User not found' });
  }
});

app.post('/api/users', (req, res) => {
  const newUser = {
    id: generateId(),
    username: req.body.username,
    displayName: req.body.displayName,
    email: req.body.email,
    mobileNumber: req.body.mobileNumber || '',
    bio: req.body.bio || '',
    avatar: req.body.avatar || null,
    interests: req.body.interests || [],
    followers: 0,
    following: 0,
    buzzCount: 0,
    createdAt: new Date().toISOString(),
    subscribedChannels: [],
    blockedUsers: [],
    isVerified: false,
  };
  users.push(newUser);
  res.status(201).json(newUser);
});

app.patch('/api/users/:id', verifyToken, (req, res) => {
  if (req.params.id !== req.userId) {
    return res.status(403).json({ error: 'Forbidden' });
  }

  const userIndex = users.findIndex(u => u.id === req.params.id);
  if (userIndex !== -1) {
    users[userIndex] = { ...users[userIndex], ...req.body };
    res.json(users[userIndex]);
  } else {
    res.status(404).json({ error: 'User not found' });
  }
});

app.get('/api/users/check-username/:username', (req, res) => {
  const username = req.params.username;
  const exists = users.some(u => u.username === username);
  res.json({ available: !exists });
});

// Buzz endpoints
app.get('/api/buzzes', (req, res) => {
  const { userId, interests } = req.query;
  let filteredBuzzes = buzzes;

  if (userId) {
    filteredBuzzes = buzzes.filter(b => b.userId === userId);
  }

  if (interests) {
    const interestArray = interests.split(',');
    filteredBuzzes = filteredBuzzes.filter(b =>
      b.interests.some(i => interestArray.includes(i.id))
    );
  }

  // Sort by newest first
  filteredBuzzes.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  res.json(filteredBuzzes);
});

app.get('/api/buzzes/:id', (req, res) => {
  const buzz = buzzes.find(b => b.id === req.params.id);
  if (buzz) {
    res.json(buzz);
  } else {
    res.status(404).json({ error: 'Buzz not found' });
  }
});

app.post('/api/buzzes', verifyToken, (req, res) => {
  const newBuzz = {
    id: generateId(),
    userId: req.userId,
    username: req.body.username,
    userAvatar: req.body.userAvatar || null,
    content: req.body.content,
    media: req.body.media || { type: null, url: null },
    interests: req.body.interests || [],
    likes: 0,
    comments: 0,
    shares: 0,
    createdAt: new Date().toISOString(),
    isLiked: false,
  };
  buzzes.push(newBuzz);
  res.status(201).json(newBuzz);
});

app.patch('/api/buzzes/:id/like', verifyToken, (req, res) => {
  const buzz = buzzes.find(b => b.id === req.params.id);
  if (buzz) {
    buzz.isLiked = !buzz.isLiked;
    buzz.likes += buzz.isLiked ? 1 : -1;
    res.json(buzz);
  } else {
    res.status(404).json({ error: 'Buzz not found' });
  }
});

app.patch('/api/buzzes/:id/share', verifyToken, (req, res) => {
  const buzz = buzzes.find(b => b.id === req.params.id);
  if (buzz) {
    buzz.shares += 1;
    res.json(buzz);
  } else {
    res.status(404).json({ error: 'Buzz not found' });
  }
});

app.delete('/api/buzzes/:id', verifyToken, (req, res) => {
  const buzzIndex = buzzes.findIndex(b => b.id === req.params.id);
  if (buzzIndex !== -1) {
    // Check if user owns the buzz
    if (buzzes[buzzIndex].userId !== req.userId) {
      return res.status(403).json({ error: 'Forbidden' });
    }
    buzzes.splice(buzzIndex, 1);
    res.json({ message: 'Buzz deleted' });
  } else {
    res.status(404).json({ error: 'Buzz not found' });
  }
});

// Social accounts endpoints
app.get('/api/social/:userId', (req, res) => {
  const accounts = socialAccounts.filter(a => a.userId === req.params.userId);
  res.json(accounts);
});

app.post('/api/social', verifyToken, (req, res) => {
  const newAccount = {
    id: generateId(),
    userId: req.userId,
    platform: req.body.platform,
    username: req.body.username,
    isConnected: req.body.isConnected || false,
    createdAt: new Date().toISOString(),
  };
  socialAccounts.push(newAccount);
  res.status(201).json(newAccount);
});

app.put('/api/social/:id', verifyToken, (req, res) => {
  const accountIndex = socialAccounts.findIndex(a => a.id === req.params.id);
  if (accountIndex !== -1) {
    // Check if user owns the account
    if (socialAccounts[accountIndex].userId !== req.userId) {
      return res.status(403).json({ error: 'Forbidden' });
    }
    socialAccounts[accountIndex] = { ...socialAccounts[accountIndex], ...req.body };
    res.json(socialAccounts[accountIndex]);
  } else {
    res.status(404).json({ error: 'Social account not found' });
  }
});

app.delete('/api/social/:id', verifyToken, (req, res) => {
  const accountIndex = socialAccounts.findIndex(a => a.id === req.params.id);
  if (accountIndex !== -1) {
    // Check if user owns the account
    if (socialAccounts[accountIndex].userId !== req.userId) {
      return res.status(403).json({ error: 'Forbidden' });
    }
    socialAccounts.splice(accountIndex, 1);
    res.json({ message: 'Social account deleted' });
  } else {
    res.status(404).json({ error: 'Social account not found' });
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    version: '1.0.0',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
});

// Clean up expired verification codes every hour
setInterval(() => {
  const now = Date.now();
  for (const [id, data] of verificationCodes.entries()) {
    if (data.expiresAt < now) {
      verificationCodes.delete(id);
    }
  }
}, 60 * 60 * 1000); // 1 hour

// Start server
app.listen(PORT, () => {
  console.log(`🔥 Buzz it Backend API running on port ${PORT}`);
  console.log(`API URL: http://localhost:${PORT}`);
  console.log(`Twilio configured: ${process.env.TWILIO_ACCOUNT_SID ? 'Yes' : 'No'}`);
});

// Export for testing
module.exports = app;