import { test, expect } from '@playwright/test';

test.describe('Flight Lab student smoke suite', () => {
  test('loads without framework errors and exposes the main workflow', async ({ page }) => {
    const consoleErrors: string[] = [];
    page.on('console', (msg) => { if (msg.type() === 'error') consoleErrors.push(msg.text()); });
    await page.goto('/');
    await expect(page.getByText('AIRCRAFT FLIGHT LAB')).toBeVisible();
    await expect(page.getByText('GEOMETRY LIBRARY')).toBeVisible();
    await expect(page.getByText('LIVE TELEMETRY')).toBeVisible();
    expect(consoleErrors).toEqual([]);
  });

  test('switches geometry families and keeps selection/rendering state coherent', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: '3D SOLIDS' }).click();
    await expect(page.getByRole('button', { name: 'Cube' })).toHaveClass(/selected/);
    await page.getByRole('button', { name: 'Cube' }).click();
    await expect(page.getByText('REFERENCE AREA')).toBeVisible();
    await expect(page.getByText('FORMULA')).toBeVisible();
  });

  test('changes a dimension and updates reference area', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: '2D SHAPES' }).click();
    await page.getByRole('button', { name: 'Rectangle' }).click();
    const length = page.getByRole('spinbutton').nth(0);
    const width = page.getByRole('spinbutton').nth(1);
    await length.fill('3');
    await width.fill('2');
    await expect(page.getByText('6 m²')).toBeVisible();
  });

  test('performance, stall and validation navigation work', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: 'PERFORMANCE' }).click();
    await expect(page.locator('#performance')).toBeInViewport();
    await page.getByRole('button', { name: 'STALL ANALYSIS' }).click();
    await expect(page.locator('#stall')).toBeInViewport();
    await page.getByRole('button', { name: 'ABOUT / VALIDATION' }).click();
    await expect(page.locator('#about')).toBeInViewport();
  });

  test('aerodynamic controls update telemetry', async ({ page }) => {
    await page.goto('/');
    const velocity = page.getByRole('slider').first();
    const before = await page.getByText(/Pa$/).first().textContent();
    await velocity.fill('100');
    const after = await page.getByText(/Pa$/).first().textContent();
    expect(after).not.toBe(before);
  });

  test('measured mode exposes manual CL/CD controls', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: 'MEASURED' }).click();
    await expect(page.getByText('CL', { exact: true })).toBeVisible();
    await expect(page.getByText('CD', { exact: true })).toBeVisible();
  });
});
