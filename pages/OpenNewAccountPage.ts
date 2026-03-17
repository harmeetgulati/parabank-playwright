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
  readonly confirmationHeading: Locator;

  constructor(page: Page) {
    super(page);
    this.accountTypeSelect = page.locator('#type');
    this.fromAccountSelect = page.locator('#fromAccountId');
    this.openAccountButton = page.locator('input[value="Open New Account"]');
    this.newAccountId = page.locator('#newAccountId');
    this.confirmationHeading = page.locator('#rightPanel .ng-scope h1.title');
  }

  async goto(): Promise<void> {
    await this.page.goto('/parabank/openaccount.htm');
  }

  async openSavingsAccount(fromAccountId?: string): Promise<string> {
    // Select SAVINGS account type (value "1")
    await this.accountTypeSelect.selectOption({ label: 'SAVINGS' });

    if (fromAccountId) {
      await this.fromAccountSelect.selectOption({ value: fromAccountId });
    }

    await this.openAccountButton.click();

    // Wait for the new account ID to appear in the confirmation
    await this.newAccountId.waitFor({ state: 'visible' });
    return this.newAccountId.innerText();
  }

  async getNewAccountId(): Promise<string> {
    await this.newAccountId.waitFor({ state: 'visible' });
    return this.newAccountId.innerText();
  }
}
