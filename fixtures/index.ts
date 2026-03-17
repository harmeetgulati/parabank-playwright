import { test as base, expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { RegistrationPage } from '../pages/RegistrationPage';
import { HomePage } from '../pages/HomePage';
import { AccountsOverviewPage } from '../pages/AccountsOverviewPage';
import { OpenNewAccountPage } from '../pages/OpenNewAccountPage';
import { TransferFundsPage } from '../pages/TransferFundsPage';
import { BillPayPage } from '../pages/BillPayPage';
import { ParaBankApiClient } from '../helpers/api-client';
import { generateUserData, generateBillPayee } from '../helpers/data-factory';
import type { UserData } from '../types';

/**
 * Type definitions for all custom fixtures.
 */
export type ParaBankFixtures = {
  // Pages
  loginPage: LoginPage;
  registrationPage: RegistrationPage;
  homePage: HomePage;
  accountsOverviewPage: AccountsOverviewPage;
  openNewAccountPage: OpenNewAccountPage;
  transferFundsPage: TransferFundsPage;
  billPayPage: BillPayPage;

  // API client
  apiClient: ParaBankApiClient;

  // Pre-condition fixtures
  registeredUser: UserData;
  authenticatedPage: { userData: UserData };
  newSavingsAccountId: string;
  billPayResult: { payeeName: string; amount: string; fromAccountId: string };
};

/**
 * Extended test object with all project-level fixtures baked in.
 * Import this `test` in all spec files instead of '@playwright/test'.
 */
export const test = base.extend<ParaBankFixtures>({
  // ── Page Object fixtures ────────────────────────────────────────────────────

  loginPage: async ({ page }, use) => {
    await use(new LoginPage(page));
  },

  registrationPage: async ({ page }, use) => {
    await use(new RegistrationPage(page));
  },

  homePage: async ({ page }, use) => {
    await use(new HomePage(page));
  },

  accountsOverviewPage: async ({ page }, use) => {
    await use(new AccountsOverviewPage(page));
  },

  openNewAccountPage: async ({ page }, use) => {
    await use(new OpenNewAccountPage(page));
  },

  transferFundsPage: async ({ page }, use) => {
    await use(new TransferFundsPage(page));
  },

  billPayPage: async ({ page }, use) => {
    await use(new BillPayPage(page));
  },

  // ── API Client fixture ──────────────────────────────────────────────────────

  apiClient: async ({ request }, use) => {
    await use(new ParaBankApiClient(request));
  },

  // ── Pre-condition fixtures ──────────────────────────────────────────────────

  /**
   * Registers a brand-new unique user and yields their credentials.
   * Each test that needs a fresh user gets one automatically.
   */
  registeredUser: async ({ page }, use) => {
    const userData = generateUserData();
    const registrationPage = new RegistrationPage(page);
    await registrationPage.goto();
    // registerUser() waits internally until #leftPanel shows 'Log Out'
    await registrationPage.registerUser(userData);
    await use(userData);
  },

  /**
   * Registers AND logs in a new user, then yields their credentials.
   * Tests that need an authenticated session use this fixture.
   */
  authenticatedPage: async ({ page }, use) => {
    const userData = generateUserData();
    const registrationPage = new RegistrationPage(page);
    await registrationPage.goto();
    // registerUser() waits internally until #leftPanel shows 'Log Out'
    await registrationPage.registerUser(userData);
    // Navigate to overview to land on a stable authenticated page
    await page.goto('/parabank/overview.htm');

    await use({ userData });
  },

  /**
   * Builds on authenticatedPage: opens a Savings account and yields its ID.
   * Tests that require a specific account ID use this fixture.
   */
  newSavingsAccountId: async ({ page, authenticatedPage }, use) => {
    void authenticatedPage; // consumed for its side-effect (authenticated session)
    const openAccountPage = new OpenNewAccountPage(page);
    await openAccountPage.goto();

    // Wait for the from-account dropdown to populate
    await page.locator('#fromAccountId option').first().waitFor({ state: 'attached' });
    const accountId = await openAccountPage.openSavingsAccount();

    await expect(page.locator('#newAccountId')).toBeVisible();
    await use(accountId);
  },

  /**
   * Builds on newSavingsAccountId: performs a bill payment and yields details
   * for subsequent API assertion.
   */
  billPayResult: async ({ page, newSavingsAccountId }, use) => {
    const billPayPage = new BillPayPage(page);
    await billPayPage.goto();

    const payee = generateBillPayee(newSavingsAccountId);
    await billPayPage.payBill(payee, newSavingsAccountId);
    await expect(billPayPage.successMessage).toContainText('Bill Payment Complete');

    await use({
      payeeName: payee.name,
      amount: payee.amount,
      fromAccountId: newSavingsAccountId,
    });
  },
});

export { expect };
