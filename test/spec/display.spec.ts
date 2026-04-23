import { expect, test } from '@playwright/test';
import { elementClient } from '@tailor-cms/cek-e2e';

import { Display } from '../pom';

const ELEMENT_ID = 'test-accordion-display';

test.beforeEach(async ({ page }) => {
  await elementClient.reset(ELEMENT_ID);
  await page.goto(`/?id=${ELEMENT_ID}`);
  await page.waitForLoadState('networkidle');
});

test.describe('Empty state', () => {
  test.beforeEach(async ({ page }) => {
    await elementClient.update(ELEMENT_ID, { embeds: {}, items: {} });
    await page.reload({ waitUntil: 'networkidle' });
  });

  test('Renders placeholder when no items', async ({ page }) => {
    const display = new Display(page);
    await expect(display.placeholder).toBeVisible();
    await expect(display.panels).toHaveCount(0);
  });
});

test.describe('Default state', () => {
  test('Renders two items with default titles', async ({ page }) => {
    const display = new Display(page);
    await expect(display.panels).toHaveCount(2);
    await expect(display.panels.first()).toContainText('Accordion Item Title');
  });
});

test.describe('Custom items', () => {
  test.beforeEach(async ({ page }) => {
    await elementClient.update(ELEMENT_ID, {
      embeds: {},
      items: {
        a: { id: 'a', header: 'Section A', body: {}, position: 1 },
        b: { id: 'b', header: 'Section B', body: {}, position: 2 },
        c: { id: 'c', header: 'Section C', body: {}, position: 3 },
      },
    });
    await page.reload({ waitUntil: 'networkidle' });
  });

  test('Renders items in sorted order', async ({ page }) => {
    const display = new Display(page);
    await expect(display.panels).toHaveCount(3);
    await expect(display.panels.nth(0)).toContainText('Section A');
    await expect(display.panels.nth(1)).toContainText('Section B');
    await expect(display.panels.nth(2)).toContainText('Section C');
  });

  test('Expanding an item reveals its empty-state message', async ({
    page,
  }) => {
    const display = new Display(page);
    await display.panels.first().click();
    await expect(
      display.panels.first().getByText('No content elements added'),
    ).toBeVisible();
  });
});

test.afterAll(async () => {
  await elementClient.reset(ELEMENT_ID);
});
