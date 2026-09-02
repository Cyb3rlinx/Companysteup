import { DomainError, type IntegrationStatus } from '../domain';

export type GoogleAuthConfig = {sandbox: boolean; mode?: string; appOrigin: string; supabaseUrl?: string; publishableKey?: string};
type OAuthClient = {auth: {signInWithOAuth(input: {provider: 'google'; options: {redirectTo: string; scopes: string; skipBrowserRedirect: boolean; queryParams: {prompt: string}}}): Promise<{data: {url: string | null}; error: unknown}>}};

function validatedOrigin(value: string): string {
  const url = new URL(value);
  if (url.username || url.password || url.search || url.hash || url.pathname !== '/' ||
      (url.protocol !== 'https:' && !(url.protocol === 'http:' && ['localhost','127.0.0.1'].includes(url.hostname)))) throw new Error('Invalid origin');
  return url.origin;
}
export function googleAuthStatus(config: GoogleAuthConfig): IntegrationStatus {
  if (config.sandbox || !['SANDBOX','LIVE'].includes(config.mode || '') || !config.publishableKey || !config.supabaseUrl) return 'EXTERNAL_BLOCKED';
  try { validatedOrigin(config.appOrigin); validatedOrigin(config.supabaseUrl); } catch { return 'EXTERNAL_BLOCKED'; }
  return config.mode as 'SANDBOX' | 'LIVE';
}
export function authCallbackLocation(appOrigin: string, success: boolean): string {
  return new URL(success ? '/panel' : '/ingresar?confirmation=failed', validatedOrigin(appOrigin)).toString();
}
export async function startGoogleOAuth(config: GoogleAuthConfig, client: OAuthClient) {
  const mode = googleAuthStatus(config);
  if (mode === 'EXTERNAL_BLOCKED') throw new DomainError('EXTERNAL_BLOCKED', 'Google requiere configuración del proveedor. Puedes ingresar con correo y contraseña.', 503);
  const redirectTo = new URL('/auth/callback', validatedOrigin(config.appOrigin)).toString();
  const {data, error} = await client.auth.signInWithOAuth({provider: 'google', options: {redirectTo, scopes: 'openid email profile', skipBrowserRedirect: true, queryParams: {prompt: 'select_account'}}});
  if (error || !data.url) throw new DomainError('OAUTH_UNAVAILABLE', 'No se pudo iniciar Google. Intenta nuevamente o utiliza tu correo.', 503);
  let target: URL;
  try { target = new URL(data.url); } catch { throw new DomainError('OAUTH_INVALID_REDIRECT', 'Destino de autenticación inválido', 503); }
  if (target.origin !== validatedOrigin(config.supabaseUrl!) || target.pathname !== '/auth/v1/authorize' || target.username || target.password || target.hash || target.searchParams.get('provider') !== 'google' || target.searchParams.get('redirect_to') !== redirectTo || !target.searchParams.get('code_challenge') || target.searchParams.get('code_challenge_method') !== 's256') throw new DomainError('OAUTH_INVALID_REDIRECT', 'Destino de autenticación inválido', 503);
  return {url: target.toString(), mode};
}
