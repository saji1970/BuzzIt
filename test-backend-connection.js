// Test script to check backend connectivity
const https = require('https');

const testBackend = async () => {
  console.log('Testing backend connection...\n');
  
  const url = 'https://buzzit-production.up.railway.app';
  
  return new Promise((resolve, reject) => {
    const req = https.get(url, (res) => {
      console.log(`Status: ${res.statusCode}`);
      console.log(`Headers:`, res.headers);
      
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        console.log('\nResponse:', data);
        if (res.statusCode === 502) {
          console.error('\n❌ ERROR: Server is returning 502 Bad Gateway');
          console.error('This means the Railway application is not running or has crashed.');
          console.error('\nPossible causes:');
          console.error('1. MongoDB connection failure - Check MONGODB_URI environment variable');
          console.error('2. Server crash on startup - Check Railway logs');
          console.error('3. Missing dependencies - Check if all npm packages are installed');
          console.error('4. RecommendationEngine service issue - Check if file exists');
        } else if (res.statusCode === 200) {
          console.log('\n✅ Server is running correctly!');
        }
        resolve();
      });
    });
    
    req.on('error', (error) => {
      console.error('\n❌ Request error:', error.message);
      reject(error);
    });
    
    req.setTimeout(10000, () => {
      req.destroy();
      console.error('\n❌ Request timeout');
      reject(new Error('Request timeout'));
    });
  });
};

testBackend().catch(console.error);

