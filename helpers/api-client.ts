import type { APIRequestContext } from '@playwright/test';
import type { Account, Transaction } from '../types';

const BASE = 'https://parabank.parasoft.com/parabank/services/bank';

/**
 * Thin API client wrapping ParaBank REST endpoints.
 * Used in API tests and as a helper in UI test fixtures (e.g., fetching account IDs).
 */
export class ParaBankApiClient {
  constructor(private readonly request: APIRequestContext) {}

  private async assertOk(response: Awaited<ReturnType<APIRequestContext['get']>>): Promise<void> {
    if (!response.ok()) {
      const body = await response.text();
      throw new Error(`API ${response.url()} returned ${response.status()}: ${body}`);
    }
  }

  async loginAndGetCustomerId(username: string, password: string): Promise<number> {
    const response = await this.request.get(`${BASE}/login/${username}/${password}`, {
      headers: { Accept: 'application/json' },
    });
    await this.assertOk(response);
    const body = await response.json();
    return body.id as number;
  }

  async getAccountsByCustomerId(customerId: number): Promise<Account[]> {
    const response = await this.request.get(`${BASE}/customers/${customerId}/accounts`, {
      headers: { Accept: 'application/json' },
    });
    await this.assertOk(response);
    return response.json() as Promise<Account[]>;
  }

  async findTransactionsByAmount(accountId: number, amount: number): Promise<Transaction[]> {
    const response = await this.request.get(
      `${BASE}/accounts/${accountId}/transactions/amount/${amount}`,
      { headers: { Accept: 'application/json' } },
    );
    await this.assertOk(response);
    return response.json() as Promise<Transaction[]>;
  }

  async getTransactionById(transactionId: number): Promise<Transaction> {
    const response = await this.request.get(`${BASE}/transactions/${transactionId}`, {
      headers: { Accept: 'application/json' },
    });
    await this.assertOk(response);
    return response.json() as Promise<Transaction>;
  }
}
