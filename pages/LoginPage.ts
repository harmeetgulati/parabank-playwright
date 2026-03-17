import type { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';

/**
 * LoginPage encapsulates the login form on the ParaBank homepage.
 */
export class LoginPage extends BasePage {
  readonly usernameInput: Locator;
  readonly passwordInput: Locator;
  readonly loginButton: Locator;
  readonly registerLink: Locator;
  readonly errorMessage: Locator;

  constructor(page: Page) {
    super(page);
    this.usernameInput = page.locator('input[name="username"]').first();
    this.passwordInput = page.locator('input[name="password"]').first();
    this.loginButton = page.locator('input[value="Log In"]');
    this.registerLink = page.locator('a[href*="register"]').first();
    this.errorMessage = page.locator('.error');
  }

  async goto(): Promise<void> {
    await this.page.goto('/parabank/index.htm');
  }

  async login(username: string, password: string): Promise<void> {
    await this.usernameInput.fill(username);
    await this.passwordInput.fill(password);
    await this.loginButton.click();
  }
}
