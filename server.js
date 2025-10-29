const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Simple root endpoint for testing
app.get('/', (req, res) => {
  res.json({ 
    message: 'Buzz it Backend API is running!', 
    timestamp: new Date().toISOString(),
    port: PORT 
  });
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    port: PORT 
  });
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🔥 Buzz it Backend API running on port ${PORT}`);
  console.log(`API URL: http://0.0.0.0:${PORT}`);
});
