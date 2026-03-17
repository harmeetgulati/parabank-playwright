import type { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';
import type { UserData } from '../types';

/**
 * RegistrationPage encapsulates the user registration form.
 */
export class RegistrationPage extends BasePage {
  readonly firstNameInput: Locator;
  readonly lastNameInput: Locator;
  readonly streetInput: Locator;
  readonly cityInput: Locator;
  readonly stateInput: Locator;
  readonly zipCodeInput: Locator;
  readonly phoneInput: Locator;
  readonly ssnInput: Locator;
  readonly usernameInput: Locator;
  readonly passwordInput: Locator;
  readonly repeatedPasswordInput: Locator;
  readonly registerButton: Locator;
  readonly successMessage: Locator;
  readonly errorPanel: Locator;

  constructor(page: Page) {
    super(page);
    // Use attribute selector to avoid CSS escaping issues with dot notation IDs
    this.firstNameInput = page.locator('[id="customer.firstName"]');
    this.lastNameInput = page.locator('[id="customer.lastName"]');
    this.streetInput = page.locator('[id="customer.address.street"]');
    this.cityInput = page.locator('[id="customer.address.city"]');
    this.stateInput = page.locator('[id="customer.address.state"]');
    this.zipCodeInput = page.locator('[id="customer.address.zipCode"]');
    this.phoneInput = page.locator('[id="customer.phoneNumber"]');
    this.ssnInput = page.locator('[id="customer.ssn"]');
    this.usernameInput = page.locator('[id="customer.username"]');
    this.passwordInput = page.locator('[id="customer.password"]');
    this.repeatedPasswordInput = page.locator('#repeatedPassword');
    this.registerButton = page.locator('input[value="Register"]');
    this.successMessage = page.locator('#rightPanel p').first();
    this.errorPanel = page.locator('.error');
  }

  async goto(): Promise<void> {
    await this.page.goto('/parabank/register.htm');
  }

  async registerUser(user: UserData): Promise<void> {
    await this.firstNameInput.fill(user.firstName);
    await this.lastNameInput.fill(user.lastName);
    await this.streetInput.fill(user.street);
    await this.cityInput.fill(user.city);
    await this.stateInput.fill(user.state);
    await this.zipCodeInput.fill(user.zipCode);
    await this.phoneInput.fill(user.phone);
    await this.ssnInput.fill(user.ssn);
    await this.usernameInput.fill(user.username);
    await this.passwordInput.fill(user.password);
    await this.repeatedPasswordInput.fill(user.password);
    await this.registerButton.click();
    // Wait until we're logged in (registration auto-logs in on success)
    await this.page
      .locator('#leftPanel')
      .filter({ hasText: 'Log Out' })
      .waitFor({ state: 'visible', timeout: 30_000 });
  }

  async getSuccessMessage(): Promise<string> {
    return this.successMessage.innerText();
  }
}
