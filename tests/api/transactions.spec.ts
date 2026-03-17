import { test, expect } from '../../fixtures';
import type { Transaction } from '../../types';

test.describe('ParaBank — API: Find Transactions by Amount', () => {
  test(
    'should find transactions by amount matching the bill payment',
    { tag: ['@smoke'] },
    async ({ apiClient, billPayResult }) => {
      const { fromAccountId, amount } = billPayResult;
      const accountId = parseInt(fromAccountId, 10);
      const amountNum = parseFloat(amount);

      const transactions: Transaction[] = await apiClient.findTransactionsByAmount(
        accountId,
        amountNum,
      );

      expect(Array.isArray(transactions)).toBe(true);
      expect(transactions.length).toBeGreaterThan(0);

      const billPayTx = transactions.find((tx) =>
        tx.description?.toLowerCase().includes('bill payment'),
      );
      expect(
        billPayTx,
        `Expected a bill payment transaction. Got: ${JSON.stringify(transactions)}`,
      ).toBeDefined();

      expect(typeof billPayTx!.id).toBe('number');
      expect(billPayTx!.accountId).toBe(accountId);
      expect(billPayTx!.amount).toBe(amountNum);
      expect(billPayTx!.type).toBe('Debit'); // bill pay is always a debit
      expect(typeof billPayTx!.date).toBe('number'); // epoch ms
      expect(billPayTx!.description).toBeTruthy();
    },
  );

  test(
    'should validate full transaction details by transaction ID',
    { tag: ['@regression'] },
    async ({ apiClient, billPayResult }) => {
      const { fromAccountId, amount } = billPayResult;
      const accountId = parseInt(fromAccountId, 10);
      const amountNum = parseFloat(amount);

      const transactions = await apiClient.findTransactionsByAmount(accountId, amountNum);
      const billPayTx = transactions.find((tx) =>
        tx.description?.toLowerCase().includes('bill payment'),
      );
      expect(billPayTx).toBeDefined();

      const txDetail = await apiClient.getTransactionById(billPayTx!.id);

      expect(txDetail.id).toBe(billPayTx!.id);
      expect(txDetail.accountId).toBe(accountId);
      expect(txDetail.amount).toBe(amountNum);
      expect(txDetail.type).toBe('Debit');
      expect(txDetail.description).toBeTruthy();
    },
  );

  test(
    'should return an array with correct JSON schema for each transaction',
    { tag: ['@regression'] },
    async ({ apiClient, billPayResult }) => {
      const { fromAccountId, amount } = billPayResult;

      const transactions = await apiClient.findTransactionsByAmount(
        parseInt(fromAccountId, 10),
        parseFloat(amount),
      );

      expect(transactions.length).toBeGreaterThan(0);

      for (const tx of transactions) {
        expect(typeof tx.id).toBe('number');
        expect(typeof tx.accountId).toBe('number');
        expect(typeof tx.amount).toBe('number');
        expect(['Credit', 'Debit']).toContain(tx.type);
        expect(typeof tx.date).toBe('number');
        expect(typeof tx.description).toBe('string');
        expect(tx.description.length).toBeGreaterThan(0);
      }
    },
  );
});
