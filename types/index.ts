/**
 * Shared TypeScript types and interfaces for the ParaBank test suite.
 */

export interface UserData {
  firstName: string;
  lastName: string;
  street: string;
  city: string;
  state: string;
  zipCode: string;
  phone: string;
  ssn: string;
  username: string;
  password: string;
}

export interface Transaction {
  id: number;
  accountId: number;
  type: 'Credit' | 'Debit';
  date: number;
  amount: number;
  description: string;
}

export interface Account {
  id: number;
  customerId: number;
  type: 'CHECKING' | 'SAVINGS' | 'LOAN';
  balance: number;
}

export interface BillPayPayee {
  name: string;
  street: string;
  city: string;
  state: string;
  zipCode: string;
  phone: string;
  accountNumber: string;
  verifyAccount: string;
  amount: string;
}

export interface TransferDetails {
  amount: string;
  fromAccountId: string;
  toAccountId: string;
}
