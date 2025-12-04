// test-moyasar-config.js
// This script tests the Moyasar configuration with your test keys

require('dotenv').config({ path: './.env.local' });

const { MOYASAR_CONFIG, validateMoyasarConfig } = require('./lib/moyasar-config');

console.log('Testing Moyasar Configuration...\n');

// Test the configuration values
console.log('Configuration values:');
console.log('Publishable Key:', MOYASAR_CONFIG.publishableKey ? 'SET' : 'NOT SET');
console.log('Secret Key:', MOYASAR_CONFIG.secretKey ? 'SET' : 'NOT SET');
console.log('API URL:', MOYASAR_CONFIG.apiUrl);
console.log('Currency:', MOYASAR_CONFIG.currency);
console.log('Is Sandbox Mode:', MOYASAR_CONFIG.isSandboxMode);
console.log('');

// Validate the configuration
try {
  validateMoyasarConfig();
  console.log('✅ Configuration validation: PASSED');
} catch (error) {
  console.log('❌ Configuration validation: FAILED');
  console.log('Error:', error.message);
}

console.log('\nEnvironment variables:');
console.log('NODE_ENV:', process.env.NODE_ENV || 'not set');
console.log('NEXT_PUBLIC_MOYASAR_PUBLISHABLE_KEY:', process.env.NEXT_PUBLIC_MOYASAR_PUBLISHABLE_KEY ? 'SET' : 'NOT SET');
console.log('MOYASAR_SECRET_KEY:', process.env.MOYASAR_SECRET_KEY ? 'SET' : 'NOT SET');
console.log('MOYASAR_API_URL:', process.env.MOYASAR_API_URL || 'not set');