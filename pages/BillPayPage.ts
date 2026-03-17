import type { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';
import type { BillPayPayee } from '../types';

/**
 * BillPayPage handles the bill payment form.
 */
export class BillPayPage extends BasePage {
  readonly payeeNameInput: Locator;
  readonly addressInput: Locator;
  readonly cityInput: Locator;
  readonly stateInput: Locator;
  readonly zipCodeInput: Locator;
  readonly phoneInput: Locator;
  readonly accountNumberInput: Locator;
  readonly verifyAccountInput: Locator;
  readonly amountInput: Locator;
  readonly fromAccountSelect: Locator;
  readonly sendPaymentButton: Locator;
  readonly successMessage: Locator;

  constructor(page: Page) {
    super(page);
    this.payeeNameInput = page.locator('input[name="payee.name"]');
    this.addressInput = page.locator('input[name="payee.address.street"]');
    this.cityInput = page.locator('input[name="payee.address.city"]');
    this.stateInput = page.locator('input[name="payee.address.state"]');
    this.zipCodeInput = page.locator('input[name="payee.address.zipCode"]');
    this.phoneInput = page.locator('input[name="payee.phoneNumber"]');
    this.accountNumberInput = page.locator('input[name="payee.accountNumber"]');
    this.verifyAccountInput = page.locator('input[name="verifyAccount"]');
    this.amountInput = page.locator('input[name="amount"]');
    this.fromAccountSelect = page.locator('select[name="fromAccountId"]');
    this.sendPaymentButton = page.locator('input[value="Send Payment"]');
    this.successMessage = page.locator('#billpayResult h1.title');
  }

  async goto(): Promise<void> {
    await this.page.goto('/parabank/billpay.htm');
  }

  async payBill(payee: BillPayPayee, fromAccountId: string): Promise<void> {
    await this.payeeNameInput.fill(payee.name);
    await this.addressInput.fill(payee.street);
    await this.cityInput.fill(payee.city);
    await this.stateInput.fill(payee.state);
    await this.zipCodeInput.fill(payee.zipCode);
    await this.phoneInput.fill(payee.phone);
    await this.accountNumberInput.fill(payee.accountNumber);
    await this.verifyAccountInput.fill(payee.verifyAccount);
    await this.amountInput.fill(payee.amount);
    await this.fromAccountSelect.selectOption({ value: fromAccountId });
    await this.sendPaymentButton.click();
    await this.successMessage.waitFor({ state: 'visible' });
  }

  async getSuccessHeading(): Promise<string> {
    return this.successMessage.innerText();
  }
}
