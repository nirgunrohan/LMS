import axios from 'axios';
import * as dotenv from 'dotenv';

// Load environment variables from the .env file
dotenv.config();

// The base URL for your local API
const API_BASE_URL = 'http://localhost:3000/api/auth';

async function testEndpoints() {
  try {
    const userEmail = 'test@example.com';
    const userPassword = process.env.TEST_PASSWORD; // Securely load password

    if (!userPassword) {
      throw new Error('TEST_PASSWORD not found in .env file.');
    }

    console.log('Testing registration endpoint...');
    const registerBody = {
      name: 'Test User',
      email: userEmail,
      password: userPassword,
      userType: 'user',
    };

    const registerResponse = await axios.post(`${API_BASE_URL}/register`, registerBody);
    console.log('✅ Registration response:', registerResponse.data);

    console.log('\nTesting login endpoint...');
    const loginBody = {
      email: userEmail,
      password: userPassword,
    };

    const loginResponse = await axios.post(`${API_BASE_URL}/login`, loginBody);
    console.log('✅ Login response:', loginResponse.data);

  } catch (error) {
    // Axios provides more detailed error information
    if (axios.isAxiosError(error)) {
      console.error('❌ Error testing endpoints:', error.response?.data || error.message);
    } else {
      console.error('❌ An unexpected error occurred:', error);
    }
  }
}

testEndpoints();