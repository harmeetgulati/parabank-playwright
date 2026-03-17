import type { Page, Locator } from '@playwright/test';

/**
 * BasePage provides shared navigation elements and utility methods
 * common to every page in the ParaBank application.
 * All Page Objects extend this class (DRY principle).
 */
export class BasePage {
  protected readonly page: Page;

  // Global navigation menu items (left panel — authenticated state)
  readonly navOpenAccount: Locator;
  readonly navAccountsOverview: Locator;
  readonly navTransferFunds: Locator;
  readonly navBillPay: Locator;
  readonly navFindTransactions: Locator;
  readonly navUpdateContactInfo: Locator;
  readonly navRequestLoan: Locator;
  readonly navLogOut: Locator;

  constructor(page: Page) {
    this.page = page;

    this.navOpenAccount = page.locator('#leftPanel a[href*="openaccount"]');
    this.navAccountsOverview = page.locator('#leftPanel a[href*="overview"]');
    this.navTransferFunds = page.locator('#leftPanel a[href*="transfer"]');
    this.navBillPay = page.locator('#leftPanel a[href*="billpay"]');
    this.navFindTransactions = page.locator('#leftPanel a[href*="findtrans"]');
    this.navUpdateContactInfo = page.locator('#leftPanel a[href*="updateprofile"]');
    this.navRequestLoan = page.locator('#leftPanel a[href*="requestloan"]');
    this.navLogOut = page.locator('#leftPanel a[href*="logout"]');
  }

  async navigateTo(path: string = ''): Promise<void> {
    await this.page.goto(path);
  }

  async getPageTitle(): Promise<string> {
    return this.page.title();
  }
}
