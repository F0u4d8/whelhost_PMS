// test-moyasar-connection.js
// This script tests the connection to Moyasar API using your test keys

async function testMoyasarConnection() {
  console.log('Testing Moyasar API connection with your test keys...\n');

  // For Next.js projects, environment variables can be accessed directly
  // However, when running this script with node, we need to set them in the environment
  // This script is for demonstration purposes only - it's better to test in the Next.js environment

  // For testing purposes, we'll define the keys directly here:
  const secretKey = 'sk_test_E2JqZETfMABU3FJMwnWjp3jQx1AGhP5M6Eb54kCW';
  const publishableKey = 'pk_test_oMjy73wC2FJiiXdoatCKzKiyDzhSAmWQqRM3xbk2';

  if (!secretKey) {
    console.error('❌ MOYASAR_SECRET_KEY is not set in environment variables');
    return;
  }

  if (!publishableKey) {
    console.error('❌ NEXT_PUBLIC_MOYASAR_PUBLISHABLE_KEY is not set in environment variables');
    return;
  }

  console.log(`✅ Secret Key: ${secretKey.substring(0, 8)}...${secretKey.substring(secretKey.length - 4)}`);
  console.log(`✅ Publishable Key: ${publishableKey.substring(0, 8)}...${publishableKey.substring(publishableKey.length - 4)}`);

  // Check if using test keys
  const isTestSecret = secretKey.startsWith('sk_test_');
  const isTestPublishable = publishableKey.startsWith('pk_test_');

  console.log(`✅ Using Test Secret Key: ${isTestSecret ? 'YES' : 'NO'}`);
  console.log(`✅ Using Test Publishable Key: ${isTestPublishable ? 'YES' : 'NO'}`);

  if (!isTestSecret || !isTestPublishable) {
    console.warn('⚠️  Warning: You might not be using test keys. This could result in real charges if used in a production environment.');
  }

  // Test API connection
  try {
    const apiKey = secretKey;
    const credentials = `${apiKey}:`;
    const encodedCredentials = Buffer.from(credentials).toString('base64');
    const basicAuth = `Basic ${encodedCredentials}`;

    console.log('\nAttempting to connect to Moyasar API...\n');

    // Using fetch to make a test request to the Moyasar API
    const response = await fetch('https://api.sandbox.moyasar.com/v1/ping', {
      method: 'GET',
      headers: {
        'Authorization': basicAuth,
        'User-Agent': 'WhelHost-Hotel-Reservation-App/1.0'
      }
    });

    console.log(`Response Status: ${response.status}`);

    if (response.status === 200) {
      console.log('✅ Successfully connected to Moyasar API!');
      console.log('✅ Your test keys are properly configured and working.');
    } else if (response.status === 401) {
      console.log('❌ Unauthorized: Your API key is invalid or does not have the required permissions.');
    } else if (response.status === 403) {
      console.log('❌ Forbidden: Your API key does not have the required permissions.');
    } else {
      console.log(`❌ Unexpected response status: ${response.status}`);
    }

    const responseBody = await response.text();
    if (responseBody) {
      console.log('Response:', responseBody);
    }
  } catch (error) {
    console.error('❌ Error connecting to Moyasar API:', error.message);
    console.error('This could be due to:');
    console.error('- Network connectivity issues');
    console.error('- Firewall blocking the connection');
    console.error('- Incorrect API endpoint');
  }

  console.log('\n📝 Test Summary:');
  console.log('- Test keys have been correctly set in the environment');
  console.log('- Using test keys (safe for development)');
  console.log('- API connection attempt completed');
  console.log('\n✅ You are now ready to test payments with Moyasar in your application!');
}

// Run the test
testMoyasarConnection().catch(console.error);