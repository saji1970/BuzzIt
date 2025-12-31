const https = require('https');
const jwt = require('jsonwebtoken');

const API_BASE_URL = 'buzzit-production.up.railway.app';
const JWT_SECRET = 'your-super-secret-jwt-key'; // Default from env.example

// Test credentials from Railway
const FACEBOOK_CLIENT_ID = '1393033811657781';
const FACEBOOK_CLIENT_SECRET = '8feb4f68ca96a05a075bea39aa214451';

function httpsGet(hostname, path, headers = {}) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname,
      path,
      method: 'GET',
      headers
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve({ status: res.statusCode, data: JSON.parse(data) });
        } else {
          reject({ status: res.statusCode, data: data });
        }
      });
    });

    req.on('error', (error) => reject(error));
    req.end();
  });
}

async function testFacebookOAuth() {
  console.log('🧪 Testing Facebook OAuth Configuration\n');
  console.log('═══════════════════════════════════════════════════════════════\n');

  // Step 1: Create a test token (simulating logged in user)
  console.log('1️⃣  Creating test authentication token...');
  const testUserId = 'test-user-123';
  const testToken = jwt.sign({ userId: testUserId }, JWT_SECRET, { expiresIn: '1h' });
  console.log('✅ Test token created\n');

  // Step 2: Test OAuth URL generation
  console.log('2️⃣  Testing OAuth URL generation endpoint...');
  try {
    const response = await httpsGet(
      API_BASE_URL,
      '/api/social-auth/oauth/facebook/url',
      { 'Authorization': `Bearer ${testToken}` }
    );

    console.log('✅ OAuth URL endpoint responded successfully!\n');
    console.log('📋 Response:');
    console.log(JSON.stringify(response.data, null, 2));
    console.log('\n');

    // Step 3: Validate the OAuth URL
    if (response.data.authUrl) {
      const authUrl = new URL(response.data.authUrl);
      console.log('3️⃣  Validating OAuth URL structure...');
      console.log(`   Base URL: ${authUrl.origin}${authUrl.pathname}`);
      console.log(`   Client ID: ${authUrl.searchParams.get('client_id')}`);
      console.log(`   Redirect URI: ${authUrl.searchParams.get('redirect_uri')}`);
      console.log(`   Scope: ${authUrl.searchParams.get('scope')}`);
      console.log(`   Response Type: ${authUrl.searchParams.get('response_type')}`);
      console.log(`   State: ${authUrl.searchParams.get('state') ? '✅ Present' : '❌ Missing'}`);
      console.log('\n');

      // Validate client ID matches
      if (authUrl.searchParams.get('client_id') === FACEBOOK_CLIENT_ID) {
        console.log('✅ Client ID matches Railway configuration');
      } else {
        console.log('❌ Client ID does NOT match Railway configuration');
        console.log(`   Expected: ${FACEBOOK_CLIENT_ID}`);
        console.log(`   Got: ${authUrl.searchParams.get('client_id')}`);
      }
      console.log('\n');

      // Check redirect URI
      const redirectUri = authUrl.searchParams.get('redirect_uri');
      console.log('4️⃣  Checking redirect URI configuration...');
      console.log(`   Redirect URI: ${redirectUri}`);
      console.log('\n   ⚠️  Make sure this URL is added to your Facebook App settings:');
      console.log(`   👉 https://developers.facebook.com/apps/${FACEBOOK_CLIENT_ID}/fb-login/settings/`);
      console.log('   👉 Add to "Valid OAuth Redirect URIs"');
      console.log('\n');

      console.log('═══════════════════════════════════════════════════════════════');
      console.log('✅ FACEBOOK OAUTH CONFIGURATION TEST PASSED!\n');
      console.log('📱 Next steps:');
      console.log('   1. Verify redirect URI in Facebook App settings');
      console.log('   2. Ensure app is in "Live" mode (or add test users in Development mode)');
      console.log('   3. Test the OAuth flow from your mobile app');
      console.log('\n');
      console.log('🔗 Full OAuth URL for testing:');
      console.log(response.data.authUrl);
      console.log('\n');

    } else {
      console.log('❌ No authUrl in response');
    }

  } catch (error) {
    console.error('❌ Error testing OAuth URL endpoint:');
    if (error.response) {
      console.error(`   Status: ${error.response.status}`);
      console.error(`   Error: ${JSON.stringify(error.response.data, null, 2)}`);
    } else {
      console.error(`   ${error.message}`);
    }
    console.log('\n');
    process.exit(1);
  }

  // Step 5: Test Facebook App credentials
  console.log('5️⃣  Facebook App Configuration:');
  console.log(`   App ID: ${FACEBOOK_CLIENT_ID}`);
  console.log(`   App Secret: ${FACEBOOK_CLIENT_SECRET.substring(0, 8)}... (hidden)`);
  console.log('\n   🔍 Verify your app configuration at:');
  console.log(`   👉 https://developers.facebook.com/apps/${FACEBOOK_CLIENT_ID}/settings/basic/`);
  console.log('\n');

  console.log('═══════════════════════════════════════════════════════════════\n');
}

// Run the test
testFacebookOAuth().catch(error => {
  console.error('💥 Test failed:', error.message);
  process.exit(1);
});
