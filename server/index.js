const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const twilio = require('twilio');
const { v4: uuidv4 } = require('uuid');
// Load environment variables FIRST, before any other imports that might use them
// Try loading from server directory first, then root directory
const path = require('path');
const fs = require('fs');

// Check if .env exists in server directory
const serverEnvPath = path.join(__dirname, '.env');
const rootEnvPath = path.join(__dirname, '..', '.env');

if (fs.existsSync(serverEnvPath)) {
  console.log('📁 Loading .env from server directory');
  require('dotenv').config({ path: serverEnvPath });
} else if (fs.existsSync(rootEnvPath)) {
  console.log('📁 Loading .env from root directory');
  require('dotenv').config({ path: rootEnvPath });
} else {
  console.log('📁 No .env file found, using environment variables');
  require('dotenv').config(); // Still try default locations
}

// Debug: Always log environment variables for troubleshooting (especially for Railway)
console.log('🔍 Environment variable check:');
const dbVars = Object.keys(process.env)
  .filter(key => key.includes('DATABASE') || key.includes('POSTGRES') || key.includes('DB_'))
  .sort();
if (dbVars.length > 0) {
  console.log('  ✅ Found database-related environment variables:');
  dbVars.forEach(key => {
    const value = process.env[key];
    const masked = value ? value.replace(/:([^:@]+)@/, ':****@') : '(empty)';
    console.log(`    - ${key}: ${masked.substring(0, 100)}${masked.length > 100 ? '...' : ''}`);
  });
} else {
  console.log('  ❌ No database-related environment variables found');
  console.log('  💡 Set DATABASE_URL in Railway Backend Service → Variables tab');
}
console.log(`📊 Total environment variables available: ${Object.keys(process.env).length}`);

const { defaultFeatures, featureCategories, featureDescriptions } = require('./config/features');
// Use PostgreSQL instead of MongoDB
const { connectDB, query, getPool } = require('./db/postgres');

// PostgreSQL database functions
const db = {
  query,
  getPool,
  isConnected: () => {
    const pool = getPool();
    return pool !== null;
  }
};

// Import database helper functions
const {
  convertDbUserToObject,
  convertDbBuzzToObject,
  getUserById,
  getUserByUsername,
  getAllUsers,
  getUserCount,
  getUsersPaginated,
  getBuzzById,
  getAllBuzzes,
  getBuzzesPaginated,
} = require('./db/helpers');

// Import services
const RecommendationEngine = require('./services/RecommendationEngine');

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
const publicPath = path.join(__dirname, 'public');
// Only serve static files for non-API routes
app.use((req, res, next) => {
  if (req.path.startsWith('/api/')) {
    return next(); // Skip static file serving for API routes
  }
  express.static(publicPath)(req, res, next);
});

// User login page route
app.get('/user-login', (req, res) => {
  const userLoginPath = path.join(publicPath, 'user-login.html');
  if (fs.existsSync(userLoginPath)) {
    res.sendFile(userLoginPath);
  } else {
    res.status(404).json({ error: 'User login page not found' });
  }
});

