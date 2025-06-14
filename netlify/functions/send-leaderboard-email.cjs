const fetch = require('node-fetch');

exports.handler = async (event) => {
  // Handle GET requests for status checks
  if (event.httpMethod === 'GET') {
    return {
      statusCode: 200,
      body: JSON.stringify({ 
        status: 'Email function is running',
        hasApiKey: !!process.env.RESEND_API_KEY,
        timestamp: new Date().toISOString()
      }),
    };
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed. Use POST to send email or GET for status.' }),
    };
  }

  const { to, firstName, avatarUrl, lives, easterEggs } = JSON.parse(event.body || '{}');
  
  // Enhanced validation
  if (!to || !firstName || !avatarUrl) {
    return {
      statusCode: 400,
      body: JSON.stringify({ 
        error: 'Missing required fields',
        received: { to: !!to, firstName: !!firstName, avatarUrl: !!avatarUrl }
      }),
    };
  }

  // Check if API key is available
  if (!process.env.RESEND_API_KEY) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'RESEND_API_KEY environment variable not set' }),
    };
  }

  // Basic email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(to)) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: 'Invalid email address format', email: to }),
    };
  }

  const html = `
    <div style="font-family: Arial, sans-serif; background: #181a20; color: #fff; padding: 32px; border-radius: 16px; max-width: 400px; margin: auto;">
      <div style="text-align: center;">
        <img src="${avatarUrl}" alt="avatar" style="width: 80px; height: 80px; border-radius: 50%; border: 3px solid #a78bfa; background: #fff; margin-bottom: 16px;" />
        <h2 style="margin: 0 0 8px 0;">Congratulations, ${firstName}!</h2>
        <p style="margin: 0 0 16px 0;">You made it to the Zubo Leaderboard 🎉</p>
        <div style="margin-bottom: 16px;">
          <strong>Lives Remaining:</strong> ${lives}<br/>
          <strong>Easter Eggs Found:</strong> ${easterEggs}
        </div>
        <p style="margin: 0 0 16px 0;">Thank you for playing Zubo and being part of our journey.<br/>— David Labs</p>
        <hr style="border: none; border-top: 1px solid #333; margin: 24px 0;" />
        <div style="font-size: 12px; color: #aaa;">This email was sent by Zubo via Resend</div>
      </div>
    </div>
  `;

  try {
    // Log the request for debugging
    console.log('Sending email request:', {
      to,
      firstName,
      avatarUrl,
      lives,
      easterEggs,
      hasApiKey: !!process.env.RESEND_API_KEY
    });

    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'onboarding@resend.dev',
        to,
        subject: 'Congratulations on reaching the Zubo Leaderboard!',
        html,
      }),
    });
    
    const data = await response.json();
    console.log('Resend API response:', { status: response.status, data });
    
    if (!response.ok) {
      // Return detailed error information
      return {
        statusCode: response.status,
        body: JSON.stringify({ 
          error: data.message || data.error || 'Failed to send email',
          details: data,
          status: response.status
        }),
      };
    }
    return {
      statusCode: 200,
      body: JSON.stringify({ success: true, data }),
    };
  } catch (err) {
    console.error('Email function error:', err);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message, stack: err.stack }),
    };
  }
}; 