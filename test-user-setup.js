// Test user setup script
const API_BASE_URL = 'http://127.0.0.1:3000';

const testUser = {
  username: 'testuser',
  password: 'Test123!',
  buzzProfileName: 'Test Buzzer',
  interests: ['Technology', 'Music', 'Sports'],
  mobileNumber: '+1234567890'
};

async function createTestUser() {
  try {
    console.log('Creating test user...');
    
    // First, try to register the user
    const registerResponse = await fetch(`${API_BASE_URL}/api/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username: testUser.username,
        password: testUser.password,
        buzzProfileName: testUser.buzzProfileName,
        interests: testUser.interests,
        mobileNumber: testUser.mobileNumber
      })
    });
    
    const registerData = await registerResponse.json();
    console.log('Register response:', registerData);
    
    if (registerData.success) {
      console.log('✅ Test user created successfully!');
      console.log('Username:', testUser.username);
      console.log('Password:', testUser.password);
    } else {
      console.log('❌ Failed to create test user:', registerData.error);
    }
    
    // Test login
    console.log('\nTesting login...');
    const loginResponse = await fetch(`${API_BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username: testUser.username,
        password: testUser.password
      })
    });
    
    const loginData = await loginResponse.json();
    console.log('Login response:', loginData);
    
    if (loginData.success) {
      console.log('✅ Login successful!');
    } else {
      console.log('❌ Login failed:', loginData.error);
    }
    
  } catch (error) {
    console.error('Error:', error);
  }
}

createTestUser();
