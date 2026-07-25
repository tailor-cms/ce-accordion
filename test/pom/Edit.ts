import type { Locator, Page } from '@playwright/test';
import { pom } from '@tailor-cms/cek-e2e';

export class Edit extends pom.EditPanel {
  readonly root: Locator;
  readonly panels: Locator;
  readonly addItemBtn: Locator;
  readonly deleteItemDialog: Locator;

  constructor(page: Page) {
    super(page);
    this.root = this.editor.locator('.tce-accordion');
    this.panels = this.root.locator('.v-expansion-panel');
    this.addItemBtn = this.editor.getByRole('button', {
      name: 'Add Accordion Item',
    });
    this.deleteItemDialog = this.el
      .locator('.v-dialog')
      .filter({ hasText: 'Delete accordion item' });
  }

  itemAt(index: number): Locator {
    return this.panels.nth(index);
  }

  itemHeader(index: number): Locator {
    return this.itemAt(index).locator('.v-expansion-panel-title');
  }

  deleteBtn(itemIndex: number): Locator {
    return this.itemHeader(itemIndex).getByRole('button', {
      name: 'Delete item',
      exact: true,
    });
  }

  titleInput(itemIndex: number): Locator {
    return this.itemHeader(itemIndex).getByPlaceholder('Title');
  }

  addEmbedBtn(itemIndex: number): Locator {
    return this.itemAt(itemIndex).getByRole('button', { name: 'Add content' });
  }
}
