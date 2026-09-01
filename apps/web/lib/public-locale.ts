export type PublicLocale = 'en' | 'es';
export const PUBLIC_LOCALE_COOKIE = 'company_public_locale';
export const PUBLIC_PAGE_HEADER = 'x-company-public-page';
export const publicRoutes = ['comparar', 'como-funciona', 'precios', 'cumplimiento', 'terminos', 'privacidad', 'alcance', 'delaware', 'wyoming', 'estonia', 'reino-unido'];

export function parsePublicLocale(value: string | undefined): PublicLocale {
  return value === 'es' ? 'es' : 'en';
}

export function isPublicPath(pathname: string): boolean {
  return pathname === '/' || publicRoutes.includes(pathname.split('/')[1]);
}
