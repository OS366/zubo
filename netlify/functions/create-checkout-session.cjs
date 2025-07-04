const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

exports.handler = async (event, context) => {
  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  }

  try {
    // Log the Stripe key prefix to verify we're using the correct key
    console.log('Stripe key prefix:', process.env.STRIPE_SECRET_KEY?.substring(0, 7));
    
    const { priceId, lives, currentLevel } = JSON.parse(event.body);
    
    // Log the incoming request data
    console.log('Request data:', { priceId, lives, currentLevel });

    if (!priceId || !lives) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Missing required fields' }),
      };
    }

    // Get the origin from headers
    const origin = event.headers.origin || event.headers.host || 'https://your-app.netlify.app';
    const baseUrl = origin.startsWith('http') ? origin : `https://${origin}`;

    // Debug logging
    const successUrl = `${baseUrl}/?payment_success=true&lives=${lives}&session_id={CHECKOUT_SESSION_ID}`;
    console.log('Creating Stripe session with:', { baseUrl, successUrl, lives, currentLevel });

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: successUrl,
      cancel_url: `${baseUrl}/?payment_canceled=true`,
      metadata: {
        lives: lives.toString(),
        currentLevel: currentLevel.toString(),
      },
      // Optional: Add customer email collection
      customer_creation: 'if_required',
      billing_address_collection: 'auto',
    });

    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
      },
      body: JSON.stringify({ url: session.url }),
    };
  } catch (error) {
    // Enhanced error logging
    console.error('Error creating checkout session:', {
      message: error.message,
      type: error.type,
      code: error.code,
      stack: error.stack
    });
    
    return {
      statusCode: 500,
      body: JSON.stringify({ 
        error: 'Failed to create checkout session',
        details: error.message,
        type: error.type,
        code: error.code
      }),
    };
  }
}; 