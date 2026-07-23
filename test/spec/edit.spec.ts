import { expect, test } from '@playwright/test';
import { elementClient } from '@tailor-cms/cek-e2e';

import { Edit } from '../pom';

const ELEMENT_ID = 'test-accordion-edit';

test.beforeEach(async ({ page }) => {
  await elementClient.reset(ELEMENT_ID);
  await page.goto(`/?id=${ELEMENT_ID}`);
  await page.waitForLoadState('networkidle');
});

test.describe('Initial render', () => {
  test('Renders 2 accordion items by default', async ({ page }) => {
    const edit = new Edit(page);
    await expect(edit.panels).toHaveCount(2);
    await expect(edit.addItemBtn).toBeVisible();
  });
});

test.describe('Item management', () => {
  test('Adds a new item', async ({ page }) => {
    const edit = new Edit(page);
    await edit.addItemBtn.click();
    await expect(edit.panels).toHaveCount(3);
  });

  test('Deletes an item via confirmation dialog', async ({ page }) => {
    const edit = new Edit(page);
    await edit.itemAt(0).hover();
    await edit.deleteBtn(0).click();
    await expect(edit.confirmationDialog).toBeVisible();
    await edit.confirmationDialog
      .getByRole('button', { name: 'Confirm' })
      .click();
    await expect(edit.panels).toHaveCount(1);
  });

  test('Edits an item title', async ({ page }) => {
    const edit = new Edit(page);
    await edit.titleInput(0).fill('My custom title');
    await edit.titleInput(0).blur();
    await page.reload({ waitUntil: 'networkidle' });
    await expect(edit.titleInput(0)).toHaveValue('My custom title');
  });
});

test.describe('Reset', () => {
  test('Clears authored items without a page reload', async ({ page }) => {
    const edit = new Edit(page);
    await edit.addItemBtn.click();
    await expect(edit.panels).toHaveCount(3);
    await edit.reset();
    await expect(edit.panels).toHaveCount(2);
  });
});

test.describe('Readonly mode', () => {
  test('Hides add/edit/delete controls', async ({ page }) => {
    const edit = new Edit(page);
    await edit.setReadonly();
    await expect(edit.addItemBtn).not.toBeVisible();
    await edit.itemAt(0).hover();
    await expect(edit.deleteBtn(0)).not.toBeVisible();
    await edit.itemAt(0).click();
    await expect(edit.addEmbedBtn(0)).not.toBeVisible();
  });
});
