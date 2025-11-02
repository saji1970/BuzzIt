const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const twilio = require('twilio');
const { v4: uuidv4 } = require('uuid');
const { defaultFeatures, featureCategories, featureDescriptions } = require('./config/features');
const { connectDB } = require('./db/connection');
require('dotenv').config();

// Import database models
const User = require('./models/User');
const Buzz = require('./models/Buzz');
const VerificationCode = require('./models/VerificationCode');
const SocialAccount = require('./models/SocialAccount');
const Subscription = require('./models/Subscription');

const app = express();
const PORT = process.env.PORT || 3000;

// Twilio configuration (optional for development)
let twilioClient = null;
if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN) {
  twilioClient = twilio(
    process.env.TWILIO_ACCOUNT_SID,
    process.env.TWILIO_AUTH_TOKEN
  );
}

// JWT secret (use environment variable in production)
const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key';

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Serve static files (admin panel) BEFORE other routes
const path = require('path');
const publicPath = path.join(__dirname, 'public');
app.use(express.static(publicPath));

// Simple root endpoint - serve admin panel HTML, or API info if requested as JSON
app.get('/', (req, res) => {
  // If client requests JSON, return API info
  if (req.headers.accept && req.headers.accept.includes('application/json')) {
    return res.json({ 
    message: 'Buzz it Backend API is running!', 
    timestamp: new Date().toISOString(),
    port: PORT 
  });
  }
  // Otherwise, serve the admin panel HTML
  const indexPath = path.join(publicPath, 'index.html');
  const fs = require('fs');
  
  // Check if file exists
  if (fs.existsSync(indexPath)) {
    res.sendFile(indexPath);
  } else {
    // Try alternative paths
    const altPaths = [
      path.join(__dirname, 'public', 'index.html'),
      path.join(process.cwd(), 'public', 'index.html'),
      '/app/public/index.html',
    ];
    
    let found = false;
    for (const altPath of altPaths) {
      if (fs.existsSync(altPath)) {
        console.log(`Found admin panel at: ${altPath}`);
        res.sendFile(altPath);
        found = true;
        break;
      }
    }
    
    if (!found) {
      console.error(`Admin panel HTML not found. Checked paths:`);
      console.error(`  Primary: ${indexPath}`);
      altPaths.forEach(p => console.error(`  Alternative: ${p}`));
      console.error(`  __dirname: ${__dirname}`);
      console.error(`  process.cwd(): ${process.cwd()}`);
      console.error(`  Files in ${publicPath}:`, fs.existsSync(publicPath) ? fs.readdirSync(publicPath) : 'directory does not exist');
      
      res.status(404).json({ 
        error: 'Admin panel not found',
        checkedPaths: [indexPath, ...altPaths],
        __dirname: __dirname,
        processCwd: process.cwd(),
        publicPathExists: fs.existsSync(publicPath),
        message: 'Make sure public/index.html exists in the server directory'
      });
    }
  }
});

// In-memory database (replace with real database in production)
let users = [
  {
    id: 'test-user-1',
    username: 'testuser',
    password: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // password: "Test123!"
    buzzProfileName: 'Test Buzzer',
    interests: ['Technology', 'Music', 'Sports'],
    mobileNumber: '+1234567890',
    isVerified: true,
    createdAt: new Date().toISOString(),
  }
];
let buzzes = [
  {
    id: 'buzz-1',
    userId: 'test-user-1',
    username: 'testuser',
    content: 'Welcome to Buzzit! This is my first buzz! 🎉',
    type: 'text',
    media: {
      type: null,
      url: null
    },
    likes: 5,
    comments: 2,
    shares: 1,
    isLiked: false,
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
  },
  {
    id: 'buzz-2',
    userId: 'test-user-1',
    username: 'testuser',
    content: 'Just discovered this amazing new feature! The UI looks incredible! ✨',
    type: 'text',
    media: {
      type: null,
      url: null
    },
    likes: 12,
    comments: 4,
    shares: 3,
    isLiked: true,
    createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(), // 1 hour ago
  },
  {
    id: 'buzz-3',
    userId: 'test-user-1',
    username: 'testuser',
    content: 'Check out this cool video I found!',
    type: 'video',
    media: {
      type: 'video',
      url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4'
    },
    likes: 8,
    comments: 1,
    shares: 2,
    isLiked: false,
    createdAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(), // 30 minutes ago
  }
];
let socialAccounts = [];
let verificationCodes = new Map(); // Store verification codes temporarily
let adminUsers = [
  {
    id: 'admin-1',
    username: 'admin',
    email: 'admin@buzzit.app',
    role: 'super_admin',
    createdAt: new Date().toISOString(),
  }
];

