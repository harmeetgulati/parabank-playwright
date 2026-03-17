import { faker } from '@faker-js/faker';
import type { UserData, BillPayPayee } from '../types';

/**
 * Generates a unique, randomised user registration payload.
 * Using Faker ensures each test run produces a fresh user,
 * preventing cross-test contamination on the shared ParaBank instance.
 */
export function generateUserData(): UserData {
  const firstName = faker.person.firstName();
  const lastName = faker.person.lastName();
  // Suffix with random digits to guarantee username uniqueness across parallel runs
  const uniqueSuffix = faker.string.alphanumeric(8).toLowerCase();

  return {
    firstName,
    lastName,
    street: faker.location.streetAddress(),
    city: faker.location.city(),
    state: faker.location.state({ abbreviated: true }),
    zipCode: faker.location.zipCode('#####'),
    phone: faker.string.numeric(10),
    ssn: faker.string.numeric(9),
    username: `${firstName.toLowerCase()}_${uniqueSuffix}`,
    password: `Test@${faker.string.alphanumeric(8)}`,
  };
}

/**
 * Generates a bill payee payload for Bill Pay tests.
 */
export function generateBillPayee(fromAccountId: string): BillPayPayee {
  return {
    name: faker.company.name(),
    street: faker.location.streetAddress(),
    city: faker.location.city(),
    state: faker.location.state({ abbreviated: true }),
    zipCode: faker.location.zipCode('#####'),
    phone: faker.string.numeric(10),
    accountNumber: fromAccountId,
    verifyAccount: fromAccountId,
    amount: '100',
  };
}
