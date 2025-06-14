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

  const { to, firstName, avatarUrl, lives, easterEggs, score, questionsAnswered, persona } = JSON.parse(event.body || '{}');
  
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
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Zubo Leaderboard Achievement</title>
    </head>
    <body style="margin: 0; padding: 0; background-color: #f3f4f6; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
      <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff;">
        <!-- Header -->
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 20px; text-align: center;">
          <img src="${avatarUrl}" alt="Your Avatar" style="width: 100px; height: 100px; border-radius: 50%; border: 4px solid #ffffff; margin-bottom: 20px; background: #fff;" />
          <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: bold;">🎉 Congratulations, ${firstName}!</h1>
          <p style="color: #e5e7eb; margin: 10px 0 0 0; font-size: 18px;">You've made it to the Zubo Leaderboard!</p>
        </div>
        
        <!-- Stats Section -->
        <div style="padding: 40px 20px;">
          <h2 style="color: #1f2937; margin: 0 0 24px 0; font-size: 24px; text-align: center;">Your Achievement</h2>
          
          <div style="display: flex; justify-content: space-around; margin-bottom: 32px; text-align: center;">
            <div style="flex: 1; padding: 0 10px;">
              <div style="background: #f3f4f6; border-radius: 12px; padding: 20px; margin: 0 5px;">
                <div style="font-size: 32px; font-weight: bold; color: #7c3aed; margin-bottom: 8px;">${score || 0}</div>
                <div style="color: #6b7280; font-size: 14px;">Final Score</div>
              </div>
            </div>
            <div style="flex: 1; padding: 0 10px;">
              <div style="background: #f3f4f6; border-radius: 12px; padding: 20px; margin: 0 5px;">
                <div style="font-size: 32px; font-weight: bold; color: #059669; margin-bottom: 8px;">${questionsAnswered || 0}</div>
                <div style="color: #6b7280; font-size: 14px;">Questions Answered</div>
              </div>
            </div>
            <div style="flex: 1; padding: 0 10px;">
              <div style="background: #f3f4f6; border-radius: 12px; padding: 20px; margin: 0 5px;">
                <div style="font-size: 32px; font-weight: bold; color: #dc2626; margin-bottom: 8px;">${lives || 0}</div>
                <div style="color: #6b7280; font-size: 14px;">Lives Remaining</div>
              </div>
            </div>
          </div>
          
          ${persona ? `
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 12px; padding: 24px; margin-bottom: 32px; text-align: center;">
            <h3 style="color: #ffffff; margin: 0 0 12px 0; font-size: 20px;">Your Persona</h3>
            <div style="color: #e5e7eb; font-size: 18px; font-weight: bold;">${persona}</div>
          </div>
          ` : ''}
          
          <div style="text-align: center; margin-bottom: 32px;">
            <p style="color: #4b5563; font-size: 16px; line-height: 1.6; margin: 0 0 24px 0;">
              You've successfully completed the Zubo Challenge and earned your place on our leaderboard! 
              Your strategic thinking and problem-solving skills have been put to the test, and you've proven yourself worthy.
            </p>
            
            <a href="https://zubo.davidlabs.ca/leaderboard" style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #ffffff; text-decoration: none; padding: 16px 32px; border-radius: 8px; font-weight: bold; font-size: 16px;">
              View Leaderboard
            </a>
          </div>
        </div>
        
        <!-- Footer -->
        <div style="background: #f9fafb; padding: 32px 20px; text-align: center; border-top: 1px solid #e5e7eb;">
          <p style="color: #6b7280; margin: 0 0 16px 0; font-size: 16px;">
            Thank you for playing Zubo and being part of our journey!
          </p>
          <p style="color: #9ca3af; margin: 0; font-size: 14px;">
            — The David Labs Team
          </p>
          <div style="margin-top: 24px; padding-top: 24px; border-top: 1px solid #e5e7eb;">
            <p style="color: #9ca3af; margin: 0; font-size: 12px;">
              This email was sent by Zubo. Visit us at <a href="https://zubo.davidlabs.ca" style="color: #7c3aed;">zubo.davidlabs.ca</a>
            </p>
          </div>
        </div>
      </div>
    </body>
    </html>
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