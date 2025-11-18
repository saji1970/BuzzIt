/**
 * Script to delete all buzzes from a specific user
 * 
 * Usage:
 *   node delete-buzz-by-username.js <username>
 * 
 * Example:
 *   node delete-buzz-by-username.js sajipillai
 */

const https = require('https');
const http = require('http');

const API_BASE_URL = process.env.API_URL || 'https://buzzit-production.up.railway.app';
const ADMIN_USERNAME = process.env.ADMIN_USERNAME || 'admin';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin';

const username = process.argv[2];

if (!username) {
  console.error('❌ Error: Username is required');
  console.log('Usage: node delete-buzz-by-username.js <username>');
  console.log('Example: node delete-buzz-by-username.js sajipillai');
  process.exit(1);
}

async function login() {
  return new Promise((resolve, reject) => {
    const url = new URL(`${API_BASE_URL}/api/auth/login`);
    const postData = JSON.stringify({
      username: ADMIN_USERNAME,
      password: ADMIN_PASSWORD,
    });

    const options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData),
      },
    };

    const req = (url.protocol === 'https:' ? https : http).request(url, options, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        try {
          const response = JSON.parse(data);
          if (response.success && response.token) {
            resolve(response.token);
          } else {
            reject(new Error('Login failed: ' + (response.error || 'Unknown error')));
          }
        } catch (error) {
          reject(new Error('Failed to parse login response: ' + error.message));
        }
      });
    });

    req.on('error', reject);
    req.write(postData);
    req.end();
  });
}

async function deleteBuzzesByUsername(token, username) {
  return new Promise((resolve, reject) => {
    const url = new URL(`${API_BASE_URL}/api/admin/buzzes/by-username/${encodeURIComponent(username)}`);
    const options = {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    };

    const req = (url.protocol === 'https:' ? https : http).request(url, options, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        try {
          const response = JSON.parse(data);
          resolve(response);
        } catch (error) {
          reject(new Error('Failed to parse response: ' + error.message));
        }
      });
    });

    req.on('error', reject);
    req.end();
  });
}

async function main() {
  try {
    console.log(`🔐 Logging in as admin...`);
    const token = await login();
    console.log('✅ Login successful\n');

    console.log(`🗑️  Deleting all buzzes from user "${username}"...`);
    const result = await deleteBuzzesByUsername(token, username);
    
    if (result.success) {
      console.log(`✅ ${result.message}`);
      console.log(`   Deleted: ${result.data.deletedCount} buzz(es)`);
      console.log(`   Total found: ${result.data.totalFound} buzz(es)`);
      if (result.data.memDeleted > 0) {
        console.log(`   Also removed ${result.data.memDeleted} from memory`);
      }
    } else {
      console.error('❌ Error:', result.error);
      process.exit(1);
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

main();

