import { createClient } from '@supabase/supabase-js';

let rawUrl = import.meta.env.VITE_SUPABASE_URL || '';
let rawAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// Clean and sanitize the URL to prevent "Failed to fetch" due to configuration typos
let supabaseUrl = rawUrl.trim();

if (supabaseUrl) {
  // Correct double protocol prefixes (e.g., "https:https://...")
  if (supabaseUrl.startsWith('https:https://')) {
    supabaseUrl = supabaseUrl.replace('https:https://', 'https://');
  } else if (supabaseUrl.startsWith('http:http://')) {
    supabaseUrl = supabaseUrl.replace('http:http://', 'http://');
  } else if (supabaseUrl.startsWith('https://https://')) {
    supabaseUrl = supabaseUrl.replace('https://https://', 'https://');
  }
  
  // Strip trailing "/rest/v1" or "/rest/v1/" which is a common copy-paste error from Supabase API tab
  supabaseUrl = supabaseUrl.replace(/\/rest\/v1\/?$/, '');
  
  // Remove any trailing slashes
  supabaseUrl = supabaseUrl.replace(/\/+$/, '');
}

const supabaseAnonKey = rawAnonKey.trim();

const isConfigured = Boolean(supabaseUrl && supabaseAnonKey);

const client = isConfigured 
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

// Use a proxy to provide a helpful error message only when the client is used
export const supabase = new Proxy({} as any, {
  get(_, prop) {
    if (!client) {
      const msg = 'Supabase environment variables are missing. Please add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to your Secrets panel.';
      console.error(msg);
      throw new Error(msg);
    }
    const val = (client as any)[prop];
    if (typeof val === 'function') {
      return val.bind(client);
    }
    return val;
  }
});

export { isConfigured };
