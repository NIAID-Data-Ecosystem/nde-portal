import type { Page } from '@playwright/test';
import csp from '../../configs/csp.json';

export type CspViolation = {
  directive: string;
  blockedURI: string;
  sourceFile: string;
  sample: string;
};

const MOCK_STRAPI_PORT = Number(process.env.MOCK_STRAPI_PORT) || 1337;

/**
 * Staging policy for CI. Drops upgrade-insecure-requests (CI serves plain http)
 * and adds the mock Strapi origin to connect-src.
 */
export const ciPolicy = (): string =>
  csp.staging
    .filter(d => !d.startsWith('upgrade-insecure-requests'))
    .map(d =>
      d.startsWith('connect-src ')
        ? `${d} http://localhost:${MOCK_STRAPI_PORT}`
        : d,
    )
    .join('; ');

/**
 * Records `securitypolicyviolation` events (enforced and report-only).
 * With `inject`, sets the CSP header on document responses.
 */
export async function installCspGuard(page: Page, inject: boolean) {
  await page.addInitScript(() => {
    (window as any).__cspViolations = [];
    document.addEventListener('securitypolicyviolation', e => {
      (window as any).__cspViolations.push({
        directive: e.violatedDirective,
        blockedURI: e.blockedURI,
        sourceFile: e.sourceFile,
        sample: e.sample,
      });
    });
  });

  if (inject) {
    const policy = ciPolicy();
    await page.route('**/*', async route => {
      if (!route.request().isNavigationRequest()) return route.fallback();
      const response = await route.fetch();
      await route.fulfill({
        response,
        headers: { ...response.headers(), 'content-security-policy': policy },
      });
    });
  }

  return {
    read: () =>
      page.evaluate(() => (window as any).__cspViolations as CspViolation[]),
  };
}
