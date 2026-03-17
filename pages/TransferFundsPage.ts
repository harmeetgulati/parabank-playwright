import type { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';

/**
 * TransferFundsPage handles the fund transfer between accounts.
 */
export class TransferFundsPage extends BasePage {
  readonly amountInput: Locator;
  readonly fromAccountSelect: Locator;
  readonly toAccountSelect: Locator;
  readonly transferButton: Locator;
  readonly successMessage: Locator;
  readonly transferAmount: Locator;
  readonly fromAccountConfirm: Locator;
  readonly toAccountConfirm: Locator;

  constructor(page: Page) {
    super(page);
    this.amountInput = page.locator('#amount');
    this.fromAccountSelect = page.locator('#fromAccountId');
    this.toAccountSelect = page.locator('#toAccountId');
    this.transferButton = page.locator('input[value="Transfer"]');
    this.successMessage = page.getByRole('heading', { name: 'Transfer Complete!' });
    this.transferAmount = page.locator('#amount.ng-binding');
    this.fromAccountConfirm = page.locator('#fromAccountId.ng-binding');
    this.toAccountConfirm = page.locator('#toAccountId.ng-binding');
  }

  async goto(): Promise<void> {
    await this.page.goto('/parabank/transfer.htm');
  }

  /**
   * Transfers a given amount from one account to another.
   * @returns the success message title text
   */
  async transferFunds(amount: string, fromAccountId: string, toAccountId: string): Promise<void> {
    await this.amountInput.fill(amount);
    await this.fromAccountSelect.selectOption({ value: fromAccountId });
    await this.toAccountSelect.selectOption({ value: toAccountId });
    await this.transferButton.click();
    await this.successMessage.waitFor({ state: 'visible' });
  }

  async getSuccessHeading(): Promise<string> {
    return this.successMessage.innerText();
  }
}
