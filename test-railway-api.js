const https = require('https');

console.log('Testing Railway API...');

const options = {
  hostname: 'buzzit-production.up.railway.app',
  port: 443,
  path: '/api/features',
  method: 'GET',
  headers: {
    'User-Agent': 'Node.js Test'
  }
};

const req = https.request(options, (res) => {
  console.log(`Status: ${res.statusCode}`);
  console.log(`Headers:`, res.headers);
  
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    console.log('Response:', data);
  });
});

req.on('error', (error) => {
  console.error('Error:', error);
});

req.end();
