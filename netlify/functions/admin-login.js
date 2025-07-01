const bcrypt = require('bcryptjs');
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY // Use service role for secure server-side access
);

exports.handler = async (event) => {
  // Handle CORS preflight requests
  if (event.httpMethod === 'OPTIONS') {
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
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  }

  try {
    const { username, password, acceptance_code } = JSON.parse(event.body || '{}');
    if (!username || !password || !acceptance_code) {
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
    const { data, error } = await supabase
      .from('zubo_admin')
      .select('*')
      .eq('username', username)
      .single();

    if (error || !data) {
      return {
        statusCode: 401,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ error: 'Invalid credentials' }),
      };
    }

    // Check password
    const passwordMatch = await bcrypt.compare(password, data.password_hash);
    if (!passwordMatch) {
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
    if (data.acceptance_code !== acceptance_code) {
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