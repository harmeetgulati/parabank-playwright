import type { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';

/**
 * AccountsOverviewPage represents the account summary / overview screen.
 */
export class AccountsOverviewPage extends BasePage {
  readonly pageHeading: Locator;
  readonly accountTable: Locator;
  readonly totalBalance: Locator;

  constructor(page: Page) {
    super(page);
    this.pageHeading = page.getByRole('heading', { name: 'Accounts Overview' });
    this.accountTable = page.locator('#accountTable');
    this.totalBalance = page.locator('#accountTable tfoot .ng-binding').last();
  }

  async goto(): Promise<void> {
    await this.page.goto('/parabank/overview.htm');
  }

  /**
   * Returns the balance for a given account ID from the overview table.
   */
  async getBalanceForAccount(accountId: string): Promise<string> {
    const row = this.page.locator(`#accountTable a[href*="${accountId}"]`).locator('../..');
    const balanceCell = row.locator('td').nth(1);
    return balanceCell.innerText();
  }

  /**
   * Retrieves all account IDs visible on the overview table.
   * Waits for at least one account link to appear before collecting.
   */
  async getAllAccountIds(): Promise<string[]> {
    await this.page.locator('#accountTable tbody td a').first().waitFor({ state: 'visible' });
    const links = this.page.locator('#accountTable tbody td a');
    const count = await links.count();
    const ids: string[] = [];
    for (let i = 0; i < count; i++) {
      ids.push(await links.nth(i).innerText());
    }
    return ids;
  }

  async isAccountVisible(accountId: string): Promise<boolean> {
    try {
      await this.page
        .locator(`#accountTable a[href*="${accountId}"]`)
        .waitFor({ state: 'visible', timeout: 10_000 });
      return true;
    } catch {
      return false;
    }
  }

  async getTotalBalance(): Promise<string> {
    return this.totalBalance.innerText();
  }
}
