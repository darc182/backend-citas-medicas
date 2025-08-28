const { createClient } = require('@supabase/supabase-js');

// Validar variables de entorno requeridas
if (!process.env.SUPABASE_URL) {
  throw new Error('SUPABASE_URL is required in environment variables');
}

if (!process.env.SUPABASE_ANON_KEY) {
  throw new Error('SUPABASE_ANON_KEY is required in environment variables');
}

// Cliente para operaciones públicas (con RLS)
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

// Cliente administrativo para operaciones del servidor (sin RLS)
let supabaseAdmin = null;
if (process.env.SUPABASE_SERVICE_KEY) {
  supabaseAdmin = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_KEY,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    }
  );
}

module.exports = {
  supabase,
  supabaseAdmin
};