// Feature configuration (stored in memory, in production use database)
let appFeatures = { ...defaultFeatures };

// Subscription plans
let subscriptionPlans = [
  {
    id: 'basic',
    name: 'Basic',
    price: 0,
    features: ['buzzCreation', 'buzzLikes', 'buzzComments', 'buzzShares'],
    channelLimit: 0,
    radioLimit: 0,
    isActive: true
  },
  {
    id: 'premium',
    name: 'Premium',
    price: 9.99,
    features: ['buzzCreation', 'buzzLikes', 'buzzComments', 'buzzShares', 'channelCreation', 'radioCreation', 'channelSubscription', 'radioSubscription'],
    channelLimit: 5,
    radioLimit: 3,
    isActive: true
  },
  {
    id: 'pro',
    name: 'Pro',
    price: 19.99,
    features: ['buzzCreation', 'buzzLikes', 'buzzComments', 'buzzShares', 'channelCreation', 'radioCreation', 'channelSubscription', 'radioSubscription', 'channelLiveStreaming', 'radioStreaming'],
    channelLimit: -1, // unlimited
    radioLimit: -1, // unlimited
    isActive: true
  }
];

// User subscriptions
let userSubscriptions = [];

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

// Middleware to verify admin access
const verifyAdmin = async (req, res, next) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  
  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    
    // Check in database first
    const admin = await User.findOne({ id: decoded.userId });
    
    if (admin && (admin.role === 'admin' || admin.role === 'super_admin')) {
      req.adminId = decoded.userId;
      req.adminRole = admin.role;
      next();
    } else {
      // Fallback to in-memory adminUsers
      const adminUser = adminUsers.find(a => a.id === decoded.userId);
      if (adminUser) {
        req.adminId = decoded.userId;
        req.adminRole = adminUser.role;
        next();
      } else {
        return res.status(403).json({ error: 'Admin access required' });
      }
    }
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

    // Check if username already exists (check both database and memory)
    const dbUser = await User.findOne({ username: username.toLowerCase() });
    const memUser = users.find(u => u.username.toLowerCase() === username.toLowerCase());
    if (dbUser || memUser) {
      return res.status(400).json({ error: 'Username already exists' });
    }

    // Generate 6-digit verification code
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const verificationId = uuidv4();

    // Store verification code in database with expiration (5 minutes)
    const verificationDoc = new VerificationCode({
      verificationId,
      code,
      mobileNumber,
      username,
      expiresAt: new Date(Date.now() + 5 * 60 * 1000), // 5 minutes
    });
    await verificationDoc.save();
    
    // Also store in memory for backwards compatibility
    verificationCodes.set(verificationId, {
      code,
      mobileNumber,
      username,
      expiresAt: Date.now() + 5 * 60 * 1000,
    });

    // Send SMS via Twilio (if available)
    if (twilioClient) {
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
        return res.status(500).json({ error: 'Failed to send verification code' });
      }
    } else {
      // For development, just log the code and return success
      console.log(`[DEV] Verification code for ${mobileNumber}: ${code}`);
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

    // Check verification code in database
    const storedData = await VerificationCode.findOne({ verificationId });
    
    // Fallback to in-memory Map
    const memStoredData = verificationCodes.get(verificationId);
    const finalStoredData = storedData || (memStoredData ? {
      code: memStoredData.code,
      mobileNumber: memStoredData.mobileNumber,
      username: memStoredData.username,
      expiresAt: new Date(memStoredData.expiresAt),
    } : null);
    
    if (!finalStoredData) {
      return res.status(400).json({ error: 'Invalid verification ID' });
    }

    if (new Date(finalStoredData.expiresAt) < new Date()) {
      if (storedData) await VerificationCode.deleteOne({ verificationId });
      if (memStoredData) verificationCodes.delete(verificationId);
      return res.status(400).json({ error: 'Verification code expired' });
    }

    if (finalStoredData.mobileNumber !== mobileNumber || finalStoredData.code !== code) {
      return res.status(400).json({ error: 'Invalid verification code' });
    }

    // Create new user in database
    const newUser = new User({
      id: generateId(),
      username: storedData.username.toLowerCase(),
      mobileNumber: mobileNumber,
      displayName: storedData.username,
      email: `${storedData.username}@buzzit.app`,
      bio: '',
      avatar: null,
      interests: [],
      followers: 0,
      following: 0,
      buzzCount: 0,
      subscribedChannels: [],
      blockedUsers: [],
      isVerified: true,
    });

    const savedUser = await newUser.save();
    
    // Also add to in-memory array for backwards compatibility
    users.push(savedUser.toObject());

    // Generate JWT token
    const token = generateToken(savedUser.id);

    // Clean up verification code
    await VerificationCode.deleteOne({ verificationId });

    // Remove password from response
    const { password: _, ...userWithoutPassword } = savedUser.toObject();
    
    res.json({
      success: true,
      user: userWithoutPassword,
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

    // Check if it's an admin login
    const admin = adminUsers.find(a => a.username === username);
    if (admin) {
      // For demo purposes, accept any password for admin
      // In production, you would hash and compare passwords
      const token = generateToken(admin.id);
      return res.json({
        success: true,
        user: admin,
        token,
        isAdmin: true,
      });
    }

    // Regular user login
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
      isAdmin: false,
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

// User endpoints
app.get('/api/users', async (req, res) => {
  try {
    const allUsers = await User.find({}).select('-password').lean();
    // Merge with in-memory users (for backwards compatibility)
    const memUserIds = new Set(users.map(u => u.id));
    const dbUserIds = new Set(allUsers.map(u => u.id));
    const uniqueMemUsers = users.filter(u => !dbUserIds.has(u.id));
    res.json([...allUsers, ...uniqueMemUsers]);
  } catch (error) {
    console.error('Get users error:', error);
    // Fallback to in-memory array
    res.json(users);
  }
});

app.get('/api/users/me', verifyToken, async (req, res) => {
  try {
    const user = await User.findOne({ id: req.userId }).select('-password').lean();
    if (user) {
      res.json(user);
    } else {
      // Fallback to in-memory array
      const memUser = users.find(u => u.id === req.userId);
      if (memUser) {
        res.json(memUser);
      } else {
        res.status(404).json({ error: 'User not found' });
      }
    }
  } catch (error) {
    console.error('Get current user error:', error);
    res.status(500).json({ error: 'Failed to get user' });
  }
});

app.get('/api/users/:id', async (req, res) => {
  try {
    const user = await User.findOne({ id: req.params.id }).select('-password').lean();
    if (user) {
      res.json(user);
    } else {
      // Fallback to in-memory array
      const memUser = users.find(u => u.id === req.params.id);
      if (memUser) {
        res.json(memUser);
      } else {
        res.status(404).json({ error: 'User not found' });
      }
    }
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: 'Failed to get user' });
  }
});

app.post('/api/users', async (req, res) => {
  try {
    // Validate required fields
    if (!req.body.username) {
      return res.status(400).json({ error: 'Username is required' });
    }

    // Check if username already exists (case-insensitive)
    const existingUser = await User.findOne({ 
      username: req.body.username.toLowerCase() 
    });
    
    if (existingUser) {
      return res.status(400).json({ 
        error: 'Username already exists',
        message: `The username "${req.body.username}" is already taken. Please choose another username.`
      });
    }

    const newUser = new User({
      id: generateId(),
      username: req.body.username.toLowerCase(),
      displayName: req.body.displayName || req.body.username,
      email: req.body.email || `${req.body.username}@buzzit.app`,
      mobileNumber: req.body.mobileNumber || '',
      bio: req.body.bio || '',
      avatar: req.body.avatar || null,
      dateOfBirth: req.body.dateOfBirth || null,
      interests: req.body.interests || [],
      followers: 0,
      following: 0,
      buzzCount: 0,
      subscribedChannels: [],
      blockedUsers: [],
      isVerified: false,
    });
    
    const savedUser = await newUser.save();
    
    // Also add to in-memory array for backwards compatibility during transition
    users.push(savedUser.toObject());
    
    res.status(201).json(savedUser.toObject());
  } catch (error) {
    console.error('Create user error:', error);
    if (error.code === 11000) {
      return res.status(400).json({ 
        error: 'Username already exists',
        message: `The username "${req.body.username}" is already taken.`
      });
    }
    res.status(500).json({ error: 'Failed to create user' });
  }
});

app.patch('/api/users/:id', verifyToken, async (req, res) => {
  if (req.params.id !== req.userId) {
    return res.status(403).json({ error: 'Forbidden' });
  }

  try {
    const updatedUser = await User.findOneAndUpdate(
      { id: req.params.id },
      { $set: req.body },
      { new: true }
    ).select('-password').lean();
    
    if (updatedUser) {
      // Also update in-memory array
      const memIndex = users.findIndex(u => u.id === req.params.id);
      if (memIndex !== -1) {
        users[memIndex] = { ...users[memIndex], ...req.body };
      }
      res.json(updatedUser);
    } else {
      // Fallback to in-memory array
      const userIndex = users.findIndex(u => u.id === req.params.id);
      if (userIndex !== -1) {
        users[userIndex] = { ...users[userIndex], ...req.body };
        res.json(users[userIndex]);
      } else {
        res.status(404).json({ error: 'User not found' });
      }
    }
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({ error: 'Failed to update user' });
  }
});

app.get('/api/users/check-username/:username', async (req, res) => {
  try {
    const username = req.params.username.toLowerCase();
    const dbUser = await User.findOne({ username });
    const memUser = users.find(u => u.username.toLowerCase() === username);
    const exists = !!(dbUser || memUser);
    res.json({ available: !exists });
  } catch (error) {
    console.error('Check username error:', error);
    res.json({ available: false });
  }
});

// Buzz endpoints
app.get('/api/buzzes', async (req, res) => {
  try {
    const { userId, interests } = req.query;
    let query = {};
    
    if (userId) {
      query.userId = userId;
    }
    
    if (interests) {
      const interestArray = interests.split(',');
      query['interests.id'] = { $in: interestArray };
    }
    
    // Get buzzes from database
    let dbBuzzes = await Buzz.find(query).sort({ createdAt: -1 }).lean();
    
    // Merge with in-memory buzzes (for backwards compatibility)
    const memBuzzIds = new Set(buzzes.map(b => b.id));
    const dbBuzzIds = new Set(dbBuzzes.map(b => b.id));
    let uniqueMemBuzzes = buzzes.filter(b => !dbBuzzIds.has(b.id));
    
    // Apply filters to in-memory buzzes
    if (userId) {
      uniqueMemBuzzes = uniqueMemBuzzes.filter(b => b.userId === userId);
    }
    if (interests) {
      const interestArray = interests.split(',');
      uniqueMemBuzzes = uniqueMemBuzzes.filter(b =>
        b.interests && b.interests.some(i => interestArray.includes(typeof i === 'object' ? i.id : i))
      );
    }
    
    // Sort and combine
    uniqueMemBuzzes.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    res.json([...dbBuzzes, ...uniqueMemBuzzes]);
  } catch (error) {
    console.error('Get buzzes error:', error);
    // Fallback to in-memory array
    res.json(buzzes);
  }
});

app.get('/api/buzzes/:id', async (req, res) => {
  try {
    const buzz = await Buzz.findOne({ id: req.params.id }).lean();
    if (buzz) {
      res.json(buzz);
    } else {
      // Fallback to in-memory array
      const memBuzz = buzzes.find(b => b.id === req.params.id);
      if (memBuzz) {
        res.json(memBuzz);
      } else {
        res.status(404).json({ error: 'Buzz not found' });
      }
    }
  } catch (error) {
    console.error('Get buzz error:', error);
    res.status(500).json({ error: 'Failed to get buzz' });
  }
});

app.post('/api/buzzes', verifyToken, async (req, res) => {
  try {
    // Get user info
    const user = await User.findOne({ id: req.userId }).lean();
    const username = user ? user.username : (req.body.username || 'anonymous');
    const displayName = user ? user.displayName : username;
    
    const newBuzz = new Buzz({
      id: generateId(),
      userId: req.userId,
      username: username,
      displayName: displayName,
      content: req.body.content,
      type: req.body.type || 'text',
      media: req.body.media || { type: null, url: null },
      interests: req.body.interests || [],
      location: req.body.location || null,
      buzzType: req.body.buzzType || 'thought',
      eventDate: req.body.eventDate || null,
      pollOptions: req.body.pollOptions || [],
      likes: 0,
      comments: 0,
      shares: 0,
      isLiked: false,
    });
    
    const savedBuzz = await newBuzz.save();
    
    // Also add to in-memory array for backwards compatibility
    buzzes.push(savedBuzz.toObject());
    
    // Update user buzz count
    if (user) {
      await User.updateOne({ id: req.userId }, { $inc: { buzzCount: 1 } });
    }
    
    res.status(201).json(savedBuzz.toObject());
  } catch (error) {
    console.error('Create buzz error:', error);
    res.status(500).json({ error: 'Failed to create buzz' });
  }
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

// Admin endpoints
app.get('/api/admin/dashboard', verifyAdmin, (req, res) => {
  try {
    const now = new Date();
    const last24Hours = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const last7Days = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const last30Days = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    // User statistics
    const totalUsers = users.length;
    const verifiedUsers = users.filter(u => u.isVerified).length;
    const newUsers24h = users.filter(u => new Date(u.createdAt) > last24Hours).length;
    const newUsers7d = users.filter(u => new Date(u.createdAt) > last7Days).length;
    const newUsers30d = users.filter(u => new Date(u.createdAt) > last30Days).length;

    // Buzz statistics
    const totalBuzzes = buzzes.length;
    const buzzes24h = buzzes.filter(b => new Date(b.createdAt) > last24Hours).length;
    const buzzes7d = buzzes.filter(b => new Date(b.createdAt) > last7Days).length;
    const buzzes30d = buzzes.filter(b => new Date(b.createdAt) > last30Days).length;

    // Engagement statistics
    const totalLikes = buzzes.reduce((sum, b) => sum + b.likes, 0);
    const totalShares = buzzes.reduce((sum, b) => sum + b.shares, 0);
    const totalComments = buzzes.reduce((sum, b) => sum + b.comments, 0);
    const avgLikesPerBuzz = totalBuzzes > 0 ? (totalLikes / totalBuzzes).toFixed(2) : 0;
    const avgSharesPerBuzz = totalBuzzes > 0 ? (totalShares / totalBuzzes).toFixed(2) : 0;

    // Top users by buzz count
    const topUsers = users
      .map(u => ({
        id: u.id,
        username: u.username,
        displayName: u.displayName,
        buzzCount: u.buzzCount,
        followers: u.followers,
        following: u.following,
      }))
      .sort((a, b) => b.buzzCount - a.buzzCount)
      .slice(0, 10);

    // Top buzzes by engagement
    const topBuzzes = buzzes
      .map(b => ({
        id: b.id,
        username: b.username,
        content: b.content.substring(0, 100) + (b.content.length > 100 ? '...' : ''),
        likes: b.likes,
        shares: b.shares,
        comments: b.comments,
        createdAt: b.createdAt,
        totalEngagement: b.likes + b.shares + b.comments,
      }))
      .sort((a, b) => b.totalEngagement - a.totalEngagement)
      .slice(0, 10);

    // Interest analytics
    const interestCounts = {};
    buzzes.forEach(buzz => {
      buzz.interests.forEach(interest => {
        interestCounts[interest.name] = (interestCounts[interest.name] || 0) + 1;
      });
    });
    const topInterests = Object.entries(interestCounts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    // Daily activity for last 7 days
    const dailyActivity = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      const startOfDay = new Date(date.getFullYear(), date.getMonth(), date.getDate());
      const endOfDay = new Date(startOfDay.getTime() + 24 * 60 * 60 * 1000);
      
      const dayBuzzes = buzzes.filter(b => {
        const buzzDate = new Date(b.createdAt);
        return buzzDate >= startOfDay && buzzDate < endOfDay;
      });
      
      const dayUsers = users.filter(u => {
        const userDate = new Date(u.createdAt);
        return userDate >= startOfDay && userDate < endOfDay;
      });

      dailyActivity.push({
        date: startOfDay.toISOString().split('T')[0],
        buzzes: dayBuzzes.length,
        users: dayUsers.length,
        likes: dayBuzzes.reduce((sum, b) => sum + b.likes, 0),
        shares: dayBuzzes.reduce((sum, b) => sum + b.shares, 0),
      });
    }

    res.json({
      success: true,
      data: {
        overview: {
          totalUsers,
          verifiedUsers,
          totalBuzzes,
          totalLikes,
          totalShares,
          totalComments,
          avgLikesPerBuzz,
          avgSharesPerBuzz,
        },
        growth: {
          users24h: newUsers24h,
          users7d: newUsers7d,
          users30d: newUsers30d,
          buzzes24h: buzzes24h,
          buzzes7d: buzzes7d,
          buzzes30d: buzzes30d,
        },
        topUsers,
        topBuzzes,
        topInterests,
        dailyActivity,
        verificationCodes: verificationCodes.size,
        socialAccounts: socialAccounts.length,
      },
    });
  } catch (error) {
    console.error('Admin dashboard error:', error);
    res.status(500).json({ error: 'Failed to fetch dashboard data' });
  }
});

app.get('/api/admin/users', verifyAdmin, async (req, res) => {
  try {
    const { page = 1, limit = 20, search = '', sortBy = 'createdAt', sortOrder = 'desc' } = req.query;
    
    // Build query
    let query = {};
    if (search) {
      query.$or = [
        { username: { $regex: search, $options: 'i' } },
        { displayName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }
    
    // Build sort object
    const sortObj = {};
    sortObj[sortBy] = sortOrder === 'asc' ? 1 : -1;
    
    // Get total count
    const total = await User.countDocuments(query);
    
    // Get paginated users
    const startIndex = (parseInt(page) - 1) * parseInt(limit);
    const paginatedUsers = await User.find(query)
      .select('-password')
      .sort(sortObj)
      .skip(startIndex)
      .limit(parseInt(limit))
      .lean();
    
    res.json({
      success: true,
      data: {
        users: paginatedUsers,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: total,
          pages: Math.ceil(total / parseInt(limit)),
        },
      },
    });
  } catch (error) {
    console.error('Admin users error:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

app.get('/api/admin/buzzes', verifyAdmin, async (req, res) => {
  try {
    const { page = 1, limit = 20, search = '', sortBy = 'createdAt', sortOrder = 'desc' } = req.query;
    
    // Build query
    let query = {};
    if (search) {
      query.$or = [
        { content: { $regex: search, $options: 'i' } },
        { username: { $regex: search, $options: 'i' } },
      ];
    }
    
    // Build sort object
    const sortObj = {};
    sortObj[sortBy] = sortOrder === 'asc' ? 1 : -1;
    
    // Get total count
    const total = await Buzz.countDocuments(query);
    
    // Get paginated buzzes
    const startIndex = (parseInt(page) - 1) * parseInt(limit);
    const paginatedBuzzes = await Buzz.find(query)
      .sort(sortObj)
      .skip(startIndex)
      .limit(parseInt(limit))
      .lean();
    
    res.json({
      success: true,
      data: {
        buzzes: paginatedBuzzes,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: total,
          pages: Math.ceil(total / parseInt(limit)),
        },
      },
    });
  } catch (error) {
    console.error('Admin buzzes error:', error);
    res.status(500).json({ error: 'Failed to fetch buzzes' });
  }
});

app.delete('/api/admin/users/:id', verifyAdmin, async (req, res) => {
  try {
    const userId = req.params.id;
    
    // Delete from database
    const deletedUser = await User.findOneAndDelete({ id: userId });
    
    if (deletedUser) {
      // Delete related data
      await Buzz.deleteMany({ userId });
      await SocialAccount.deleteMany({ userId });
      await Subscription.deleteMany({ userId });
      
      // Also remove from in-memory arrays
      const userIndex = users.findIndex(u => u.id === userId);
      if (userIndex !== -1) users.splice(userIndex, 1);
      buzzes = buzzes.filter(b => b.userId !== userId);
      socialAccounts = socialAccounts.filter(s => s.userId !== userId);
      
      res.json({ success: true, message: 'User deleted successfully' });
    } else {
      // Fallback to in-memory array
      const userIndex = users.findIndex(u => u.id === userId);
      if (userIndex !== -1) {
        users.splice(userIndex, 1);
        buzzes = buzzes.filter(b => b.userId !== userId);
        socialAccounts = socialAccounts.filter(s => s.userId !== userId);
        res.json({ success: true, message: 'User deleted successfully' });
      } else {
        res.status(404).json({ error: 'User not found' });
      }
    }
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ error: 'Failed to delete user' });
  }
});

app.delete('/api/admin/buzzes/:id', verifyAdmin, async (req, res) => {
  try {
    const buzzId = req.params.id;
    
    // Delete from database
    const deletedBuzz = await Buzz.findOneAndDelete({ id: buzzId });
    
    if (deletedBuzz) {
      // Also remove from in-memory array
      const buzzIndex = buzzes.findIndex(b => b.id === buzzId);
      if (buzzIndex !== -1) buzzes.splice(buzzIndex, 1);
      
      // Update user buzz count
      await User.updateOne({ id: deletedBuzz.userId }, { $inc: { buzzCount: -1 } });
      
      res.json({ success: true, message: 'Buzz deleted successfully' });
    } else {
      // Fallback to in-memory array
      const buzzIndex = buzzes.findIndex(b => b.id === buzzId);
      if (buzzIndex !== -1) {
        buzzes.splice(buzzIndex, 1);
        res.json({ success: true, message: 'Buzz deleted successfully' });
      } else {
        res.status(404).json({ error: 'Buzz not found' });
      }
    }
  } catch (error) {
    console.error('Delete buzz error:', error);
    res.status(500).json({ error: 'Failed to delete buzz' });
  }
});

// Remove duplicate users (admin only) - keeps the oldest user for each username
app.post('/api/admin/users/remove-duplicates', verifyAdmin, (req, res) => {
  try {
    const usernameGroups = {};
    const duplicatesToRemove = [];
    
    // Group users by username (case-insensitive)
    users.forEach((user, index) => {
      const usernameKey = user.username.toLowerCase();
      if (!usernameGroups[usernameKey]) {
        usernameGroups[usernameKey] = [];
      }
      usernameGroups[usernameKey].push({ index, user });
    });
    
    // Find duplicates (keep first/oldest, mark others for deletion)
    Object.keys(usernameGroups).forEach(usernameKey => {
      const userGroup = usernameGroups[usernameKey];
      if (userGroup.length > 1) {
        // Sort by creation date (oldest first)
        userGroup.sort((a, b) => {
          const dateA = new Date(a.user.createdAt || 0).getTime();
          const dateB = new Date(b.user.createdAt || 0).getTime();
          return dateA - dateB;
        });
        
        // Keep the first (oldest), mark rest as duplicates
        userGroup.slice(1).forEach(({ index, user }) => {
          duplicatesToRemove.push({ 
            index, 
            id: user.id, 
            username: user.username, 
            createdAt: user.createdAt 
          });
        });
      }
    });
    
    // Remove duplicates (in reverse order to maintain indices)
    duplicatesToRemove.sort((a, b) => b.index - a.index);
    const removed = [];
    duplicatesToRemove.forEach(({ index, id, username, createdAt }) => {
      removed.push({ id, username, createdAt });
      users.splice(index, 1);
    });
    
    res.json({
      success: true,
      message: `Removed ${removed.length} duplicate user(s)`,
      duplicates: removed
    });
  } catch (error) {
    console.error('Remove duplicates error:', error);
    res.status(500).json({ error: 'Failed to remove duplicates' });
  }
});

app.patch('/api/admin/users/:id/ban', verifyAdmin, (req, res) => {
  try {
    const userId = req.params.id;
    const { banned } = req.body;
    
    const userIndex = users.findIndex(u => u.id === userId);
    if (userIndex === -1) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    users[userIndex].banned = banned;
    users[userIndex].bannedAt = banned ? new Date().toISOString() : null;
    
    res.json({ 
      success: true, 
      message: `User ${banned ? 'banned' : 'unbanned'} successfully`,
      user: users[userIndex]
    });
  } catch (error) {
    console.error('Ban user error:', error);
    res.status(500).json({ error: 'Failed to update user status' });
  }
});

// Feature management endpoints
app.get('/api/features', (req, res) => {
  res.json({
    success: true,
    features: appFeatures,
    categories: featureCategories,
    descriptions: featureDescriptions
  });
});

app.patch('/api/features', verifyAdmin, (req, res) => {
  try {
    const { features } = req.body;
    
    if (!features || typeof features !== 'object') {
      return res.status(400).json({ error: 'Invalid features data' });
    }
    
    // Update features
    Object.keys(features).forEach(key => {
      if (defaultFeatures.hasOwnProperty(key)) {
        appFeatures[key] = features[key];
      }
    });
    
    res.json({
      success: true,
      message: 'Features updated successfully',
      features: appFeatures
    });
  } catch (error) {
    console.error('Update features error:', error);
    res.status(500).json({ error: 'Failed to update features' });
  }
});

// Subscription management endpoints
app.get('/api/subscriptions/plans', (req, res) => {
  res.json({
    success: true,
    plans: subscriptionPlans.filter(plan => plan.isActive)
  });
});

app.get('/api/subscriptions/user/:userId', verifyToken, (req, res) => {
  try {
    const userId = req.params.userId;
    const userSub = userSubscriptions.find(sub => sub.userId === userId);
    
    if (!userSub) {
      return res.json({
        success: true,
        subscription: null,
        plan: subscriptionPlans.find(p => p.id === 'basic')
      });
    }
    
    const plan = subscriptionPlans.find(p => p.id === userSub.planId);
    
    res.json({
      success: true,
      subscription: userSub,
      plan: plan
    });
  } catch (error) {
    console.error('Get user subscription error:', error);
    res.status(500).json({ error: 'Failed to get user subscription' });
  }
});

app.post('/api/subscriptions/subscribe', verifyToken, (req, res) => {
  try {
    const { planId } = req.body;
    const userId = req.userId;
    
    const plan = subscriptionPlans.find(p => p.id === planId && p.isActive);
    if (!plan) {
      return res.status(400).json({ error: 'Invalid subscription plan' });
    }
    
    // Check if user already has a subscription
    const existingSub = userSubscriptions.find(sub => sub.userId === userId);
    
    if (existingSub) {
      // Update existing subscription
      existingSub.planId = planId;
      existingSub.subscribedAt = new Date().toISOString();
      existingSub.status = 'active';
    } else {
      // Create new subscription
      const newSubscription = {
        id: generateId(),
        userId: userId,
        planId: planId,
        subscribedAt: new Date().toISOString(),
        status: 'active',
        features: plan.features
      };
      userSubscriptions.push(newSubscription);
    }
    
    res.json({
      success: true,
      message: 'Subscription updated successfully',
      subscription: userSubscriptions.find(sub => sub.userId === userId),
      plan: plan
    });
  } catch (error) {
    console.error('Subscribe error:', error);
    res.status(500).json({ error: 'Failed to subscribe' });
  }
});

app.delete('/api/subscriptions/unsubscribe', verifyToken, (req, res) => {
  try {
    const userId = req.userId;
    
    const subIndex = userSubscriptions.findIndex(sub => sub.userId === userId);
    if (subIndex !== -1) {
      userSubscriptions.splice(subIndex, 1);
    }
    
    res.json({
      success: true,
      message: 'Unsubscribed successfully'
    });
  } catch (error) {
    console.error('Unsubscribe error:', error);
    res.status(500).json({ error: 'Failed to unsubscribe' });
  }
});

// Check if user has access to a feature
app.get('/api/features/check/:feature', verifyToken, (req, res) => {
  try {
    const feature = req.params.feature;
    const userId = req.userId;
    
    // Check if feature is globally enabled
    if (!appFeatures[feature]) {
      return res.json({
        success: true,
        hasAccess: false,
        reason: 'Feature is disabled by admin'
      });
    }
    
    // Check if feature requires subscription
    const userSub = userSubscriptions.find(sub => sub.userId === userId);
    const userPlan = userSub ? subscriptionPlans.find(p => p.id === userSub.planId) : subscriptionPlans.find(p => p.id === 'basic');
    
    const hasAccess = userPlan.features.includes(feature);
    
    res.json({
      success: true,
      hasAccess: hasAccess,
      reason: hasAccess ? 'Access granted' : 'Feature requires subscription upgrade',
      userPlan: userPlan.name
    });
  } catch (error) {
    console.error('Check feature access error:', error);
    res.status(500).json({ error: 'Failed to check feature access' });
  }
});

// Admin subscription management
app.get('/api/admin/subscriptions', verifyAdmin, (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + parseInt(limit);
    const paginatedSubscriptions = userSubscriptions.slice(startIndex, endIndex);
    
    // Add user and plan details
    const subscriptionsWithDetails = paginatedSubscriptions.map(sub => {
      const user = users.find(u => u.id === sub.userId);
      const plan = subscriptionPlans.find(p => p.id === sub.planId);
      return {
        ...sub,
        user: user ? { id: user.id, username: user.username, displayName: user.displayName } : null,
        plan: plan ? { id: plan.id, name: plan.name, price: plan.price } : null
      };
    });
    
    res.json({
      success: true,
      data: {
        subscriptions: subscriptionsWithDetails,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: userSubscriptions.length,
          pages: Math.ceil(userSubscriptions.length / limit)
        }
      }
    });
  } catch (error) {
    console.error('Admin subscriptions error:', error);
    res.status(500).json({ error: 'Failed to fetch subscriptions' });
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

// Initialize database and start server
const startServer = async () => {
  try {
    // Connect to MongoDB
    await connectDB();
    
    // Migrate initial data to database (seed data)
    await migrateInitialData();
    
    // Start server
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`🔥 Buzz it Backend API running on port ${PORT}`);
      console.log(`API URL: http://0.0.0.0:${PORT}`);
      console.log(`💾 Database: MongoDB connected`);
      console.log(`Twilio configured: ${process.env.TWILIO_ACCOUNT_SID ? 'Yes' : 'No'}`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    // Start server anyway (fallback mode)
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`⚠️ Server running in fallback mode (no database)`);
      console.log(`API URL: http://0.0.0.0:${PORT}`);
    });
  }
};

// Migrate initial data from memory to database
const migrateInitialData = async () => {
  try {
    console.log('🔄 Migrating initial data to database...');
    
    // Migrate users
    const existingUsers = await User.countDocuments();
    if (existingUsers === 0 && users.length > 0) {
      console.log('📦 Migrating users to database...');
      for (const user of users) {
        try {
          const userDoc = new User({
            ...user,
            createdAt: new Date(user.createdAt || Date.now()),
          });
          await userDoc.save();
        } catch (err) {
          if (err.code !== 11000) { // Ignore duplicate key errors
            console.error('Error migrating user:', err);
          }
        }
      }
      console.log(`✅ Migrated ${users.length} users`);
    }
    
    // Migrate buzzes
    const existingBuzzes = await Buzz.countDocuments();
    if (existingBuzzes === 0 && buzzes.length > 0) {
      console.log('📦 Migrating buzzes to database...');
      for (const buzz of buzzes) {
        try {
          const buzzDoc = new Buzz({
            ...buzz,
            createdAt: new Date(buzz.createdAt || Date.now()),
          });
          await buzzDoc.save();
        } catch (err) {
          if (err.code !== 11000) {
            console.error('Error migrating buzz:', err);
          }
        }
      }
      console.log(`✅ Migrated ${buzzes.length} buzzes`);
    }
    
    // Create admin user if doesn't exist
    const adminExists = await User.findOne({ username: 'admin' });
    if (!adminExists) {
      const adminUser = new User({
        id: 'admin-1',
        username: 'admin',
        email: 'admin@buzzit.app',
        displayName: 'Admin',
        role: 'super_admin',
        isVerified: true,
        createdAt: new Date(),
      });
      await adminUser.save();
      console.log('✅ Created admin user');
    }
    
    console.log('✅ Migration complete');
  } catch (error) {
    console.error('❌ Migration error:', error);
  }
};

// Start the server
startServer();

// Export for testing
module.exports = app;