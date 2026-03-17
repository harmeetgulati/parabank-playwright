import { test, expect } from '../../fixtures';
import type { Transaction } from '../../types';

/**
 * API Test Suite — ParaBank REST API
 *
 * Case study requirement:
 * 1. Search transactions using "Find Transactions" API call by amount
 *    for the payment transactions made in the UI test (Step 8 — Bill Pay).
 * 2. Validate the details displayed in the JSON response.
 *
 * These tests use the billPayResult fixture which:
 *   - Creates a user
 *   - Opens a savings account
 *   - Pays a bill of $100.00 from that account
 * Then the API assertion validates the transaction records.
 *
 * @tag @regression @api
 */

test.describe('ParaBank — API: Find Transactions by Amount', () => {
  test('should find transactions by amount matching the bill payment made in Step 8 @smoke', async ({
    apiClient,
    billPayResult,
  }) => {
    const { fromAccountId, amount } = billPayResult;
    const amountNum = parseFloat(amount);

    // Find all transactions on the savings account matching the paid amount
    const transactions: Transaction[] = await apiClient.findTransactionsByAmount(
      parseInt(fromAccountId, 10),
      amountNum,
    );

    // Assertion 1: API returns a valid array (not empty)
    expect(Array.isArray(transactions)).toBe(true);
    expect(transactions.length).toBeGreaterThan(0);

    // Assertion 2: Locate the bill pay transaction specifically
    const billPayTransaction = transactions.find((tx) =>
      tx.description?.toLowerCase().includes('bill payment'),
    );
    expect(
      billPayTransaction,
      `Expected a bill payment transaction in the results. Got: ${JSON.stringify(transactions)}`,
    ).toBeDefined();

    // Assertion 3: Validate all required fields exist on the transaction
    expect(billPayTransaction!.id).toBeDefined();
    expect(typeof billPayTransaction!.id).toBe('number');

    expect(billPayTransaction!.accountId).toBe(parseInt(fromAccountId, 10));

    expect(billPayTransaction!.amount).toBe(amountNum);

    expect(billPayTransaction!.type).toBe('Debit'); // Bill pay is always a debit

    expect(billPayTransaction!.date).toBeDefined();
    expect(typeof billPayTransaction!.date).toBe('number'); // epoch ms

    expect(billPayTransaction!.description).toBeTruthy();
  });

  test('should validate full transaction details by transaction ID @regression', async ({
    apiClient,
    billPayResult,
  }) => {
    const { fromAccountId, amount } = billPayResult;
    const amountNum = parseFloat(amount);

    // First get the list of transactions to retrieve the transaction ID
    const transactions = await apiClient.findTransactionsByAmount(
      parseInt(fromAccountId, 10),
      amountNum,
    );

    const billPayTx = transactions.find((tx) =>
      tx.description?.toLowerCase().includes('bill payment'),
    );
    expect(billPayTx).toBeDefined();

    // Fetch the individual transaction by its ID
    const txDetail = await apiClient.getTransactionById(billPayTx!.id);

    // Assertion: All fields match what we know from the bill pay
    expect(txDetail.id).toBe(billPayTx!.id);
    expect(txDetail.accountId).toBe(parseInt(fromAccountId, 10));
    expect(txDetail.amount).toBe(amountNum);
    expect(txDetail.type).toBe('Debit');
    expect(txDetail.description).toBeTruthy();
  });

  test('should return an array with correct JSON schema for each transaction @regression', async ({
    apiClient,
    billPayResult,
  }) => {
    const { fromAccountId, amount } = billPayResult;

    const transactions = await apiClient.findTransactionsByAmount(
      parseInt(fromAccountId, 10),
      parseFloat(amount),
    );

    expect(transactions.length).toBeGreaterThan(0);

    // Schema assertion: every transaction in the list must conform to the expected shape
    for (const tx of transactions) {
      expect(typeof tx.id).toBe('number');
      expect(typeof tx.accountId).toBe('number');
      expect(typeof tx.amount).toBe('number');
      expect(['Credit', 'Debit']).toContain(tx.type);
      expect(typeof tx.date).toBe('number');
      expect(typeof tx.description).toBe('string');
      expect(tx.description.length).toBeGreaterThan(0);
    }
  });
});
