import type { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';

/**
 * HomePage represents the authenticated user dashboard.
 * Exposes the global navigation and welcome message for assertion.
 */
export class HomePage extends BasePage {
  readonly welcomeMessage: Locator;
  readonly accountTable: Locator;

  constructor(page: Page) {
    super(page);
    this.welcomeMessage = page.locator('#leftPanel .smallText').first();
    this.accountTable = page.locator('#accountTable');
  }

  async goto(): Promise<void> {
    await this.page.goto('/parabank/overview.htm');
  }

  /**
   * Returns an array of all visible nav menu link texts in the left panel.
   * Used to verify all expected navigation items are present.
   */
  async getNavigationMenuItems(): Promise<string[]> {
    const links = this.page.locator('#leftPanel ul li a');
    const count = await links.count();
    const items: string[] = [];
    for (let i = 0; i < count; i++) {
      const text = await links.nth(i).innerText();
      items.push(text.trim());
    }
    return items;
  }

  async getWelcomeText(): Promise<string> {
    return this.welcomeMessage.innerText();
  }
}
