import { test, expect } from '@playwright/test';

test('pages load with complete images and fit the viewport', async ({ page }) => {
  const errors = [];
  page.on('pageerror', (error) => errors.push(error.message));
  for (const route of ['/', '/work/', '/studio/', '/services/', '/contact/', '/work/momma-loves-me/', '/work/blast-off/', '/work/the-next-chapter/', '/privacy/', '/404.html']) {
    await page.goto(route);
    await expect(page.locator('h1')).toBeVisible();
    await page.evaluate(() => document.fonts.ready);
    await page.locator('img').evaluateAll((images) => Promise.all(images.map((image) => {
      image.loading = 'eager';
      return image.decode();
    })));
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), `${route} should fit the screen`).toBeTruthy();
  }
  expect(errors).toEqual([]);
});

test('film embeds load on demand and stop when the dialog closes', async ({ page }) => {
  await page.route('https://player.vimeo.com/**', (route) => route.fulfill({ contentType: 'text/html', body: '<p>Video provider test fixture</p>' }));
  await page.goto('/');
  await expect(page.locator('iframe')).toHaveCount(0);
  await page.getByRole('button', { name: /Play studio film/ }).click();
  await expect(page.getByRole('dialog')).toBeVisible();
  await expect(page.locator('iframe')).toHaveAttribute('src', /1100394104.*h=823ccd916b/);
  await page.keyboard.press('Escape');
  await expect(page.getByRole('dialog')).not.toBeVisible();
  await expect(page.locator('iframe')).toHaveCount(0);
  await expect(page.getByRole('button', { name: /Play studio film/ })).toBeFocused();
});

test('project filters show matching entries and reset', async ({ page }) => {
  await page.goto('/work/');
  await expect(page.locator('.project-card:visible')).toHaveCount(3);
  await page.getByRole('button', { name: 'Brand & culture', exact: true }).click();
  await expect(page.locator('.project-card:visible')).toHaveCount(1);
  await expect(page.locator('.project-card:visible h3')).toHaveText('Blast Off!');
  await page.getByRole('button', { name: 'What’s next', exact: true }).click();
  await expect(page.locator('.project-card:visible h3')).toHaveText('The next chapter');
  await page.getByRole('button', { name: /All frames/ }).click();
  await expect(page.locator('.project-card:visible')).toHaveCount(3);
});

test('contact prepares an accurate draft and makes email fallback available', async ({ page }) => {
  await page.goto('/contact/?interest=02');
  await expect(page.locator('#interest')).toHaveValue('Branded content & production');
  await page.getByLabel('Your name').fill('Alex Example');
  await page.getByLabel('Email address').fill('alex@example.com');
  await page.getByLabel('A little about your idea').fill('A film about a family, a journey & a new beginning.');
  await page.getByRole('button', { name: /Let’s start a story/ }).click();
  await expect(page.locator('#email-fallback')).toBeVisible();
  await expect(page.locator('#email-draft')).toHaveValue(/A film about a family, a journey & a new beginning\./);
  await expect(page.locator('#email-draft')).toHaveValue(/Name: Alex Example/);
  await expect(page.locator('#form-status')).toContainText('Your email draft is ready');
});

test('mobile navigation works with keyboard dismissal', async ({ page, isMobile }) => {
  test.skip(!isMobile, 'Mobile menu only');
  await page.goto('/');
  const menu = page.getByRole('button', { name: /Menu/ });
  await menu.click();
  await expect(menu).toHaveAttribute('aria-expanded', 'true');
  await page.keyboard.press('Escape');
  await expect(menu).toHaveAttribute('aria-expanded', 'false');
  await menu.click();
  await page.getByRole('navigation').getByRole('link', { name: 'The tribe' }).click();
  await expect(page).toHaveURL(/\/studio\/$/);
});

test('reduced motion respects the visitor preference', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  expect(await page.locator('.hero-star').evaluate((element) => getComputedStyle(element).animationName)).toBe('none');
});
