import { test, expect } from '@playwright/test';

const cookieName = 'company_public_locale';
const publicRoutes = ['/', '/comparar', '/como-funciona', '/precios', '/cumplimiento', '/delaware', '/wyoming', '/estonia', '/reino-unido', '/privacidad', '/terminos', '/alcance'];

test('English default, Spanish preference, server rendering and public navigation', async ({ page, context }) => {
  const errors: string[] = [];
  page.on('pageerror', e => errors.push(e.message));
  // Browser language must not override the requested English default.
  await context.setExtraHTTPHeaders({ 'Accept-Language': 'es-MX,es;q=0.9' });
  const first = await page.goto('/');
  expect(await first!.text()).toContain('<html lang="en"');
  await expect(page.locator('h1')).toContainText('Your next chapter.');
  await expect(page.getByRole('button', { name: 'English', exact: true })).toHaveAttribute('aria-pressed', 'true');
  await expect(page.locator('.public-sandbox')).toContainText('No real filings or charges');
  await expect(page).toHaveTitle('Nexo — Your company, in order');
  await page.screenshot({ path: '.local/qa/home-en-desktop.png', fullPage: true });

  await page.getByRole('button', { name: 'Español', exact: true }).click();
  await expect(page.locator('h1')).toContainText('Tu próximo capítulo.');
  await expect(page.locator('html')).toHaveAttribute('lang', 'es-419');
  await expect(page).toHaveTitle('Nexo — Tu compañía, en orden');
  await expect(page.locator('.public-sandbox')).toContainText('No se realizan trámites ni cobros reales.');
  await expect(page.locator('.country-card')).toHaveCount(4);
  const cookie = (await context.cookies()).find(c => c.name === cookieName);
  expect(cookie).toMatchObject({ value: 'es', httpOnly: true, sameSite: 'Lax', path: '/' });
  await page.reload();
  await expect(page.locator('h1')).toContainText('Tu próximo capítulo.');
  await page.getByRole('link', { name: 'Explorar jurisdicciones', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Cuatro rutas. Tu propio criterio.' })).toBeVisible();
  for (const route of publicRoutes) {
    const response = await page.goto(route);
    expect(response?.status()).toBe(200);
    expect(await response!.text()).toContain('<html lang="es-419"');
    await expect(page.getByRole('button', { name: 'Español', exact: true })).toHaveAttribute('aria-pressed', 'true');
    await expect(page.locator('footer')).toContainText('ES · LATAM');
  }
  await page.goto('/');
  await page.screenshot({ path: '.local/qa/home-es-desktop.png', fullPage: true });
  await page.getByRole('button', { name: 'English', exact: true }).click();
  await expect(page.locator('h1')).toContainText('Your next chapter.');
  await expect(page.locator('html')).toHaveAttribute('lang', 'en');
  await page.reload();
  await expect(page.locator('h1')).toContainText('Your next chapter.');
  // Client navigation into the Spanish workspace must update the document language.
  await page.getByRole('link', { name: 'Sign in', exact: true }).click();
  await expect(page.getByLabel('Correo electrónico')).toBeVisible();
  await expect(page.locator('html')).toHaveAttribute('lang', 'es-419');
  await page.goBack();
  await expect(page.locator('html')).toHaveAttribute('lang', 'en');
  expect(errors).toEqual([]);
});

test('mobile language switch works with keyboard and both languages fit narrow screens', async ({ page }) => {
  for (const width of [320, 390, 768, 1024]) {
    await page.setViewportSize({ width, height: 844 });
    await page.goto('/');
    for (const language of ['Español', 'English']) {
      const button = page.getByRole('button', { name: language, exact: true });
      await button.focus();
      await page.keyboard.press('Enter');
      await expect(button).toHaveAttribute('aria-pressed', 'true');
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
      await expect(button).toBeInViewport();
      if (width === 390) await page.screenshot({ path: `.local/qa/home-${language === 'English' ? 'en' : 'es'}-mobile.png`, fullPage: true });
    }
    if (width < 701) {
      await page.getByRole('button', { name: 'Open navigation' }).click();
      await expect(page.getByRole('navigation', { name: 'Main navigation' })).toBeVisible();
      await page.getByRole('link', { name: 'Pricing', exact: true }).click();
      await expect(page.locator('h1')).toContainText('Clarity from');
    }
  }
});

test('invalid locale falls back to English; presentation headers cannot change protected access', async ({ context, page, request }) => {
  await context.addCookies([{ name: cookieName, value: 'fr-admin', url: 'http://127.0.0.1:3000' }]);
  await page.goto('/');
  await expect(page.locator('h1')).toContainText('Your next chapter.');
  const headers = { 'x-company-public-page': 'true' };
  const login = await request.get('/ingresar', { headers });
  expect(await login.text()).toContain('<html lang="es-419"');
  expect((await request.get('/api/workspace', { headers })).status()).toBe(401);
  const admin = await request.get('/admin', { headers, maxRedirects: 0 });
  expect(admin.status()).toBe(307);
  expect(admin.headers().location).toBe('/ingresar');
});
