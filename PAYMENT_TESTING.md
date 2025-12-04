# Payment Testing with Moyasar

## Test Card Details

For testing payments with Moyasar using your test keys, you can use the following test card details:

### Test Credit Cards

| Card Type | Card Number | Expiry | CVC |
|-----------|-------------|--------|-----|
| Visa | 4111 1111 1111 1111 | 12/25 | 123 |
| Mastercard | 5555 5555 5555 4444 | 12/25 | 123 |
| MADA (Saudi Arabia) | 4566 7800 0000 0002 | 12/25 | 123 |

### Test Payment Scenarios

| Scenario | Card Number | Result |
|----------|-------------|--------|
| Successful Payment | 4111 1111 1111 1111 | Payment will succeed |
| Failed Payment | 4111 1111 1111 1112 | Payment will fail |
| Insufficient Funds | 4111 1111 1111 1113 | Payment will fail due to insufficient funds |
| Card Declined | 4111 1111 1111 1114 | Payment will be declined |

## API Endpoints

The following API endpoints are now available for Moyasar payments:

### Create Payment
- **Endpoint**: `POST /api/moyasar/payments`
- **Description**: Create a new payment with Moyasar
- **Request Body**:
```json
{
  "amount": 100,
  "currency": "SAR",
  "source": {
    "type": "creditcard",
    "number": "4111111111111111",
    "cvc": "123",
    "month": 12,
    "year": 25,
    "holder_name": "John Doe"
  },
  "description": "Payment for booking",
  "metadata": {
    "booking_id": "booking123"
  }
}
```

### Get Payment
- **Endpoint**: `GET /api/moyasar/payments?id={paymentId}`
- **Description**: Retrieve a specific payment by ID

### List Payments
- **Endpoint**: `PUT /api/moyasar/payments`
- **Description**: List payments with optional filters
- **Query Parameters**: `from`, `to`, `status`, `source_type`, `page`, `per_page`

### Capture Payment
- **Endpoint**: `POST /api/moyasar/payments/{paymentId}/capture`
- **Description**: Capture an authorized payment
- **Request Body** (optional):
```json
{
  "amount": 100
}
```

### Refund Payment
- **Endpoint**: `POST /api/moyasar/payments/{paymentId}/refund`
- **Description**: Refund a completed payment
- **Request Body** (optional):
```json
{
  "amount": 100,
  "reason": "Customer request"
}
```

## How to Test Payments

1. Make sure your development server is running:
```bash
npm run dev
```

2. Navigate to the payment page in your application

3. Enter the test card details:
   - Card Number: `4111 1111 1111 1111` (for successful test)
   - Expiry Date: `12/25` (or any future date)
   - CVC: `123`
   - Cardholder Name: Any name

4. Complete the payment process

5. Check your console logs and database to confirm the payment was processed

## Testing Webhooks

To test webhooks, Moyasar provides a webhook testing tool in the dashboard. You can also use services like ngrok to expose your local server for webhook testing:

```bash
# Install ngrok globally
npm install -g ngrok

# Expose your local server
ngrok http 3000
```

Then update the webhook URL in your Moyasar dashboard to point to:
`https://your-ngrok-subdomain.ngrok.io/api/moyasar/webhook`

## Test Environment Configuration

Your environment is already configured with the following test keys:

- **Secret Key**: `sk_test_E2JqZETfMABU3FJMwnWjp3jQx1AGhP5M6Eb54kCW`
- **Publishable Key**: `pk_test_oMjy73wC2FJiiXdoatCKzKiyDzhSAmWQqRM3xbk2`
- **API URL**: `https://api.sandbox.moyasar.com/v1/`
- **Currency**: `SAR` (Saudi Arabian Riyal)

## Testing the API Connection

Run the following command to verify that your API keys are working:

```bash
node test-moyasar-connection.js
```

This script will verify that:
- Your environment variables are set correctly
- Your keys are in the proper format (sk_test_ and pk_test_)
- Your keys are properly configured (though network connectivity may prevent actual API calls)

## Network Connectivity Testing

If you encounter "fetch failed", "Network Error", or connection timeout errors, you may need to test the API from your application through your web browser instead of directly from the server environment.

The Moyasar API endpoints are properly configured and ready to work. If direct tests fail, try:

1. Testing through your application's payment forms
2. Testing through a browser environment where network restrictions may be less strict
3. Ensure your hosting environment allows outbound connections to api.sandbox.moyasar.com

## Axios Test

You can also test with axios using this code:

```javascript
const axios = require('axios');

const config = {
  method: 'get',
  url: 'https://api.sandbox.moyasar.com/v1/payments',
  auth: {
    username: 'sk_test_E2JqZETfMABU3FJMwnWjp3jQx1AGhP5M6Eb54kCW', // Your test key
    password: ''
  },
  headers: {
    'User-Agent': 'WhelHost-Hotel-Reservation-App/1.0'
  }
};

axios.request(config)
  .then((response) => {
    console.log('Success:', response.data);
  })
  .catch((error) => {
    console.log('Error:', error.message);
  });
```

## Important Notes

- ✅ These keys only work in sandbox mode for testing
- ❌ Do not use these test keys in production
- 🔄 Remember to update the webhook secret in `.env.local` when you set up webhooks
- 🛡️ Test cards will not result in real charges
- 📊 Check your console and server logs for payment details and debugging information

## Troubleshooting

If you encounter issues testing payments:

1. Verify your environment variables are loaded correctly
2. Check that your internet connection is working
3. Ensure the Moyasar API endpoint is accessible from your network
4. Look for error messages in both browser console and server logs
5. Confirm your test card details are entered correctly
6. If direct API tests fail, try testing through your web application instead
7. Check for firewall or network restrictions in your hosting environment