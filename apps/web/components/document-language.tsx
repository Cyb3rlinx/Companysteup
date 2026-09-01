'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { isPublicPath, type PublicLocale } from '../lib/public-locale';

export function DocumentLanguage({ publicLocale }: { publicLocale: PublicLocale }) {
  const pathname = usePathname();
  // Root layouts persist across client navigation; sync public/private language.
  useEffect(() => {
    document.documentElement.lang = isPublicPath(pathname) && publicLocale === 'en' ? 'en' : 'es-419';
  }, [pathname, publicLocale]);
  return null;
}
