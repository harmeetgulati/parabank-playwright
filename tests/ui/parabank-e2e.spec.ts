import { test, expect } from '../../fixtures';
import { generateUserData, generateBillPayee } from '../../helpers/data-factory';

test.describe('ParaBank — End-to-End Banking Flow', () => {
  test(
    'should navigate to ParaBank and register a new user with a unique username',
    { tag: ['@smoke'] },
    async ({ page, registrationPage }) => {
      await registrationPage.goto();
      await expect(page).toHaveURL(/parabank/);
      await expect(page).toHaveTitle(/ParaBank/);

      const user = generateUserData();
      await registrationPage.registerUser(user);

      await expect(page.locator('#rightPanel')).toContainText('created successfully');
    },
  );

  test(
    'should login with the registered user credentials',
    { tag: ['@smoke'] },
    async ({ page, registeredUser, loginPage }) => {
      // registration auto-logs in — navigate to logout first to test explicit login
      await page.goto('/parabank/logout.htm');
      await expect(page.locator('#loginPanel')).toBeVisible();

      await loginPage.login(registeredUser.username, registeredUser.password);

      await expect(page.locator('#leftPanel')).toContainText('Log Out');
      await expect(page.locator('#leftPanel')).toContainText(
        `${registeredUser.firstName} ${registeredUser.lastName}`,
      );
    },
  );

  test(
    'should display all expected global navigation menu items',
    { tag: ['@regression'] },
    async ({ page, homePage, authenticatedPage }) => {
      void authenticatedPage;
      await homePage.goto();

      const expectedNavItems = [
        'Open New Account',
        'Accounts Overview',
        'Transfer Funds',
        'Bill Pay',
        'Find Transactions',
        'Update Contact Info',
        'Request Loan',
        'Log Out',
      ];

      const navItems = await homePage.getNavigationMenuItems();
      for (const item of expectedNavItems) {
        expect(navItems).toContain(item);
      }

      // Verify each nav link navigates to the correct route
      await homePage.navAccountsOverview.click();
      await expect(page).toHaveURL(/overview/);

      await homePage.navTransferFunds.click();
      await expect(page).toHaveURL(/transfer/);

      await homePage.navBillPay.click();
      await expect(page).toHaveURL(/billpay/);

      await homePage.navOpenAccount.click();
      await expect(page).toHaveURL(/openaccount/);
    },
  );

  test(
    'should open a new Savings account and capture the account number',
    { tag: ['@smoke'] },
    async ({ page, openNewAccountPage, authenticatedPage }) => {
      void authenticatedPage;
      await openNewAccountPage.goto();

      // Wait for AJAX-loaded from-account dropdown
      await page.locator('#fromAccountId option').first().waitFor({ state: 'attached' });

      const newAccountId = await openNewAccountPage.openSavingsAccount();

      await expect(page.locator('#newAccountId')).toBeVisible();
      await expect(page.getByRole('heading', { name: 'Account Opened!' })).toBeVisible();
      expect(newAccountId).toMatch(/^\d+$/);
    },
  );

  test(
    'should display Accounts Overview with balance details for the new Savings account',
    { tag: ['@regression'] },
    async ({ page, accountsOverviewPage, newSavingsAccountId }) => {
      await accountsOverviewPage.goto();

      await expect(accountsOverviewPage.pageHeading).toContainText('Accounts Overview');
      await expect(page.locator('#accountTable tfoot')).toBeVisible();

      const isVisible = await accountsOverviewPage.isAccountVisible(newSavingsAccountId);
      expect(isVisible).toBe(true);

      const balance = await accountsOverviewPage.getBalanceForAccount(newSavingsAccountId);
      expect(balance).toMatch(/\$[\d,]+\.\d{2}/);
    },
  );

  test(
    'should transfer funds from the new Savings account to another account',
    { tag: ['@regression'] },
    async ({ page, transferFundsPage, accountsOverviewPage, newSavingsAccountId }) => {
      await accountsOverviewPage.goto();
      const allAccounts = await accountsOverviewPage.getAllAccountIds();
      // Use the default checking account as the transfer destination
      const destinationAccount = allAccounts.find((id) => id !== newSavingsAccountId);
      expect(destinationAccount).toBeDefined();

      await transferFundsPage.goto();
      // Wait for AJAX-loaded account dropdowns
      await page.locator('#fromAccountId option').first().waitFor({ state: 'attached' });

      await transferFundsPage.transferFunds('50', newSavingsAccountId, destinationAccount!);

      await expect(transferFundsPage.successMessage).toContainText('Transfer Complete!');
      await expect(page.locator('#rightPanel')).toContainText('$50.00');
      await expect(page.locator('#rightPanel')).toContainText(newSavingsAccountId);
      await expect(page.locator('#rightPanel')).toContainText(destinationAccount!);
    },
  );

  test(
    'should pay a bill using the new Savings account',
    { tag: ['@regression'] },
    async ({ page, billPayPage, newSavingsAccountId }) => {
      const payee = generateBillPayee(newSavingsAccountId);
      await billPayPage.goto();
      await billPayPage.payBill(payee, newSavingsAccountId);

      await expect(billPayPage.successMessage).toContainText('Bill Payment Complete');
      await expect(page.locator('#billpayResult')).toContainText(payee.name);
      await expect(page.locator('#billpayResult')).toContainText('$100.00');
      await expect(page.locator('#billpayResult')).toContainText(newSavingsAccountId);
    },
  );

  test(
    'E2E: full banking journey — register, login, open account, overview, transfer, bill pay',
    { tag: ['@smoke'] },
    async ({
      page,
      registrationPage,
      homePage,
      openNewAccountPage,
      accountsOverviewPage,
      transferFundsPage,
      billPayPage,
    }) => {
      // Step 1: Navigate
      await page.goto('/parabank/index.htm');
      await expect(page).toHaveTitle(/ParaBank/);

      // Step 2: Register
      const user = generateUserData();
      await registrationPage.goto();
      await registrationPage.registerUser(user);
      await expect(page.locator('#rightPanel')).toContainText('created successfully');

      // Step 3: Verify post-registration login state
      await expect(page.locator('#leftPanel')).toContainText('Log Out');

      // Step 4: Global nav
      await homePage.goto();
      const navItems = await homePage.getNavigationMenuItems();
      expect(navItems).toContain('Open New Account');
      expect(navItems).toContain('Transfer Funds');
      expect(navItems).toContain('Bill Pay');
      expect(navItems).toContain('Log Out');

      // Step 5: Open Savings account
      await openNewAccountPage.goto();
      await page.locator('#fromAccountId option').first().waitFor({ state: 'attached' });
      const newAccountId = await openNewAccountPage.openSavingsAccount();
      expect(newAccountId).toMatch(/^\d+$/);
      await expect(page.getByRole('heading', { name: 'Account Opened!' })).toBeVisible();

      // Step 6: Accounts Overview
      await accountsOverviewPage.goto();
      await expect(accountsOverviewPage.pageHeading).toContainText('Accounts Overview');
      expect(await accountsOverviewPage.isAccountVisible(newAccountId)).toBe(true);
      expect(await accountsOverviewPage.getBalanceForAccount(newAccountId)).toMatch(
        /\$[\d,]+\.\d{2}/,
      );

      // Step 7: Transfer funds
      const allAccounts = await accountsOverviewPage.getAllAccountIds();
      const destinationAccount = allAccounts.find((id) => id !== newAccountId);
      await transferFundsPage.goto();
      await page.locator('#fromAccountId option').first().waitFor({ state: 'attached' });
      await transferFundsPage.transferFunds('50', newAccountId, destinationAccount!);
      await expect(transferFundsPage.successMessage).toContainText('Transfer Complete!');

      // Step 8: Bill Pay
      const payee = generateBillPayee(newAccountId);
      await billPayPage.goto();
      await billPayPage.payBill(payee, newAccountId);
      await expect(billPayPage.successMessage).toContainText('Bill Payment Complete');

      // Log out
      await homePage.navLogOut.click();
      await expect(page.locator('#loginPanel')).toBeVisible();
    },
  );
});
