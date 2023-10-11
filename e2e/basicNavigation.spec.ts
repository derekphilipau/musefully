import { expect, test } from '@playwright/test';

test('should navigate to the art search page', async ({
  page,
  browserName,
  isMobile,
}) => {
  await page.goto('/');
  if (isMobile) {
    await page.click('[aria-label="Open Menu"]', { timeout: 1000 });
    await page.getByRole('button', { name: 'Art' }).click();
  } else {
    await page.click('text=Art');
  }
  await expect(page).toHaveURL('/art?hasPhoto=true&f=true');
});
