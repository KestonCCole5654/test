// backend/config/supabase.js
module.exports = {
  client: createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  )
};


