const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// In-memory database (replace with real database in production)
let users = [];
let buzzes = [];
let socialAccounts = [];

// Helper function to generate IDs
const generateId = () => Date.now().toString();

// API Routes

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: '🔥 Buzz it Backend API',
    version: '1.0.0',
    endpoints: {
      users: '/api/users',
      buzzes: '/api/buzzes',
      social: '/api/social',
    },
  });
});

// User endpoints
app.get('/api/users', (req, res) => {
  res.json(users);
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
    bio: req.body.bio || '',
    avatar: req.body.avatar || null,
    interests: req.body.interests || [],
    followers: 0,
    following: 0,
    buzzCount: 0,
    createdAt: new Date(),
  };
  users.push(newUser);
  res.status(201).json(newUser);
});

app.put('/api/users/:id', (req, res) => {
  const userIndex = users.findIndex(u => u.id === req.params.id);
  if (userIndex !== -1) {
    users[userIndex] = { ...users[userIndex], ...req.body };
    res.json(users[userIndex]);
  } else {
    res.status(404).json({ error: 'User not found' });
  }
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

app.post('/api/buzzes', (req, res) => {
  const newBuzz = {
    id: generateId(),
    userId: req.body.userId,
    username: req.body.username,
    userAvatar: req.body.userAvatar || null,
    content: req.body.content,
    media: req.body.media || { type: null, url: null },
    interests: req.body.interests || [],
    likes: 0,
    comments: 0,
    shares: 0,
    createdAt: new Date(),
    isLiked: false,
  };
  buzzes.push(newBuzz);
  res.status(201).json(newBuzz);
});

app.patch('/api/buzzes/:id/like', (req, res) => {
  const buzz = buzzes.find(b => b.id === req.params.id);
  if (buzz) {
    buzz.isLiked = !buzz.isLiked;
    buzz.likes += buzz.isLiked ? 1 : -1;
    res.json(buzz);
  } else {
    res.status(404).json({ error: 'Buzz not found' });
  }
});

app.patch('/api/buzzes/:id/share', (req, res) => {
  const buzz = buzzes.find(b => b.id === req.params.id);
  if (buzz) {
    buzz.shares += 1;
    res.json(buzz);
  } else {
    res.status(404).json({ error: 'Buzz not found' });
  }
});

app.delete('/api/buzzes/:id', (req, res) => {
  const buzzIndex = buzzes.findIndex(b => b.id === req.params.id);
  if (buzzIndex !== -1) {
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

app.post('/api/social', (req, res) => {
  const newAccount = {
    id: generateId(),
    userId: req.body.userId,
    platform: req.body.platform,
    username: req.body.username,
    isConnected: req.body.isConnected || false,
    createdAt: new Date(),
  };
  socialAccounts.push(newAccount);
  res.status(201).json(newAccount);
});

app.put('/api/social/:id', (req, res) => {
  const accountIndex = socialAccounts.findIndex(a => a.id === req.params.id);
  if (accountIndex !== -1) {
    socialAccounts[accountIndex] = { ...socialAccounts[accountIndex], ...req.body };
    res.json(socialAccounts[accountIndex]);
  } else {
    res.status(404).json({ error: 'Social account not found' });
  }
});

app.delete('/api/social/:id', (req, res) => {
  const accountIndex = socialAccounts.findIndex(a => a.id === req.params.id);
  if (accountIndex !== -1) {
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
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🔥 Buzz it Backend API running on port ${PORT}`);
  console.log(`API URL: http://localhost:${PORT}`);
});

// Export for testing
module.exports = app;
