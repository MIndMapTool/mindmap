// auth.js
import { client } from './supabaseclient.js';

export async function restoreSession() {
  const saved = localStorage.getItem('sb-auth-token');
  if (saved) {
    const { access_token, refresh_token } = JSON.parse(saved);
    await client.auth.setSession({ access_token, refresh_token });
  }
}

export async function getCurrentUser() {
  const { data: { user }, error } = await client.auth.getUser();
  return { user, error };
}
