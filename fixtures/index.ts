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

export type ParaBankFixtures = {
  loginPage: LoginPage;
  registrationPage: RegistrationPage;
  homePage: HomePage;
  accountsOverviewPage: AccountsOverviewPage;
  openNewAccountPage: OpenNewAccountPage;
  transferFundsPage: TransferFundsPage;
  billPayPage: BillPayPage;
  apiClient: ParaBankApiClient;
  registeredUser: UserData;
  authenticatedPage: { userData: UserData };
  newSavingsAccountId: string;
  billPayResult: { payeeName: string; amount: string; fromAccountId: string };
};

export const test = base.extend<ParaBankFixtures>({
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

  apiClient: async ({ request }, use) => {
    await use(new ParaBankApiClient(request));
  },

  /** Registers a fresh user; yields credentials. */
  registeredUser: async ({ registrationPage }, use) => {
    const userData = generateUserData();
    await registrationPage.goto();
    await registrationPage.registerUser(userData);
    await use(userData);
  },

  /** Registers a fresh user and navigates to account overview; yields credentials. */
  authenticatedPage: async ({ page, registrationPage }, use) => {
    const userData = generateUserData();
    await registrationPage.goto();
    await registrationPage.registerUser(userData);
    await page.goto('/parabank/overview.htm');
    await use({ userData });
  },

  /** Opens a Savings account on an authenticated session; yields the new account ID. */
  newSavingsAccountId: async ({ page, authenticatedPage, openNewAccountPage }, use) => {
    void authenticatedPage; // side-effect: ensures authenticated session
    await openNewAccountPage.goto();
    await page.locator('#fromAccountId option').first().waitFor({ state: 'attached' });
    const accountId = await openNewAccountPage.openSavingsAccount();
    await expect(page.locator('#newAccountId')).toBeVisible();
    await use(accountId);
  },

  /** Pays a $100 bill from the savings account; yields payment details for API assertions. */
  billPayResult: async ({ newSavingsAccountId, billPayPage }, use) => {
    const payee = generateBillPayee(newSavingsAccountId);
    await billPayPage.goto();
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
