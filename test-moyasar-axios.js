// test-moyasar-axios.js

const axios = require('axios');

// Using your test keys
const secretKey = 'sk_test_E2JqZETfMABU3FJMwnWjp3jQx1AGhP5M6Eb54kCW';

let config = {
  method: 'get',
  url: 'https://api.sandbox.moyasar.com/v1/payments', // Using sandbox endpoint
  auth: {
    username: secretKey,
    password: '' // Moyasar uses secret key as username with empty password
  },
  headers: {
    'User-Agent': 'WhelHost-Hotel-Reservation-App/1.0'
  }
};

console.log('Testing Moyasar API connection with axios...');

axios.request(config)
  .then((response) => {
    console.log('✅ Successfully connected to Moyasar API with axios!');
    console.log(`Response Status: ${response.status}`);
    console.log(`Number of payments retrieved: ${response.data.items ? response.data.items.length : 0}`);
    console.log('Full response data:', response.data);
  })
  .catch((error) => {
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      console.log('❌ API Error Response:');
      console.log(`Status: ${error.response.status}`);
      console.log(`Data: ${JSON.stringify(error.response.data)}`);
      console.log(`Headers: ${JSON.stringify(error.response.headers)}`);
    } else if (error.request) {
      // The request was made but no response was received
      console.log('❌ Network Error - No response received:');
      console.log(error.request);
    } else {
      // Something happened in setting up the request that triggered an Error
      console.log('❌ Error:', error.message);
    }
  });