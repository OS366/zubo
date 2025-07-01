const bcrypt = require('bcryptjs');
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY // Use service role for secure server-side access
);

module.exports.handler = async (event) => {
  console.log('Admin login function called with method:', event.httpMethod);
  console.log('Event:', JSON.stringify(event, null, 2));
  
  // Handle CORS preflight requests
  if (event.httpMethod === 'OPTIONS') {
    console.log('Handling OPTIONS request');
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
      },
      body: '',
    };
  }

  if (event.httpMethod !== 'POST') {
    console.log('Method not allowed:', event.httpMethod);
    return {
      statusCode: 405,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ error: 'Method not allowed', method: event.httpMethod }),
    };
  }

  try {
    const { username, password, acceptance_code } = JSON.parse(event.body || '{}');
    console.log('Received credentials:', { username, password: password ? '[HIDDEN]' : 'MISSING', acceptance_code });
    
    if (!username || !password || !acceptance_code) {
      console.log('Missing credentials:', { hasUsername: !!username, hasPassword: !!password, hasCode: !!acceptance_code });
      return {
        statusCode: 400,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ error: 'Missing credentials' }),
      };
    }

    // Query Supabase for the admin user
    console.log('Querying Supabase for username:', username);
    const { data, error } = await supabase
      .from('zubo_admin')
      .select('*')
      .eq('username', username)
      .single();

    if (error) {
      console.log('Supabase error:', error);
      return {
        statusCode: 401,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ error: 'Invalid credentials' }),
      };
    }

    if (!data) {
      console.log('No user found for username:', username);
      return {
        statusCode: 401,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ error: 'Invalid credentials' }),
      };
    }

    console.log('User found:', { username: data.username, hasPasswordHash: !!data.password_hash, acceptanceCode: data.acceptance_code });

    // Check password
    console.log('Comparing password with hash...');
    const passwordMatch = await bcrypt.compare(password, data.password_hash);
    console.log('Password match result:', passwordMatch);
    
    if (!passwordMatch) {
      console.log('Password does not match');
      return {
        statusCode: 401,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ error: 'Invalid credentials' }),
      };
    }

    // Check acceptance code
    console.log('Checking acceptance code:', { provided: acceptance_code, stored: data.acceptance_code, match: data.acceptance_code === acceptance_code });
    
    if (data.acceptance_code !== acceptance_code) {
      console.log('Acceptance code does not match');
      return {
        statusCode: 401,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ error: 'Invalid credentials' }),
      };
    }

    // Issue a simple session token (for demo: just a signed JWT or random string)
    // For now, just return success (you can add JWT/cookie logic later)
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ success: true }),
    };
  } catch (err) {
    return {
      statusCode: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ error: err.message }),
    };
  }
}; 