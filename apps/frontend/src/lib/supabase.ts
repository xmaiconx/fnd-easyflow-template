import { createClient } from '@supabase/supabase-js';

/**
 * Supabase Client Singleton
 *
 * Provides a single instance of the Supabase client for the entire application.
 * Uses the Publishable key (safe to expose in frontend) for client-side operations.
 *
 * Authentication flow:
 * 1. Frontend calls supabase.auth.signUp() / signInWithPassword() / signInWithOAuth()
 * 2. Supabase Auth creates user in auth.users table
 * 3. Webhook triggers backend to create Account/Workspace/User
 * 4. Frontend stores session and uses access_token for API calls
 */

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabasePublishableKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

if (!supabaseUrl) {
  throw new Error('Missing environment variable: VITE_SUPABASE_URL');
}

if (!supabasePublishableKey) {
  throw new Error('Missing environment variable: VITE_SUPABASE_PUBLISHABLE_KEY');
}

/**
 * Supabase client instance
 *
 * Auto-refresh enabled for seamless session management
 * Persist session in localStorage by default
 */
export const supabase = createClient(supabaseUrl, supabasePublishableKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true, // Handle email confirmation callbacks
  },
});
