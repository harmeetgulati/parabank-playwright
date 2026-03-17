import type { APIRequestContext } from '@playwright/test';
import type { Account, Transaction } from '../types';

const BASE = 'https://parabank.parasoft.com/parabank/services/bank';

/**
 * Thin API client wrapping ParaBank REST endpoints.
 * Used in API tests and as a helper in UI test fixtures (e.g., fetching account IDs).
 */
export class ParaBankApiClient {
  constructor(private readonly request: APIRequestContext) {}

  async loginAndGetCustomerId(username: string, password: string): Promise<number> {
    const response = await this.request.get(`${BASE}/login/${username}/${password}`, {
      headers: { Accept: 'application/json' },
    });
    const body = await response.json();
    return body.id as number;
  }

  async getAccountsByCustomerId(customerId: number): Promise<Account[]> {
    const response = await this.request.get(`${BASE}/customers/${customerId}/accounts`, {
      headers: { Accept: 'application/json' },
    });
    return response.json() as Promise<Account[]>;
  }

  async findTransactionsByAmount(accountId: number, amount: number): Promise<Transaction[]> {
    const response = await this.request.get(
      `${BASE}/accounts/${accountId}/transactions/amount/${amount}`,
      { headers: { Accept: 'application/json' } },
    );
    return response.json() as Promise<Transaction[]>;
  }

  async getTransactionById(transactionId: number): Promise<Transaction> {
    const response = await this.request.get(`${BASE}/transactions/${transactionId}`, {
      headers: { Accept: 'application/json' },
    });
    return response.json() as Promise<Transaction>;
  }
}
