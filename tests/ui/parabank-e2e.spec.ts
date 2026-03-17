import { test, expect } from '../../fixtures';

/**
 * UI Test Suite — ParaBank End-to-End Flow
 *
 * Covers all 9 steps from the case study requirements:
 * 1. Navigate to ParaBank
 * 2. Register a new user with unique username
 * 3. Login with registered user
 * 4. Verify global navigation menu
 * 5. Create a Savings account and capture account number
 * 6. Validate Accounts Overview balance details
 * 7. Transfer funds from the new account to another account
 * 8. Pay a bill using the new account
 * 9. Assertions at each step
 *
 * @tag @smoke @regression @ui
 */

test.describe('ParaBank — End-to-End Banking Flow', () => {
  // ── Step 1 & 2: Navigation + User Registration ───────────────────────────

  test('should navigate to ParaBank and register a new user with a unique username @smoke', async ({
    page,
    registrationPage,
  }) => {
    // Step 1: Navigate to ParaBank
    await registrationPage.goto();
    await expect(page).toHaveURL(/parabank/);
    await expect(page).toHaveTitle(/ParaBank/);

    // Step 2: Fill and submit registration with unique Faker-generated data
    const { generateUserData } = await import('../../helpers/data-factory');
    const user = generateUserData();

    await registrationPage.registerUser(user);

    // Step 9 assertion: Confirm account was created
    await expect(page.locator('#rightPanel')).toContainText('created successfully');
  });

  // ── Step 3: Login ────────────────────────────────────────────────────────

  test('should login with the registered user credentials @smoke', async ({
    page,
    registeredUser,
    loginPage,
  }) => {
    // The registeredUser fixture auto-logs in after registration.
    // Log out first so we can test the explicit login flow.
    await page.goto('/parabank/logout.htm');
    await expect(page.locator('#loginPanel')).toBeVisible();

    await loginPage.login(registeredUser.username, registeredUser.password);

    // Step 9 assertion: Verify successful login
    await expect(page.locator('#leftPanel')).toContainText('Log Out');
    await expect(page.locator('#leftPanel')).toContainText(
      `${registeredUser.firstName} ${registeredUser.lastName}`,
    );
  });

  // ── Step 4: Global Navigation Menu ──────────────────────────────────────

  test('should display all expected global navigation menu items @regression', async ({
    page,
    homePage,
    authenticatedPage,
  }) => {
    void authenticatedPage; // fixture ensures authenticated session
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

    // Step 9 assertion: Each expected nav item must be present
    for (const item of expectedNavItems) {
      expect(navItems).toContain(item);
    }

    // Verify nav links are functional (respond to clicks without JS errors)
    await homePage.navAccountsOverview.click();
    await expect(page).toHaveURL(/overview/);

    await homePage.navTransferFunds.click();
    await expect(page).toHaveURL(/transfer/);

    await homePage.navBillPay.click();
    await expect(page).toHaveURL(/billpay/);

    await homePage.navOpenAccount.click();
    await expect(page).toHaveURL(/openaccount/);
  });

  // ── Step 5: Open Savings Account ─────────────────────────────────────────

  test('should open a new Savings account and capture the account number @smoke', async ({
    page,
    openNewAccountPage,
    authenticatedPage,
  }) => {
    void authenticatedPage;
    await openNewAccountPage.goto();

    // Wait for from-account dropdown to populate (AJAX-loaded)
    await page.locator('#fromAccountId option').first().waitFor({ state: 'attached' });

    const newAccountId = await openNewAccountPage.openSavingsAccount();

    // Step 9 assertions
    await expect(page.locator('#newAccountId')).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Account Opened!' })).toBeVisible();
    expect(newAccountId).toMatch(/^\d+$/); // must be a numeric account ID
  });

  // ── Step 6: Accounts Overview — Balance Validation ──────────────────────

  test('should display Accounts Overview with balance details for the new Savings account @regression', async ({
    page,
    accountsOverviewPage,
    newSavingsAccountId,
  }) => {
    await accountsOverviewPage.goto();

    // Step 9 assertion: Overview page heading
    await expect(accountsOverviewPage.pageHeading).toContainText('Accounts Overview');

    // Step 9 assertion: New account appears in the table
    const isVisible = await accountsOverviewPage.isAccountVisible(newSavingsAccountId);
    expect(isVisible).toBe(true);

    // Step 9 assertion: Balance column displays a dollar amount (e.g. $100.00)
    const balance = await accountsOverviewPage.getBalanceForAccount(newSavingsAccountId);
    expect(balance).toMatch(/\$[\d,]+\.\d{2}/);

    // Step 9 assertion: Total balance row is present
    await expect(page.locator('#accountTable tfoot')).toBeVisible();
  });

  // ── Step 7: Transfer Funds ────────────────────────────────────────────────

  test('should transfer funds from the new Savings account to another account @regression', async ({
    page,
    transferFundsPage,
    accountsOverviewPage,
    newSavingsAccountId,
  }) => {
    // Get the "other" account to transfer to (the default checking account)
    await accountsOverviewPage.goto();
    const allAccounts = await accountsOverviewPage.getAllAccountIds();

    // Filter to get an account that is NOT the new savings account
    const destinationAccount = allAccounts.find((id) => id !== newSavingsAccountId);
    expect(destinationAccount).toBeDefined();

    await transferFundsPage.goto();

    // Wait for dropdowns to populate
    await page.locator('#fromAccountId option').first().waitFor({ state: 'attached' });

    await transferFundsPage.transferFunds('50', newSavingsAccountId, destinationAccount!);

    // Step 9 assertions
    await expect(transferFundsPage.successMessage).toContainText('Transfer Complete!');
    await expect(page.locator('#rightPanel')).toContainText('$50.00');
    await expect(page.locator('#rightPanel')).toContainText(newSavingsAccountId);
    await expect(page.locator('#rightPanel')).toContainText(destinationAccount!);
  });

  // ── Step 8: Bill Pay ──────────────────────────────────────────────────────

  test('should pay a bill using the new Savings account @regression', async ({
    page,
    billPayPage,
    newSavingsAccountId,
  }) => {
    const { generateBillPayee } = await import('../../helpers/data-factory');
    const payee = generateBillPayee(newSavingsAccountId);

    await billPayPage.goto();
    await billPayPage.payBill(payee, newSavingsAccountId);

    // Step 9 assertions
    await expect(billPayPage.successMessage).toContainText('Bill Payment Complete');
    await expect(page.locator('#billpayResult')).toContainText(payee.name);
    await expect(page.locator('#billpayResult')).toContainText('$100.00');
    await expect(page.locator('#billpayResult')).toContainText(newSavingsAccountId);
  });

  // ── Full chained E2E flow (all 8 steps in one test) ──────────────────────

  test('E2E: full banking journey — register, login, open account, overview, transfer, bill pay @smoke', async ({
    page,
    registrationPage,
    homePage,
    openNewAccountPage,
    accountsOverviewPage,
    transferFundsPage,
    billPayPage,
  }) => {
    const { generateUserData, generateBillPayee } = await import('../../helpers/data-factory');
    const { faker } = await import('@faker-js/faker');

    // Step 1: Navigate
    await page.goto('/parabank/index.htm');
    await expect(page).toHaveTitle(/ParaBank/);

    // Step 2: Register
    const user = generateUserData();
    await registrationPage.goto();
    await registrationPage.registerUser(user);
    await expect(page.locator('#rightPanel')).toContainText('created successfully');

    // Step 3: Login (registration auto-logs in, but let's validate explicitly)
    await expect(page.locator('#leftPanel')).toContainText('Log Out');

    // Step 4: Verify global nav
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

    // Step 6: Accounts Overview — validate balance
    await accountsOverviewPage.goto();
    await expect(accountsOverviewPage.pageHeading).toContainText('Accounts Overview');
    const isVisible = await accountsOverviewPage.isAccountVisible(newAccountId);
    expect(isVisible).toBe(true);
    const balance = await accountsOverviewPage.getBalanceForAccount(newAccountId);
    expect(balance).toMatch(/\$[\d,]+\.\d{2}/);

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

    // Final: Log out
    await homePage.navLogOut.click();
    await expect(page.locator('#loginPanel')).toBeVisible();

    void faker; // imported for type resolution
  });
});
