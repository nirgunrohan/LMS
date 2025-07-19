import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

async function testEndpoints() {
  try {
    console.log('Testing registration endpoint...');
    const registerBody = {
      name: "Test User",
      email: "test@example.com",
      password: "YourStrongP@ss123",
      userType: "user"
    };

    const registerCommand = `
      Invoke-WebRequest -Uri "http://localhost:3000/api/auth/register" `
      + `-Method POST `
      + `-Body '${JSON.stringify(registerBody)}' `
      + `-ContentType "application/json"
    `;

    const { stdout: registerOutput } = await execAsync(registerCommand);
    console.log('Registration response:', registerOutput);

    console.log('\nTesting login endpoint...');
    const loginBody = {
      email: "test@example.com",
      password: "YourStrongP@ss123"
    };

    const loginCommand = `
      Invoke-WebRequest -Uri "http://localhost:3000/api/auth/login" `
      + `-Method POST `
      + `-Body '${JSON.stringify(loginBody)}' `
      + `-ContentType "application/json"
    `;

    const { stdout: loginOutput } = await execAsync(loginCommand);
    console.log('Login response:', loginOutput);

  } catch (error) {
    console.error('Error testing endpoints:', error);
  }
}

testEndpoints();
