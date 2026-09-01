import 'server-only';
import { cookies, headers } from 'next/headers';
import { parsePublicLocale, PUBLIC_LOCALE_COOKIE, PUBLIC_PAGE_HEADER } from './public-locale';

export async function getPublicLocale() {
  return parsePublicLocale((await cookies()).get(PUBLIC_LOCALE_COOKIE)?.value);
}

export async function getDocumentLocale() {
  // Proxy overwrites this presentation-only header. It never authorizes a request.
  return (await headers()).get(PUBLIC_PAGE_HEADER) === 'true' ? getPublicLocale() : 'es';
}
