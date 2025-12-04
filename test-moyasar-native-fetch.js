// test-moyasar-native-fetch.js

// Using your test keys
const secretKey = 'sk_test_E2JqZETfMABU3FJMwnWjp3jQx1AGhP5M6Eb54kCW';

console.log('Testing Moyasar API connection with native fetch...');

// Create authorization header
const credentials = `${secretKey}:`;
const encodedCredentials = Buffer.from(credentials).toString('base64');
const headers = {
  'Authorization': `Basic ${encodedCredentials}`,
  'User-Agent': 'WhelHost-Hotel-Reservation-App/1.0'
};

fetch('https://api.sandbox.moyasar.com/v1/payments', {
  method: 'GET',
  headers
})
  .then(response => {
    console.log(`Response Status: ${response.status}`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response.json();
  })
  .then(data => {
    console.log('✅ Successfully connected to Moyasar API with native fetch!');
    console.log(`Number of payments retrieved: ${data.items ? data.items.length : 0}`);
    console.log('Full response data:', data);
  })
  .catch(error => {
    console.log('❌ Error with native fetch:', error.message);
    console.log('This might be due to network restrictions, firewall settings, or the API server not being accessible from this environment.');
  });