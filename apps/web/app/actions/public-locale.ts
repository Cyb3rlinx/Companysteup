'use server';

import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';
import { PUBLIC_LOCALE_COOKIE } from '../../lib/public-locale';

export async function setPublicLocale(formData: FormData) {
  const locale = formData.get('locale');
  if (locale !== 'en' && locale !== 'es') return;
  (await cookies()).set(PUBLIC_LOCALE_COOKIE, locale, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 365,
  });
  revalidatePath('/', 'layout');
}
