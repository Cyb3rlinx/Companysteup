import 'server-only';
import { DomainError } from '../../../packages/domain';
import { googleAuthStatus, startGoogleOAuth } from '../../../packages/authentication/google';
import { appOrigin, isSandbox } from './runtime';
import { supabaseAuth } from './auth';
function config() {
  return {sandbox: isSandbox(), mode: process.env.GOOGLE_AUTH_MODE, appOrigin: appOrigin(), supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL, publishableKey: process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY};
}
export function googleStatus() { return googleAuthStatus(config()); }
export async function googleSignIn() {
  if (googleStatus() === 'EXTERNAL_BLOCKED') throw new DomainError('EXTERNAL_BLOCKED', 'Google aún no está habilitado. Usa correo y contraseña.', 503);
  return startGoogleOAuth(config(), await supabaseAuth());
}
