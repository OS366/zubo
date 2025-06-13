const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  }

  const { to, firstName, avatarUrl, lives, easterEggs } = JSON.parse(event.body || '{}');
  if (!to || !firstName || !avatarUrl) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: 'Missing required fields' }),
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
        <div style="font-size: 12px; color: #aaa;">This email was sent by Zubo (zubo@davidlabs.ca)</div>
      </div>
    </div>
  `;

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'zubo@davidlabs.ca',
        to,
        subject: 'Congratulations on reaching the Zubo Leaderboard!',
        html,
      }),
    });
    const data = await response.json();
    if (!response.ok) {
      return {
        statusCode: response.status,
        body: JSON.stringify({ error: data.error || 'Failed to send email' }),
      };
    }
    return {
      statusCode: 200,
      body: JSON.stringify({ success: true }),
    };
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message }),
    };
  }
}; 