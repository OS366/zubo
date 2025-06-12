# Testing the Stripe Integration

## Development Mode Testing

Since the API endpoints require a backend server, you can test the payment flow in development mode using the built-in simulation:

### 1. Test the Store

1. Run the game: `npm run dev`
2. Navigate to the Store (when you run out of lives or click Store button)
3. Click any "Purchase Now" button
4. Since the API isn't running, you'll get a confirmation dialog
5. Click "OK" to simulate a successful payment
6. You'll be redirected back with lives added!

### 2. Test Payment Success Flow

You can also manually test by visiting:

```
http://localhost:5173/?payment_success=true&lives=5&session_id=test_session_123
```

### 3. Test Payment Cancellation

Test the cancellation flow:

```
http://localhost:5173/?payment_canceled=true
```

## Production Testing

### 1. Deploy the API

Deploy your API endpoints to a platform like Vercel, Netlify, or Railway.

### 2. Update Configuration

- Set your real Stripe API keys as environment variables
- Update the price IDs in `Store.tsx` with your actual Stripe Price IDs
- Configure your webhook endpoint URL

### 3. Test with Stripe Test Cards

Use these test card numbers in Stripe Checkout:

**Successful Payment:**

- Card: `4242 4242 4242 4242`
- Expiry: Any future date
- CVC: Any 3 digits

**Declined Payment:**

- Card: `4000 0000 0000 0002`
- Expiry: Any future date
- CVC: Any 3 digits

**Requires Authentication:**

- Card: `4000 0025 0000 3155`
- Expiry: Any future date
- CVC: Any 3 digits

### 4. Webhook Testing

Use ngrok or similar to test webhooks locally:

```bash
npm install -g ngrok
ngrok http 3001
```

Then use the ngrok URL for your webhook endpoint in Stripe Dashboard.

## Manual Testing Checklist

- [ ] Store opens correctly
- [ ] All 3 packages display with correct pricing
- [ ] Purchase buttons work
- [ ] Level 75+ restrictions work correctly
- [ ] Payment success adds lives correctly
- [ ] Payment cancellation shows appropriate message
- [ ] Success/cancel messages display and auto-hide
- [ ] URL parameters are cleaned up after processing
- [ ] Lives are preserved when navigating between game states

## Troubleshooting

**API Errors:**

- Check that your Stripe secret key is set correctly
- Verify the price IDs match your Stripe products
- Ensure your webhook endpoint is accessible

**No Lives Added:**

- Check browser console for errors
- Verify the URL parameters are correct
- Make sure the Game component URL handler is working

**Development Mode:**

- The demo mode only works in development
- In production, it will show an error message if API is unavailable
