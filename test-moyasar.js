// test-moyasar.js - Simple test script to verify Moyasar functionality
const https = require('https');

// Test configuration
const config = {
  secretKey: process.env.MOYASAR_SECRET_KEY || 'sk_test_5485343124345345345345345345345345345345',
  apiUrl: process.env.MOYASAR_API_URL || 'https://api-test.moyasar.com/v1/',
  publishableKey: process.env.NEXT_PUBLIC_MOYASAR_PUBLISHABLE_KEY || 'pk_test_5485343124345345345345345345345345345345',
};

console.log('Testing Moyasar configuration...');
console.log('API URL:', config.apiUrl);
console.log('Public Key (first 10 chars):', config.publishableKey.substring(0, 10));
console.log('Secret Key (first 10 chars):', config.secretKey.substring(0, 10));

// Function to create basic auth header (browser-compatible version)
function createBasicAuth() {
  const credentials = `${config.secretKey}:`;
  return `Basic ${btoa(credentials)}`;
}

// Test payment creation function (for Node.js environment)
function createBasicAuthNode(secretKey) {
  const credentials = Buffer.from(`${secretKey}:`).toString('base64');
  return `Basic ${credentials}`;
}

// Test the API endpoint structure
console.log('\nTesting API endpoint access...');
console.log('Expected payment creation endpoint:', config.apiUrl + 'payments');
console.log('Expected payment retrieval endpoint:', config.apiUrl + 'payments/{id}');

// Check environment variables
if (!process.env.MOYASAR_SECRET_KEY) {
  console.log('\n⚠️  WARNING: MOYASAR_SECRET_KEY environment variable is not set');
} else {
  console.log('\n✓ MOYASAR_SECRET_KEY environment variable is set');
}

if (!process.env.NEXT_PUBLIC_MOYASAR_PUBLISHABLE_KEY) {
  console.log('⚠️  WARNING: NEXT_PUBLIC_MOYASAR_PUBLISHABLE_KEY environment variable is not set');
} else {
  console.log('✓ NEXT_PUBLIC_MOYASAR_PUBLISHABLE_KEY environment variable is set');
}

// Test authentication header creation
console.log('\nTesting authentication header creation...');
try {
  // In browser environment we would use btoa(), but in Node.js we need Buffer
  const credentials = Buffer.from(`${config.secretKey}:`).toString('base64');
  const basicAuth = `Basic ${credentials}`;
  console.log('✓ Authentication header created successfully');
  console.log('Auth header (first 20 chars):', basicAuth.substring(0, 20) + '...');
} catch (error) {
  console.log('✗ Error creating authentication header:', error.message);
}

console.log('\nMoyasar payment integration test completed.');
console.log('Note: This is a basic configuration check. For full functionality test:');
console.log('1. Start your Next.js server with `npm run dev`');
console.log('2. Visit http://localhost:3000/test-moyasar');
console.log('3. Try the payment creation test to verify the API endpoints work');