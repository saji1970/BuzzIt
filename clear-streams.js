/**
 * Script to clear all existing live streams
 * 
 * Usage:
 *   node clear-streams.js [clear|delete]
 * 
 * Options:
 *   clear  - Mark all streams as ended (keeps in database) [default]
 *   delete - Delete all streams completely from database
 */

const https = require('https');
const http = require('http');

const API_BASE_URL = process.env.API_URL || 'https://buzzit-production.up.railway.app';
const ADMIN_USERNAME = process.env.ADMIN_USERNAME || 'admin';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin';

const action = process.argv[2] || 'clear'; // 'clear' or 'delete'

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

async function clearStreams(token) {
  return new Promise((resolve, reject) => {
    const endpoint = action === 'delete' 
      ? '/api/admin/live-streams/delete-all'
      : '/api/admin/live-streams/clear';
    
    const url = new URL(`${API_BASE_URL}${endpoint}`);
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
    console.log('🔐 Logging in as admin...');
    const token = await login();
    console.log('✅ Login successful\n');

    console.log(`🗑️  ${action === 'delete' ? 'Deleting' : 'Clearing'} all streams...`);
    const result = await clearStreams(token);
    
    if (result.success) {
      console.log(`✅ ${result.message}`);
      console.log(`   ${action === 'delete' ? 'Deleted' : 'Cleared'}: ${result.data.clearedCount || result.data.deletedCount} stream(s)`);
      console.log(`   Total found: ${result.data.totalFound || result.data.totalFound} stream(s)`);
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

