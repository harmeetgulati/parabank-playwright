import type { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';

/**
 * OpenNewAccountPage handles creating a new bank account.
 */
export class OpenNewAccountPage extends BasePage {
  readonly accountTypeSelect: Locator;
  readonly fromAccountSelect: Locator;
  readonly openAccountButton: Locator;
  readonly newAccountId: Locator;

  constructor(page: Page) {
    super(page);
    this.accountTypeSelect = page.locator('#type');
    this.fromAccountSelect = page.locator('#fromAccountId');
    this.openAccountButton = page.locator('input[value="Open New Account"]');
    this.newAccountId = page.locator('#newAccountId');
  }

  async goto(): Promise<void> {
    await this.page.goto('/parabank/openaccount.htm');
  }

  async openSavingsAccount(fromAccountId?: string): Promise<string> {
    await this.accountTypeSelect.selectOption({ label: 'SAVINGS' });

    if (fromAccountId) {
      await this.fromAccountSelect.selectOption({ value: fromAccountId });
    }

    await this.openAccountButton.click();
    await this.newAccountId.waitFor({ state: 'visible' });
    return this.newAccountId.innerText();
  }

  async getNewAccountId(): Promise<string> {
    await this.newAccountId.waitFor({ state: 'visible' });
    return this.newAccountId.innerText();
  }
}