// User streaming page route
app.get('/user-streaming', (req, res) => {
  const userStreamingPath = path.join(publicPath, 'user-streaming.html');
  // Try absolute path resolution
  const absolutePath = path.resolve(userStreamingPath);
  
  console.log('🔍 User streaming path check:', {
    publicPath,
    userStreamingPath,
    absolutePath,
    exists: fs.existsSync(userStreamingPath),
    absoluteExists: fs.existsSync(absolutePath)
  });
  
  if (fs.existsSync(userStreamingPath)) {
    res.sendFile(userStreamingPath);
  } else if (fs.existsSync(absolutePath)) {
    res.sendFile(absolutePath);
  } else {
    // Try alternative paths
    const altPath1 = path.join(__dirname, 'public', 'user-streaming.html');
    const altPath2 = path.resolve(__dirname, 'public', 'user-streaming.html');
    
    if (fs.existsSync(altPath1)) {
      res.sendFile(altPath1);
    } else if (fs.existsSync(altPath2)) {
      res.sendFile(altPath2);
    } else {
      console.error('❌ User streaming page not found. Tried paths:', {
        userStreamingPath,
        absolutePath,
        altPath1,
        altPath2,
        __dirname,
        publicPath
      });
      res.status(404).json({ error: 'User streaming page not found' });
    }
  }
});

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
    const admin = await getUserById(decoded.userId);
    
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

    // Check if it's an admin login (check both database and in-memory)
    let admin = null;
    
    // Check in-memory adminUsers first (for backwards compatibility)
    admin = adminUsers.find(a => a.username === username);
    
    // Also check database for admin users (only if connected)
    if (!admin) {
      if (db.isConnected()) {
        try {
          const result = await Promise.race([
            db.query(
              'SELECT * FROM users WHERE LOWER(username) = $1 AND role IN (\'admin\', \'super_admin\')',
              [username.toLowerCase()]
            ),
            new Promise((_, reject) => 
              setTimeout(() => reject(new Error('Database query timeout')), 5000)
            )
          ]);
          
          if (result.rows.length > 0) {
            const dbAdmin = convertDbUserToObject(result.rows[0]);
            admin = { id: dbAdmin.id, username: dbAdmin.username, role: dbAdmin.role };
            
            // Check database admin password
            if (result.rows[0].password) {
              const isPasswordValid = await bcrypt.compare(password, result.rows[0].password);
              if (isPasswordValid) {
                const token = generateToken(dbAdmin.id);
                const { password: _, ...adminWithoutPassword } = dbAdmin;
                return res.json({
                  success: true,
                  user: adminWithoutPassword,
                  token,
                  isAdmin: true,
                });
              }
            }
          }
        } catch (dbError) {
          console.warn('⚠️ Admin database query failed (non-critical):', dbError.message);
          // Continue to check in-memory admin
        }
      }
    }
    
    // Handle in-memory admin (default password: "admin" or "admin123@")
    if (admin && (password === 'admin' || password === 'admin123@')) {
      const token = generateToken(admin.id);
      return res.json({
        success: true,
        user: admin,
        token,
        isAdmin: true,
      });
    }

    // Try to find user in database first (only if connected)
    let user = null;
    let userRow = null;
    
    if (db.isConnected()) {
      try {
        // Add timeout protection for database queries
        const result = await Promise.race([
          db.query('SELECT * FROM users WHERE LOWER(username) = $1', [username.toLowerCase()]),
          new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Database query timeout')), 5000)
          )
        ]);
        
        if (result.rows.length > 0) {
          userRow = result.rows[0];
          user = convertDbUserToObject(userRow);
        }
      } catch (dbError) {
        console.warn('⚠️ Database user query failed (non-critical):', dbError.message);
        // Continue to check in-memory users
      }
    }
    
    // Fallback to in-memory array if not in database or DB is disconnected
    if (!user) {
      const memUser = users.find(u => 
        u.username?.toLowerCase() === username.toLowerCase()
      );
      if (memUser) {
        user = memUser;
        console.log('✅ Found user in memory:', username.toLowerCase());
      }
    }
    
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Handle both database user and in-memory user
    const userObj = user;
    const userPassword = userRow ? userRow.password : (userObj.password || null);
    
    // Debug logging
    console.log('🔍 Login attempt:', {
      username,
      userFound: !!user,
      hasUserRow: !!userRow,
      hasPasswordInRow: !!(userRow?.password),
      hasPasswordInObj: !!(userObj.password),
      passwordLength: userPassword ? userPassword.length : 0,
      passwordStartsWith: userPassword ? userPassword.substring(0, 10) : 'none',
    });
    
    if (!userPassword) {
      console.warn('⚠️ Login attempt for user without password:', username);
      console.warn('   This user was likely created before password hashing was implemented.');
      console.warn('   User ID:', userObj.id);
      
      // For backward compatibility: allow login with any password if user has no password
      // This is a temporary measure for users created before password hashing
      console.warn('   Allowing login without password verification (backward compatibility)');
      
      // Generate token and allow login
      const token = generateToken(userObj.id || userObj._id);
      const isAdmin = adminUsers.some(a => a.id === (userObj.id || userObj._id)) || 
                     userObj.role === 'admin' || userObj.role === 'super_admin';

      // Remove password from response
      const { password: _, ...userWithoutPassword } = userObj;

      return res.json({
        success: true,
        user: userWithoutPassword,
        token,
        isAdmin,
        warning: 'This account has no password. Please update your password in settings for security.'
      });
    }

    // Compare password
    let isPasswordValid = false;
    try {
      // Check if password looks like a bcrypt hash (starts with $2a$, $2b$, or $2y$)
      const isBcryptHash = userPassword && (
        userPassword.startsWith('$2a$') || 
        userPassword.startsWith('$2b$') || 
        userPassword.startsWith('$2y$')
      );
      
      if (!isBcryptHash) {
        console.error('❌ Login error: Password is not a valid bcrypt hash for user:', username);
        console.error('   Password format:', userPassword.substring(0, 20));
        return res.status(401).json({ 
          error: 'Invalid credentials',
          message: 'Password format is invalid. Please reset your password or contact support.'
        });
      }
      
      isPasswordValid = await bcrypt.compare(password, userPassword);
      console.log('🔐 Password comparison result:', isPasswordValid ? '✅ Valid' : '❌ Invalid');
      
      if (!isPasswordValid) {
        console.error('❌ Login error: Password does not match for user:', username);
        return res.status(401).json({ error: 'Invalid credentials' });
      }
    } catch (compareError) {
      console.error('❌ Login error: Password comparison failed:', compareError);
      console.error('   Error details:', {
        message: compareError.message,
        stack: compareError.stack?.split('\n').slice(0, 3),
      });
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = generateToken(userObj.id || userObj._id);
    const isAdmin = adminUsers.some(a => a.id === (userObj.id || userObj._id)) || 
                   userObj.role === 'admin' || userObj.role === 'super_admin';

    // Remove password from response
    const { password: _, ...userWithoutPassword } = userObj;

    res.json({
      success: true,
      user: userWithoutPassword,
      token,
      isAdmin: isAdmin || false,
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

// User endpoints
app.get('/api/users', async (req, res) => {
  try {
    const allUsers = await getAllUsers();
    // Merge with in-memory users (for backwards compatibility)
    const memUserIds = new Set(users.map(u => u.id));
    const dbUserIds = new Set(allUsers.map(u => u.id));
    const uniqueMemUsers = users.filter(u => !dbUserIds.has(u.id));
    // Remove passwords from response
    const usersWithoutPasswords = [...allUsers, ...uniqueMemUsers].map(u => {
      const { password, ...userWithoutPassword } = u;
      return userWithoutPassword;
    });
    res.json(usersWithoutPasswords);
  } catch (error) {
    console.error('Get users error:', error);
    // Fallback to in-memory array
  res.json(users);
  }
});

app.get('/api/users/me', verifyToken, async (req, res) => {
  try {
    const user = await getUserById(req.userId);
  if (user) {
      const { password, ...userWithoutPassword } = user;
      res.json({
        success: true,
        data: userWithoutPassword
      });
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
    const user = await getUserById(req.params.id);
  if (user) {
      const { password, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
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
    console.log('POST /api/users - Request received:', {
    username: req.body.username,
    displayName: req.body.displayName,
      hasInterests: !!req.body.interests?.length,
    });

    // Validate required fields
    if (!req.body.username) {
      console.error('Create user error: Username is required');
      return res.status(400).json({ error: 'Username is required' });
    }

    // Check if database is connected
    const dbConnected = db.isConnected();
    
    if (!dbConnected) {
      console.warn('⚠️ PostgreSQL not connected, attempting to reconnect...');
      try {
        await connectDB();
      } catch (dbError) {
        console.error('❌ Failed to connect to PostgreSQL:', dbError);
        // Continue with in-memory fallback for username check
      }
    }

    // Check if username already exists (case-insensitive)
    let existingUser = null;
    try {
      if (db.isConnected()) {
        const result = await db.query(
          'SELECT * FROM users WHERE LOWER(username) = $1',
          [req.body.username.toLowerCase()]
        );
        if (result.rows.length > 0) {
          existingUser = result.rows[0];
        }
      }
      
      // Also check in-memory array as fallback
      if (!existingUser) {
        existingUser = users.find(u => 
          u.username?.toLowerCase() === req.body.username.toLowerCase()
        );
      }
    } catch (findError) {
      console.error('Error checking existing user:', findError);
      // Continue - allow creation even if check fails (will fail on duplicate later)
    }
    
    if (existingUser) {
      console.error('Create user error: Username already exists:', req.body.username);
      return res.status(400).json({ 
        error: 'Username already exists',
        message: `The username "${req.body.username}" is already taken. Please choose another username.`
      });
    }

    const userId = generateId();
    
    // Hash password if provided
    let hashedPassword = null;
    if (req.body.password) {
      try {
        hashedPassword = await bcrypt.hash(req.body.password, 10);
        console.log('✅ Password hashed successfully');
      } catch (hashError) {
        console.error('❌ Error hashing password:', hashError);
        return res.status(500).json({ 
          error: 'Failed to process password',
          message: 'Unable to secure password. Please try again.'
        });
      }
    }
    
    const newUserData = {
      id: userId,
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
      password: hashedPassword,
    };
    
    let savedUser;
    try {
      if (db.isConnected()) {
        const result = await db.query(`
          INSERT INTO users (
            id, username, password, display_name, email, mobile_number, bio, avatar,
            date_of_birth, interests, followers, following, buzz_count,
            subscribed_channels, blocked_users, is_verified
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)
          RETURNING *
        `, [
          newUserData.id,
          newUserData.username,
          newUserData.password,
          newUserData.displayName,
          newUserData.email,
          newUserData.mobileNumber,
          newUserData.bio,
          newUserData.avatar,
          newUserData.dateOfBirth,
          JSON.stringify(newUserData.interests),
          newUserData.followers,
          newUserData.following,
          newUserData.buzzCount,
          JSON.stringify(newUserData.subscribedChannels),
          JSON.stringify(newUserData.blockedUsers),
          newUserData.isVerified
        ]);
        
        savedUser = convertDbUserToObject(result.rows[0]);
        console.log('✅ User saved to database:', savedUser.username);
      } else {
        console.warn('⚠️ Database not connected, saving to memory only');
        savedUser = {
          ...newUserData,
          password: hashedPassword, // Store hashed password in memory too
          createdAt: new Date(),
        };
      }
    } catch (saveError) {
      console.error('Error saving user:', saveError);
      if (saveError.code === '23505') { // PostgreSQL unique violation
        return res.status(400).json({ 
          error: 'Username already exists',
          message: `The username "${req.body.username}" is already taken.`
        });
      }
      // If database save fails, still add to memory
      savedUser = {
        ...newUserData,
        password: hashedPassword, // Store hashed password in memory too
        createdAt: new Date(),
      };
      console.warn('⚠️ Saved user to memory only due to database error');
    }
    
    // Also add to in-memory array for backwards compatibility (with hashed password)
    const userForMemory = {
      ...savedUser,
      password: hashedPassword, // Ensure password is stored in memory for fallback login
    };
    users.push(userForMemory);
    
    console.log('✅ User created successfully:', savedUser.username);
    
    // Return user object without password (for security)
    const { password: _, ...userWithoutPassword } = savedUser;
    res.status(201).json(userWithoutPassword);
  } catch (error) {
    console.error('❌ Create user error:', error);
    console.error('Error stack:', error.stack);
    console.error('Error code:', error.code);
    console.error('Error message:', error.message);
    
    if (error.code === 11000) {
      return res.status(400).json({ 
        error: 'Username already exists',
        message: `The username "${req.body.username}" is already taken.`
      });
    }
    
    // Provide more detailed error message
    const errorMessage = error.message || 'Failed to create user';
    console.error('Returning error response:', errorMessage);
    res.status(500).json({ 
      error: 'Failed to create user',
      message: errorMessage,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

app.patch('/api/users/:id', verifyToken, async (req, res) => {
  if (req.params.id !== req.userId) {
    return res.status(403).json({ error: 'Forbidden' });
  }

  try {
    let updatedUser = null;
    
    if (db.isConnected()) {
      // Build update query dynamically based on provided fields
      const updateFields = [];
      const values = [];
      let paramIndex = 1;

      // Handle password update with hashing
      if (req.body.password !== undefined) {
        const hashedPassword = await bcrypt.hash(req.body.password, 10);
        updateFields.push(`password = $${paramIndex}`);
        values.push(hashedPassword);
        paramIndex++;
        console.log('✅ Password will be updated for user:', req.params.id);
      }

      if (req.body.displayName !== undefined) {
        updateFields.push(`display_name = $${paramIndex++}`);
        values.push(req.body.displayName);
      }
      if (req.body.email !== undefined) {
        updateFields.push(`email = $${paramIndex++}`);
        values.push(req.body.email);
      }
      if (req.body.bio !== undefined) {
        updateFields.push(`bio = $${paramIndex++}`);
        values.push(req.body.bio);
      }
      if (req.body.avatar !== undefined) {
        updateFields.push(`avatar = $${paramIndex++}`);
        values.push(req.body.avatar);
      }
      if (req.body.interests !== undefined) {
        updateFields.push(`interests = $${paramIndex++}`);
        values.push(JSON.stringify(req.body.interests));
      }
      if (req.body.subscribedChannels !== undefined) {
        updateFields.push(`subscribed_channels = $${paramIndex++}`);
        values.push(JSON.stringify(req.body.subscribedChannels));
      }
      if (req.body.blockedUsers !== undefined) {
        updateFields.push(`blocked_users = $${paramIndex++}`);
        values.push(JSON.stringify(req.body.blockedUsers));
      }

      if (updateFields.length > 0) {
        updateFields.push(`updated_at = CURRENT_TIMESTAMP`);
        values.push(req.params.id);
        
        const result = await db.query(
          `UPDATE users SET ${updateFields.join(', ')} WHERE id = $${paramIndex++} RETURNING *`,
          values
        );
        
        if (result.rows.length > 0) {
          updatedUser = convertDbUserToObject(result.rows[0]);
        }
      } else {
        // No fields to update, just get current user
        updatedUser = await getUserById(req.params.id);
      }
    }
    
    if (updatedUser) {
      // Also update in-memory array
      const memIndex = users.findIndex(u => u.id === req.params.id);
      if (memIndex !== -1) {
        users[memIndex] = { ...users[memIndex], ...req.body };
      }
      const { password, ...userWithoutPassword } = updatedUser;
      res.json(userWithoutPassword);
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
    const username = req.params.username.toLowerCase().trim();
    
    if (!username || username.length < 3) {
      return res.json({ available: false });
    }
    
    // Check database first
    let dbUser = null;
    try {
      if (db.isConnected()) {
        dbUser = await getUserByUsername(username);
      }
    } catch (dbError) {
      console.error('Database check error:', dbError);
      // Continue to check in-memory array as fallback
    }
    
    // Check in-memory array
    const memUser = users.find(u => u.username && u.username.toLowerCase() === username);
    
    const exists = !!(dbUser || memUser);
    
    console.log(`Username check: "${username}" - exists: ${exists}, dbUser: ${!!dbUser}, memUser: ${!!memUser}`);
    
  res.json({ available: !exists });
  } catch (error) {
    console.error('Check username error:', error);
    // On error, default to allowing username (better UX than blocking all)
    res.json({ available: true });
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
    let dbBuzzes = await getAllBuzzes({ userId });
    
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
    const buzz = await getBuzzById(req.params.id);
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
    const user = await getUserById(req.userId);
    const username = user ? user.username : (req.body.username || 'anonymous');
    const displayName = user ? user.displayName : username;
    
    const buzzId = generateId();
    const newBuzzData = {
      id: buzzId,
    userId: req.userId,
      username: username,
      displayName: displayName,
    content: req.body.content,
      type: req.body.type || 'text',
      mediaType: req.body.media?.type || null,
      mediaUrl: req.body.media?.url || null,
    interests: req.body.interests || [],
      locationLatitude: req.body.location?.latitude || null,
      locationLongitude: req.body.location?.longitude || null,
      locationCity: req.body.location?.city || null,
      locationCountry: req.body.location?.country || null,
      buzzType: req.body.buzzType || 'thought',
      eventDate: req.body.eventDate || null,
      pollOptions: req.body.pollOptions || [],
    likes: 0,
    comments: 0,
    shares: 0,
    isLiked: false,
  };
    
    let savedBuzz;
    if (db.isConnected()) {
      try {
        const result = await db.query(`
          INSERT INTO buzzes (
            id, user_id, username, display_name, content, type, media_type, media_url,
            interests, location_latitude, location_longitude, location_city, location_country,
            buzz_type, event_date, poll_options, likes, comments, shares, is_liked
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20)
          RETURNING *
        `, [
          newBuzzData.id,
          newBuzzData.userId,
          newBuzzData.username,
          newBuzzData.displayName,
          newBuzzData.content,
          newBuzzData.type,
          newBuzzData.mediaType,
          newBuzzData.mediaUrl,
          JSON.stringify(newBuzzData.interests),
          newBuzzData.locationLatitude,
          newBuzzData.locationLongitude,
          newBuzzData.locationCity,
          newBuzzData.locationCountry,
          newBuzzData.buzzType,
          newBuzzData.eventDate,
          JSON.stringify(newBuzzData.pollOptions),
          newBuzzData.likes,
          newBuzzData.comments,
          newBuzzData.shares,
          newBuzzData.isLiked,
        ]);
        
        savedBuzz = convertDbBuzzToObject(result.rows[0]);
      } catch (saveError) {
        console.error('Error saving buzz to database:', saveError);
        savedBuzz = {
          ...newBuzzData,
          createdAt: new Date(),
          media: {
            type: newBuzzData.mediaType,
            url: newBuzzData.mediaUrl,
          },
        };
      }
    } else {
      savedBuzz = {
        ...newBuzzData,
        createdAt: new Date(),
        media: {
          type: newBuzzData.mediaType,
          url: newBuzzData.mediaUrl,
        },
      };
    }
    
    // Also add to in-memory array for backwards compatibility
    buzzes.push(savedBuzz);
    
    // Update user buzz count
    if (db.isConnected() && user) {
      try {
        await db.query(
          'UPDATE users SET buzz_count = buzz_count + 1 WHERE id = $1',
          [req.userId]
        );
      } catch (error) {
        console.error('Error updating user buzz count:', error);
      }
    }
    
    res.status(201).json(savedBuzz);
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
    
    // Get paginated users
    const { users: paginatedUsers, total } = await getUsersPaginated(
      parseInt(page),
      parseInt(limit),
      { role: req.query.role }
    );
    
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
    
    // Get paginated buzzes
    const { buzzes: paginatedBuzzes, total } = await getBuzzesPaginated(
      parseInt(page),
      parseInt(limit),
      { userId: req.query.userId }
    );
    
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
    let deletedUser = null;
    if (db.isConnected()) {
      try {
        const result = await db.query('DELETE FROM users WHERE id = $1 RETURNING *', [userId]);
        if (result.rows.length > 0) {
          deletedUser = convertDbUserToObject(result.rows[0]);
          
          // Delete related data
          await db.query('DELETE FROM buzzes WHERE user_id = $1', [userId]);
          await db.query('DELETE FROM user_interactions WHERE user_id = $1', [userId]);
          await db.query('DELETE FROM live_streams WHERE user_id = $1', [userId]);
        }
      } catch (dbError) {
        console.error('Database delete error:', dbError);
      }
    }
    
    if (deletedUser) {
      
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

// Live Stream endpoints
app.get('/api/live-streams', async (req, res) => {
  try {
    let liveStreams = [];
    
    if (db.isConnected()) {
      try {
        const result = await db.query(
          'SELECT * FROM live_streams WHERE is_live = true ORDER BY viewers DESC, started_at DESC LIMIT 20'
        );
        liveStreams = result.rows.map(row => ({
          id: row.id,
          userId: row.user_id,
          username: row.username,
          displayName: row.display_name,
          title: row.title,
          description: row.description,
          streamUrl: row.stream_url,
          thumbnailUrl: row.thumbnail_url,
          isLive: row.is_live,
          viewers: row.viewers,
          category: row.category,
          tags: typeof row.tags === 'string' ? JSON.parse(row.tags) : (row.tags || []),
          channelId: row.channel_id,
          startedAt: row.started_at,
          endedAt: row.ended_at,
        }));
      } catch (dbError) {
        console.error('Database live streams error:', dbError);
      }
    }
    
    res.json({
      success: true,
      data: liveStreams,
    });
  } catch (error) {
    console.error('Get live streams error:', error);
    res.status(500).json({ error: 'Failed to fetch live streams' });
  }
});

app.get('/api/live-streams/:id', async (req, res) => {
  try {
    let stream = null;
    
    if (db.isConnected()) {
      try {
        const result = await db.query('SELECT * FROM live_streams WHERE id = $1', [req.params.id]);
        if (result.rows.length > 0) {
          const row = result.rows[0];
          stream = {
            id: row.id,
            userId: row.user_id,
            username: row.username,
            displayName: row.display_name,
            title: row.title,
            description: row.description,
            streamUrl: row.stream_url,
            thumbnailUrl: row.thumbnail_url,
            isLive: row.is_live,
            viewers: row.viewers,
            category: row.category,
            tags: typeof row.tags === 'string' ? JSON.parse(row.tags) : (row.tags || []),
            channelId: row.channel_id,
            startedAt: row.started_at,
            endedAt: row.ended_at,
          };
        }
      } catch (dbError) {
        console.error('Database live stream error:', dbError);
      }
    }
    
    if (stream) {
      res.json({
        success: true,
        data: stream,
      });
    } else {
      res.status(404).json({ error: 'Live stream not found' });
    }
  } catch (error) {
    console.error('Get live stream error:', error);
    res.status(500).json({ error: 'Failed to fetch live stream' });
  }
});

app.post('/api/live-streams', verifyToken, async (req, res) => {
  try {
    const user = await getUserById(req.userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Check if user already has an active stream
    let existingStream = null;
    if (db.isConnected()) {
      try {
        const result = await db.query(
          'SELECT * FROM live_streams WHERE user_id = $1 AND is_live = true',
          [req.userId]
        );
        if (result.rows.length > 0) {
          existingStream = result.rows[0];
        }
      } catch (dbError) {
        console.error('Database check error:', dbError);
      }
    }
    
    if (existingStream) {
      return res.status(400).json({ 
        error: 'You already have an active live stream. Please end it first.' 
      });
    }

    const streamId = generateId();
    const newStreamData = {
      id: streamId,
      userId: req.userId,
      username: user.username,
      displayName: user.displayName,
      title: req.body.title || `${user.displayName}'s Live Stream`,
      description: req.body.description || '',
      streamUrl: req.body.streamUrl || `rtmp://live.example.com/stream/${req.userId}`,
      thumbnailUrl: req.body.thumbnailUrl || user.avatar,
      isLive: true,
      viewers: 0,
      category: req.body.category || 'general',
      tags: req.body.tags || [],
      channelId: req.body.channelId || null,
    };

    let savedStream;
    if (db.isConnected()) {
      try {
        const result = await db.query(`
          INSERT INTO live_streams (
            id, user_id, username, display_name, title, description, stream_url,
            thumbnail_url, is_live, viewers, category, tags, channel_id
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
          RETURNING *
        `, [
          newStreamData.id,
          newStreamData.userId,
          newStreamData.username,
          newStreamData.displayName,
          newStreamData.title,
          newStreamData.description,
          newStreamData.streamUrl,
          newStreamData.thumbnailUrl,
          newStreamData.isLive,
          newStreamData.viewers,
          newStreamData.category,
          JSON.stringify(newStreamData.tags),
          newStreamData.channelId,
        ]);
        
        const row = result.rows[0];
        savedStream = {
          id: row.id,
          userId: row.user_id,
          username: row.username,
          displayName: row.display_name,
          title: row.title,
          description: row.description,
          streamUrl: row.stream_url,
          thumbnailUrl: row.thumbnail_url,
          isLive: row.is_live,
          viewers: row.viewers,
          category: row.category,
          tags: typeof row.tags === 'string' ? JSON.parse(row.tags) : (row.tags || []),
          channelId: row.channel_id,
          startedAt: row.started_at,
        };
      } catch (saveError) {
        console.error('Error saving live stream:', saveError);
        savedStream = { ...newStreamData, startedAt: new Date() };
      }
    } else {
      savedStream = { ...newStreamData, startedAt: new Date() };
    }
    
    res.status(201).json({
      success: true,
      data: savedStream,
    });
  } catch (error) {
    console.error('Create live stream error:', error);
    res.status(500).json({ error: 'Failed to create live stream' });
  }
});

app.patch('/api/live-streams/:id/viewers', async (req, res) => {
  try {
    const { action } = req.body; // 'increment' or 'decrement'
    
    if (!db.isConnected()) {
      return res.status(503).json({ error: 'Database not available' });
    }
    
    let result;
    if (action === 'increment') {
      result = await db.query(
        'UPDATE live_streams SET viewers = viewers + 1 WHERE id = $1 RETURNING *',
        [req.params.id]
      );
    } else if (action === 'decrement') {
      result = await db.query(
        'UPDATE live_streams SET viewers = GREATEST(viewers - 1, 0) WHERE id = $1 RETURNING *',
        [req.params.id]
      );
    } else {
      return res.status(400).json({ error: 'Invalid action. Use "increment" or "decrement"' });
    }
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Live stream not found' });
    }
    
    const row = result.rows[0];
    const stream = {
      id: row.id,
      userId: row.user_id,
      username: row.username,
      displayName: row.display_name,
      title: row.title,
      description: row.description,
      streamUrl: row.stream_url,
      thumbnailUrl: row.thumbnail_url,
      isLive: row.is_live,
      viewers: row.viewers,
      category: row.category,
      tags: typeof row.tags === 'string' ? JSON.parse(row.tags) : (row.tags || []),
      startedAt: row.started_at,
      endedAt: row.ended_at,
    };
    
    res.json({
      success: true,
      data: stream,
    });
  } catch (error) {
    console.error('Update viewers error:', error);
    res.status(500).json({ error: 'Failed to update viewers' });
  }
});

// AI Recommendation endpoints
app.get('/api/recommendations/users', verifyToken, async (req, res) => {
  try {
    const userId = req.userId;
    
    // Get current user
    const currentUser = await getUserById(userId);
    if (!currentUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Get all users (excluding current user)
    let allUsers = await getAllUsers();
    allUsers = allUsers.filter(u => u.id !== userId).map(u => {
      const { password, ...userWithoutPassword } = u;
      return userWithoutPassword;
    });

    // Get user interactions for preference analysis
    let interactions = [];
    if (db.isConnected()) {
      try {
        const result = await db.query(
          'SELECT * FROM user_interactions WHERE user_id = $1 ORDER BY timestamp DESC LIMIT 100',
          [userId]
        );
        interactions = result.rows.map(row => ({
          id: row.id,
          userId: row.user_id,
          buzzId: row.buzz_id,
          type: row.type,
          timestamp: row.timestamp,
          metadata: typeof row.metadata === 'string' ? JSON.parse(row.metadata) : (row.metadata || {}),
        }));
      } catch (dbError) {
        console.error('Database interactions error:', dbError);
      }
    }

    // Get user's buzzes for analysis
    const userBuzzes = await getAllBuzzes({ userId });

    // Analyze user preferences
    const preferences = RecommendationEngine.analyzeUserPreferences(
      currentUser,
      userBuzzes,
      interactions
    );

    // Get contacts and social connections from request (passed from frontend)
    const contacts = req.query.contacts ? JSON.parse(req.query.contacts) : [];
    const socialConnections = req.query.socialConnections 
      ? JSON.parse(req.query.socialConnections) 
      : [];

    // Get recommendations
    const recommendations = RecommendationEngine.recommendUsers(
      currentUser,
      allUsers,
      contacts,
      socialConnections
    );

    res.json({
      success: true,
      data: {
        recommendations: recommendations.map(rec => ({
          user: rec.user,
          score: rec.score,
          reasons: rec.reasons,
        })),
        preferences,
      },
    });
  } catch (error) {
    console.error('Recommendations error:', error);
    res.status(500).json({ error: 'Failed to get recommendations' });
  }
});

app.get('/api/recommendations/buzzes', verifyToken, async (req, res) => {
  try {
    const userId = req.userId;
    const { limit = 50 } = req.query;

    // Get current user
    const currentUser = await getUserById(userId);
    if (!currentUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Get user interactions
    let interactions = [];
    if (db.isConnected()) {
      try {
        const result = await db.query(
          'SELECT * FROM user_interactions WHERE user_id = $1 ORDER BY timestamp DESC LIMIT 100',
          [userId]
        );
        interactions = result.rows.map(row => ({
          id: row.id,
          userId: row.user_id,
          buzzId: row.buzz_id,
          type: row.type,
          timestamp: row.timestamp,
          metadata: typeof row.metadata === 'string' ? JSON.parse(row.metadata) : (row.metadata || {}),
        }));
      } catch (dbError) {
        console.error('Database interactions error:', dbError);
      }
    }

    // Get user's buzzes
    let userBuzzes = await getAllBuzzes({ userId });
    userBuzzes = userBuzzes.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 50);

    // Get all buzzes
    let allBuzzes = await getAllBuzzes({});
    allBuzzes = allBuzzes.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 500);

    // Analyze preferences
    const preferences = RecommendationEngine.analyzeUserPreferences(
      currentUser,
      userBuzzes,
      interactions
    );

    // Get user location if available
    const userLocation = currentUser.location || null;

    // Get smart feed
    const smartFeed = RecommendationEngine.getSmartFeed(
      allBuzzes,
      preferences,
      userLocation,
      parseInt(limit)
    );

    res.json({
      success: true,
      data: {
        buzzes: smartFeed,
        preferences,
      },
    });
  } catch (error) {
    console.error('Smart feed error:', error);
    res.status(500).json({ error: 'Failed to get smart feed' });
  }
});

app.post('/api/interactions', verifyToken, async (req, res) => {
  try {
    const { buzzId, type, metadata } = req.body;

    if (!buzzId || !type) {
      return res.status(400).json({ error: 'Buzz ID and type are required' });
    }

    if (db.isConnected()) {
      try {
        const result = await db.query(`
          INSERT INTO user_interactions (user_id, buzz_id, type, metadata)
          VALUES ($1, $2, $3, $4)
          RETURNING *
        `, [
          req.userId,
          buzzId,
          type,
          JSON.stringify(metadata || {}),
        ]);
        
        const row = result.rows[0];
        const interaction = {
          id: row.id,
          userId: row.user_id,
          buzzId: row.buzz_id,
          type: row.type,
          timestamp: row.timestamp,
          metadata: typeof row.metadata === 'string' ? JSON.parse(row.metadata) : (row.metadata || {}),
        };
        
        res.json({
          success: true,
          data: interaction,
        });
      } catch (saveError) {
        console.error('Error saving interaction:', saveError);
        res.status(500).json({ error: 'Failed to create interaction' });
      }
    } else {
      res.status(503).json({ error: 'Database not available' });
    }
  } catch (error) {
    console.error('Create interaction error:', error);
    res.status(500).json({ error: 'Failed to create interaction' });
  }
});

// Scheduled Streams Endpoints
app.post('/api/live-streams/schedule', verifyToken, async (req, res) => {
  console.log('📅 POST /api/live-streams/schedule - Request received');
  try {
    const { title, description, category, scheduledAt } = req.body;
    
    if (!title || !scheduledAt) {
      return res.status(400).json({ error: 'Title and scheduled time are required' });
    }

    const user = await getUserById(req.userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const scheduledDate = new Date(scheduledAt);
    if (scheduledDate <= new Date()) {
      return res.status(400).json({ error: 'Scheduled time must be in the future' });
    }

    if (!db.isConnected()) {
      return res.status(503).json({ error: 'Database not available' });
    }

    const streamId = generateId();
    const buzzId = generateId();

    // Create scheduled stream
    await db.query(`
      INSERT INTO scheduled_streams (
        id, user_id, username, display_name, title, description, category, scheduled_at, created_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
    `, [
      streamId,
      req.userId,
      user.username,
      user.displayName || user.username,
      title,
      description || '',
      category || 'general',
      scheduledDate,
      new Date(),
    ]);

    // Create buzz with countdown
    await db.query(`
      INSERT INTO buzzes (
        id, user_id, username, display_name, content, type, buzz_type, event_date, created_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
    `, [
      buzzId,
      req.userId,
      user.username,
      user.displayName || user.username,
      `🎥 Live Stream: ${title}\n\n${description || ''}\n\n⏰ Scheduled for: ${scheduledDate.toLocaleString()}`,
      'text',
      'event',
      scheduledDate,
      new Date(),
    ]);

    res.status(201).json({
      success: true,
      data: {
        id: streamId,
        userId: req.userId,
        title,
        description: description || '',
        category: category || 'general',
        scheduledAt: scheduledDate,
        buzzId,
      },
    });
  } catch (error) {
    console.error('Schedule stream error:', error);
    res.status(500).json({ error: 'Failed to schedule stream' });
  }
});

app.get('/api/live-streams/scheduled', verifyToken, async (req, res) => {
  console.log('📅 GET /api/live-streams/scheduled - Request received');
  try {
    if (!db.isConnected()) {
      return res.status(503).json({ error: 'Database not available' });
    }

    const result = await db.query(
      'SELECT * FROM scheduled_streams WHERE user_id = $1 ORDER BY scheduled_at ASC',
      [req.userId]
    );

    const scheduledStreams = result.rows.map(row => ({
      id: row.id,
      userId: row.user_id,
      username: row.username,
      displayName: row.display_name,
      title: row.title,
      description: row.description,
      category: row.category,
      scheduledAt: row.scheduled_at,
      createdAt: row.created_at,
    }));

    res.json({
      success: true,
      data: scheduledStreams,
    });
  } catch (error) {
    console.error('Get scheduled streams error:', error);
    res.status(500).json({ error: 'Failed to fetch scheduled streams' });
  }
});

app.post('/api/live-streams/scheduled/:id/start', verifyToken, async (req, res) => {
  try {
    if (!db.isConnected()) {
      return res.status(503).json({ error: 'Database not available' });
    }

    // Get scheduled stream
    const scheduledResult = await db.query(
      'SELECT * FROM scheduled_streams WHERE id = $1 AND user_id = $2',
      [req.params.id, req.userId]
    );

    if (scheduledResult.rows.length === 0) {
      return res.status(404).json({ error: 'Scheduled stream not found' });
    }

    const scheduled = scheduledResult.rows[0];

    // Check if user already has an active stream
    const existingResult = await db.query(
      'SELECT * FROM live_streams WHERE user_id = $1 AND is_live = true',
      [req.userId]
    );

    if (existingResult.rows.length > 0) {
      return res.status(400).json({ 
        error: 'You already have an active live stream. Please end it first.' 
      });
    }

    const user = await getUserById(req.userId);
    const streamId = generateId();

    // Create live stream from scheduled
    const streamResult = await db.query(`
      INSERT INTO live_streams (
        id, user_id, username, display_name, title, description, stream_url,
        thumbnail_url, is_live, viewers, category, tags, started_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
      RETURNING *
    `, [
      streamId,
      req.userId,
      user.username,
      user.displayName || user.username,
      scheduled.title,
      scheduled.description,
      `rtmp://live.example.com/stream/${req.userId}`,
      user.avatar || null,
      true,
      0,
      scheduled.category,
      JSON.stringify([]),
      new Date(),
    ]);

    // Delete scheduled stream
    await db.query('DELETE FROM scheduled_streams WHERE id = $1', [req.params.id]);

    const row = streamResult.rows[0];
    const stream = {
      id: row.id,
      userId: row.user_id,
      username: row.username,
      displayName: row.display_name,
      title: row.title,
      description: row.description,
      streamUrl: row.stream_url,
      thumbnailUrl: row.thumbnail_url,
      isLive: row.is_live,
      viewers: row.viewers,
      category: row.category,
      tags: typeof row.tags === 'string' ? JSON.parse(row.tags) : (row.tags || []),
      startedAt: row.started_at,
    };

    res.status(201).json({
      success: true,
      data: stream,
    });
  } catch (error) {
    console.error('Start scheduled stream error:', error);
    res.status(500).json({ error: 'Failed to start scheduled stream' });
  }
});

app.delete('/api/live-streams/scheduled/:id', verifyToken, async (req, res) => {
  try {
    if (!db.isConnected()) {
      return res.status(503).json({ error: 'Database not available' });
    }

    const result = await db.query(
      'DELETE FROM scheduled_streams WHERE id = $1 AND user_id = $2 RETURNING *',
      [req.params.id, req.userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Scheduled stream not found' });
    }

    res.json({
      success: true,
      message: 'Scheduled stream cancelled',
    });
  } catch (error) {
    console.error('Cancel scheduled stream error:', error);
    res.status(500).json({ error: 'Failed to cancel scheduled stream' });
  }
});

// Interests endpoint
app.get('/api/interests', async (req, res) => {
  try {
    // Return available interests
    const interests = [
      { id: 'tech', name: 'Technology', category: 'Technology', emoji: '💻' },
      { id: 'sports', name: 'Sports', category: 'Sports', emoji: '⚽' },
      { id: 'music', name: 'Music', category: 'Entertainment', emoji: '🎵' },
      { id: 'food', name: 'Food', category: 'Lifestyle', emoji: '🍔' },
      { id: 'travel', name: 'Travel', category: 'Lifestyle', emoji: '✈️' },
      { id: 'fitness', name: 'Fitness', category: 'Health', emoji: '💪' },
      { id: 'art', name: 'Art', category: 'Creative', emoji: '🎨' },
      { id: 'fashion', name: 'Fashion', category: 'Lifestyle', emoji: '👗' },
      { id: 'gaming', name: 'Gaming', category: 'Entertainment', emoji: '🎮' },
      { id: 'education', name: 'Education', category: 'Education', emoji: '📚' },
      { id: 'business', name: 'Business', category: 'Business', emoji: '💼' },
      { id: 'politics', name: 'Politics', category: 'News', emoji: '🏛️' },
      { id: 'science', name: 'Science', category: 'Education', emoji: '🔬' },
      { id: 'nature', name: 'Nature', category: 'Lifestyle', emoji: '🌲' },
      { id: 'photography', name: 'Photography', category: 'Creative', emoji: '📷' },
    ];
    
    res.json({
      success: true,
      data: interests,
    });
  } catch (error) {
    console.error('Get interests error:', error);
    res.status(500).json({ error: 'Failed to fetch interests' });
  }
});

// Channels Endpoints
app.post('/api/channels', verifyToken, async (req, res) => {
  try {
    const { name, description, interests } = req.body;
    
    if (!name || !name.trim()) {
      return res.status(400).json({ error: 'Channel name is required' });
    }

    const user = await getUserById(req.userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (!db.isConnected()) {
      return res.status(503).json({ error: 'Database not available' });
    }

    const channelId = generateId();

    // Create channel in database
    await db.query(`
      INSERT INTO channels (
        id, user_id, username, display_name, name, description, interests, created_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
    `, [
      channelId,
      req.userId,
      user.username,
      user.displayName || user.username,
      name.trim(),
      description ? description.trim() : '',
      JSON.stringify(interests || []),
      new Date(),
    ]);

    res.status(201).json({
      success: true,
      data: {
        id: channelId,
        userId: req.userId,
        username: user.username,
        displayName: user.displayName || user.username,
        name: name.trim(),
        description: description ? description.trim() : '',
        interests: interests || [],
        createdAt: new Date(),
      },
    });
  } catch (error) {
    console.error('Create channel error:', error);
    
    // Check if it's a duplicate channel name error
    if (error.code === '23505') {
      return res.status(400).json({ error: 'Channel name already exists' });
    }
    
    res.status(500).json({ error: 'Failed to create channel' });
  }
});

app.get('/api/channels', verifyToken, async (req, res) => {
  try {
    if (!db.isConnected()) {
      return res.status(503).json({ error: 'Database not available' });
    }

    const result = await db.query(
      'SELECT * FROM channels WHERE user_id = $1 ORDER BY created_at DESC',
      [req.userId]
    );

    const channels = result.rows.map(row => ({
      id: row.id,
      userId: row.user_id,
      username: row.username,
      displayName: row.display_name,
      name: row.name,
      description: row.description,
      interests: typeof row.interests === 'string' ? JSON.parse(row.interests) : (row.interests || []),
      createdAt: row.created_at,
    }));

    res.json({
      success: true,
      data: channels,
    });
  } catch (error) {
    console.error('Get channels error:', error);
    res.status(500).json({ error: 'Failed to fetch channels' });
  }
});

app.delete('/api/channels/:id', verifyToken, async (req, res) => {
  try {
    if (!db.isConnected()) {
      return res.status(503).json({ error: 'Database not available' });
    }

    const result = await db.query(
      'DELETE FROM channels WHERE id = $1 AND user_id = $2 RETURNING *',
      [req.params.id, req.userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Channel not found' });
    }

    res.json({
      success: true,
      message: 'Channel deleted successfully',
    });
  } catch (error) {
    console.error('Delete channel error:', error);
    res.status(500).json({ error: 'Failed to delete channel' });
  }
});

// Stream Comments Endpoints
app.get('/api/live-streams/:id/comments', async (req, res) => {
  try {
    const streamId = req.params.id;
    
    if (!db.isConnected()) {
      return res.status(503).json({ error: 'Database not available' });
    }
    
    const result = await db.query(
      'SELECT * FROM stream_comments WHERE stream_id = $1 ORDER BY created_at ASC',
      [streamId]
    );
    
    const comments = result.rows.map(row => ({
      id: row.id,
      streamId: row.stream_id,
      userId: row.user_id,
      username: row.username,
      displayName: row.display_name,
      comment: row.comment,
      timestamp: row.created_at,
    }));
    
    res.json({
      success: true,
      data: comments,
    });
  } catch (error) {
    console.error('Get stream comments error:', error);
    res.status(500).json({ error: 'Failed to fetch comments' });
  }
});

app.post('/api/live-streams/:id/comments', verifyToken, async (req, res) => {
  try {
    const streamId = req.params.id;
    const { comment } = req.body;
    
    if (!comment || !comment.trim()) {
      return res.status(400).json({ error: 'Comment cannot be empty' });
    }
    
    const user = await getUserById(req.userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    if (!db.isConnected()) {
      return res.status(503).json({ error: 'Database not available' });
    }
    
    // Check if stream exists
    const streamCheck = await db.query('SELECT id FROM live_streams WHERE id = $1', [streamId]);
    if (streamCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Stream not found' });
    }
    
    const commentId = generateId();
    const result = await db.query(
      `INSERT INTO stream_comments (id, stream_id, user_id, username, display_name, comment)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [commentId, streamId, req.userId, user.username, user.displayName || user.username, comment.trim()]
    );
    
    const newComment = {
      id: result.rows[0].id,
      streamId: result.rows[0].stream_id,
      userId: result.rows[0].user_id,
      username: result.rows[0].username,
      displayName: result.rows[0].display_name,
      comment: result.rows[0].comment,
      timestamp: result.rows[0].created_at,
    };
    
    res.status(201).json({
      success: true,
      data: newComment,
    });
  } catch (error) {
    console.error('Create stream comment error:', error);
    res.status(500).json({ error: 'Failed to create comment' });
  }
});

app.patch('/api/live-streams/:id/end', verifyToken, async (req, res) => {
  try {
    let stream = null;
    
    if (db.isConnected()) {
      try {
        // First check if stream exists and get user ID
        const checkResult = await db.query('SELECT * FROM live_streams WHERE id = $1', [req.params.id]);
        if (checkResult.rows.length === 0) {
          return res.status(404).json({ error: 'Live stream not found' });
        }
        
        const row = checkResult.rows[0];
        if (row.user_id !== req.userId) {
          return res.status(403).json({ error: 'Forbidden' });
        }
        
        // Update stream
        const result = await db.query(
          'UPDATE live_streams SET is_live = false, ended_at = CURRENT_TIMESTAMP WHERE id = $1 RETURNING *',
          [req.params.id]
        );
        
        if (result.rows.length > 0) {
          const updatedRow = result.rows[0];
          stream = {
            id: updatedRow.id,
            userId: updatedRow.user_id,
            username: updatedRow.username,
            displayName: updatedRow.display_name,
            title: updatedRow.title,
            description: updatedRow.description,
            streamUrl: updatedRow.stream_url,
            thumbnailUrl: updatedRow.thumbnail_url,
            isLive: updatedRow.is_live,
            viewers: updatedRow.viewers,
            category: updatedRow.category,
            tags: typeof updatedRow.tags === 'string' ? JSON.parse(updatedRow.tags) : (updatedRow.tags || []),
            channelId: updatedRow.channel_id,
            startedAt: updatedRow.started_at,
            endedAt: updatedRow.ended_at,
          };
        }
      } catch (dbError) {
        console.error('Database stream end error:', dbError);
        return res.status(500).json({ error: 'Failed to end live stream' });
      }
    } else {
      return res.status(503).json({ error: 'Database not available' });
    }

    res.json({
      success: true,
      data: stream,
      message: 'Live stream ended successfully',
    });
  } catch (error) {
    console.error('End live stream error:', error);
    res.status(500).json({ error: 'Failed to end live stream' });
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
    // Connect to PostgreSQL
    await connectDB();
    
    // Migrate initial data to database (seed data)
    await migrateInitialData();

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🔥 Buzz it Backend API running on port ${PORT}`);
  console.log(`API URL: http://0.0.0.0:${PORT}`);
      console.log(`💾 Database: ${db.isConnected() ? 'PostgreSQL connected ✅' : 'Not connected ⚠️ (in-memory mode)'}`);
  console.log(`Twilio configured: ${process.env.TWILIO_ACCOUNT_SID ? 'Yes' : 'No'}`);
});
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    console.error('Error stack:', error.stack);
    
    // If database connection fails, still start server in fallback mode
    // but log the error clearly
    if (error.message && (error.message.includes('PostgreSQL') || error.message.includes('Database'))) {
      console.error('⚠️ PostgreSQL connection failed, starting in fallback mode');
      app.listen(PORT, '0.0.0.0', () => {
        console.log(`⚠️ Server running in fallback mode (no database)`);
        console.log(`API URL: http://0.0.0.0:${PORT}`);
        console.log('⚠️ Some features may not work without database connection');
      });
    } else {
      // For other errors, try to start server anyway
      console.error('⚠️ Starting server despite error (some features may not work)');
      app.listen(PORT, '0.0.0.0', () => {
        console.log(`⚠️ Server running in degraded mode`);
        console.log(`API URL: http://0.0.0.0:${PORT}`);
      });
    }
  }
};

// Migrate initial data from memory to database
const migrateInitialData = async () => {
  try {
    if (!db.isConnected()) {
      console.log('⚠️ Database not connected, skipping migration');
      return;
    }

    console.log('🔄 Migrating initial data to database...');
    
    // Migrate users
    const userCountResult = await db.query('SELECT COUNT(*) as count FROM users');
    const existingUsers = parseInt(userCountResult.rows[0].count) || 0;
    
    if (users.length > 0) {
      console.log(`📦 Migrating ${users.length} users to database...`);
      let migratedCount = 0;
      for (const user of users) {
        try {
          await db.query(`
            INSERT INTO users (
              id, username, display_name, email, mobile_number, bio, avatar,
              date_of_birth, interests, followers, following, buzz_count,
              subscribed_channels, blocked_users, is_verified, role, created_at
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)
            ON CONFLICT (id) DO NOTHING
          `, [
            user.id,
            user.username?.toLowerCase() || '',
            user.displayName || user.username,
            user.email || `${user.username}@buzzit.app`,
            user.mobileNumber || '',
            user.bio || '',
            user.avatar,
            user.dateOfBirth,
            JSON.stringify(user.interests || []),
            user.followers || 0,
            user.following || 0,
            user.buzzCount || 0,
            JSON.stringify(user.subscribedChannels || []),
            JSON.stringify(user.blockedUsers || []),
            user.isVerified || false,
            user.role || 'user',
            new Date(user.createdAt || Date.now()),
          ]);
          migratedCount++;
        } catch (err) {
          if (err.code !== '23505') { // Ignore duplicate key errors
            console.error('Error migrating user:', err);
          }
        }
      }
      console.log(`✅ Migrated ${migratedCount} users (${users.length - migratedCount} already existed)`);
    }
    
    // Migrate buzzes
    const buzzCountResult = await db.query('SELECT COUNT(*) as count FROM buzzes');
    const existingBuzzes = parseInt(buzzCountResult.rows[0].count) || 0;
    
    if (buzzes.length > 0) {
      console.log(`📦 Migrating ${buzzes.length} buzzes to database...`);
      let migratedCount = 0;
      for (const buzz of buzzes) {
        try {
          await db.query(`
            INSERT INTO buzzes (
              id, user_id, username, display_name, content, type, media_type, media_url,
              interests, location_latitude, location_longitude, location_city, location_country,
              buzz_type, event_date, poll_options, likes, comments, shares, is_liked, created_at
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21)
            ON CONFLICT (id) DO NOTHING
          `, [
            buzz.id,
            buzz.userId,
            buzz.username || '',
            buzz.displayName || buzz.username,
            buzz.content || '',
            buzz.type || 'text',
            buzz.media?.type || null,
            buzz.media?.url || null,
            JSON.stringify(buzz.interests || []),
            buzz.location?.latitude || null,
            buzz.location?.longitude || null,
            buzz.location?.city || null,
            buzz.location?.country || null,
            buzz.buzzType || 'thought',
            buzz.eventDate || null,
            JSON.stringify(buzz.pollOptions || []),
            buzz.likes || 0,
            buzz.comments || 0,
            buzz.shares || 0,
            buzz.isLiked || false,
            new Date(buzz.createdAt || Date.now()),
          ]);
          migratedCount++;
        } catch (err) {
          if (err.code !== '23505') {
            console.error('Error migrating buzz:', err);
          }
        }
      }
      console.log(`✅ Migrated ${migratedCount} buzzes (${buzzes.length - migratedCount} already existed)`);
    }
    
    // Create admin user if doesn't exist (with password)
    const adminResult = await db.query('SELECT * FROM users WHERE username = $1', ['admin']);
    if (adminResult.rows.length === 0) {
      // Hash admin password (default: "admin123@")
      const hashedPassword = await bcrypt.hash('admin123@', 10);
      await db.query(`
        INSERT INTO users (
          id, username, display_name, email, password, role, is_verified, created_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      `, [
        'admin-1',
        'admin',
        'Admin',
        'admin@buzzit.app',
        hashedPassword,
        'super_admin',
        true,
        new Date(),
      ]);
      console.log('✅ Created admin user (username: admin, password: admin123@)');
    } else if (!adminResult.rows[0].password) {
      // If admin exists but has no password, add one
      const hashedPassword = await bcrypt.hash('admin', 10);
      await db.query('UPDATE users SET password = $1 WHERE username = $2', [hashedPassword, 'admin']);
      console.log('✅ Updated admin user with password');
    }
    
    console.log('✅ Migration completed');
  } catch (error) {
    console.error('❌ Migration error:', error);
    console.error('Migration error stack:', error.stack);
    // Don't throw - allow server to start even if migration fails
  }
};

// Start the server
startServer();

// Export for testing
module.exports = app;