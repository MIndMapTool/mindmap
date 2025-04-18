// supabaseClient.js
import { SUPABASE_URL, SUPABASE_ANON_KEY } from './config.js';
export const client = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
