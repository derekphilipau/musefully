import { expect, test } from '@playwright/test';

test('should navigate to the art search page', async ({
  page,
  browserName,
  isMobile,
}) => {
  await page.goto('/');
  const waitForStable = async () => {
    try {
      await page.waitForLoadState('networkidle', { timeout: 3000 });
    } catch {
      // fall through
    }
  };
  await waitForStable();
  if (isMobile) {
    const menuButton = page.getByRole('button', { name: /open menu/i });
    await menuButton.click();
    const artButton = page.getByRole('button', { name: /^Art$/i }).first();
    await Promise.all([
      page.waitForURL((url) => url.pathname.startsWith('/art'), {
        timeout: 10000,
      }).catch(() => undefined),
      artButton.click(),
    ]);
  } else {
    const artLink = page
      .getByRole('navigation', { name: /main menu/i })
      .getByRole('link', { name: /^Art$/i })
      .first();
    await expect(artLink).toHaveAttribute('href', '/art?hasPhoto=true');
    await Promise.all([
      page.waitForURL((url) => url.pathname.startsWith('/art'), {
        timeout: 10000,
      }).catch(() => undefined),
      artLink.click(),
    ]);
  }
  const currentUrl = page.url();
  expect(currentUrl.includes('/art')).toBeTruthy();
  await expect(page).toHaveURL(/\/art/);
});
