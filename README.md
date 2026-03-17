# ParaBank Playwright Test Automation Framework

End-to-end test automation for the [ParaBank](https://parabank.parasoft.com/parabank) application, built with **Playwright + TypeScript** following industry best practices.

---

## Tech Stack

| Concern       | Tool                                    |
| ------------- | --------------------------------------- |
| E2E Framework | [Playwright](https://playwright.dev/)   |
| Language      | TypeScript (strict mode)                |
| Test Data     | [@faker-js/faker](https://fakerjs.dev/) |
| Linting       | ESLint + `eslint-plugin-playwright`     |
| Formatting    | Prettier                                |
| Commit Hooks  | Husky + lint-staged                     |
| CI/CD         | GitHub Actions                          |
| Reporting     | Playwright HTML + JSON                  |

---

## Project Structure

```
parabank-playwright/
│
├── .github/
│   └── workflows/
│       └── playwright.yml         # CI pipeline (lint → test → email report)
│
├── .husky/
│   ├── pre-commit                 # Runs lint-staged (ESLint + Prettier) before commit
│   └── commit-msg                 # Enforces Conventional Commits format
│
├── fixtures/
│   └── index.ts                   # Playwright fixture extensions (POM + pre-condition fixtures)
│
├── helpers/
│   ├── api-client.ts              # Typed REST API client for ParaBank APIs
│   └── data-factory.ts            # Faker-powered test data generators
│
├── pages/                         # Page Object Model layer
│   ├── BasePage.ts                # Base class: shared navigation locators
│   ├── LoginPage.ts
│   ├── RegistrationPage.ts
│   ├── HomePage.ts
│   ├── AccountsOverviewPage.ts
│   ├── OpenNewAccountPage.ts
│   ├── TransferFundsPage.ts
│   └── BillPayPage.ts
│
├── tests/
│   ├── ui/
│   │   └── parabank-e2e.spec.ts   # UI test scenarios (Steps 1–8 + full E2E flow)
│   └── api/
│       └── transactions.spec.ts   # API test scenarios (Find Transactions + schema validation)
│
├── types/
│   └── index.ts                   # Shared TypeScript interfaces (UserData, Transaction, etc.)
│
├── playwright.config.ts           # Playwright configuration (UI + API projects)
├── tsconfig.json
├── eslint.config.mjs
├── .prettierrc.json
├── .gitignore
└── package.json
```

---

## Getting Started

### Prerequisites

- Node.js 20+
- npm 9+

### Installation

```bash
npm install
npx playwright install chromium --with-deps
```

### Running Tests

```bash
# All tests (UI + API)
npm test

# UI tests only
npm run test:ui

# API tests only
npm run test:api

# Smoke tests only
npm run test:smoke

# Headed mode (watch the browser)
npm run test:headed

# View the HTML report
npm run report
```

### Linting & Formatting

```bash
# Lint
npm run lint

# Auto-fix lint issues
npm run lint:fix

# Format all files
npm run format

# Check formatting (CI mode)
npm run format:check
```

---

## Design Decisions

### Page Object Model (POM)

Every page has a dedicated class in `pages/`. All locators and interactions are encapsulated there — no raw selectors appear in test files. Tests read as plain English actions.

### Fixture-Based Pre-conditions

Rather than repeating setup code in every test, Playwright fixtures in `fixtures/index.ts` handle:

- `registeredUser` — creates a fresh unique user
- `authenticatedPage` — creates and logs in a user
- `newSavingsAccountId` — opens a Savings account; yields its ID
- `billPayResult` — pays a bill; yields payee + amount for API assertion

Each fixture is composable — `billPayResult` builds on `newSavingsAccountId`, which builds on `authenticatedPage`.

### Unique Test Data

Every test run generates entirely unique user credentials via Faker. This prevents cross-run contamination on the shared ParaBank instance.

### Lint-Staged Commit Protection

The pre-commit hook runs `lint-staged`, which enforces ESLint (including `playwright/no-focused-test` to block `.only`) and Prettier on every staged `.ts` file. A commit with linting errors or an unfixed `.only` will be **rejected**.

### Conventional Commits

The `commit-msg` hook rejects any commit message that doesn't match the Conventional Commits pattern (`type(scope): description`).

---

## CI/CD Pipeline

Triggered on **every push to every branch** and on PRs to `main`/`develop`.

```
Push → Lint & Format Check → Run UI + API Tests → Upload Artifacts → Send Email Report
```

The email report includes:

- Total / Passed / Failed / Skipped / Flaky counts
- Links to screenshots, traces, and videos as GitHub Actions artifacts
- Flaky test summary (tests that passed only after a retry)

### Required GitHub Secrets

| Secret           | Description                                   |
| ---------------- | --------------------------------------------- |
| `MAIL_USERNAME`  | Gmail address to send reports from            |
| `MAIL_PASSWORD`  | Gmail App Password (not the account password) |
| `MAIL_RECIPIENT` | Email address to receive reports              |

---

## Test Tags

| Tag           | When to run                               |
| ------------- | ----------------------------------------- |
| `@smoke`      | Every PR — critical path, fast (~3 tests) |
| `@regression` | On merge to main — full suite             |
| `@ui`         | UI tests only                             |
| `@api`        | API tests only                            |

```bash
npx playwright test --grep @smoke
npx playwright test --grep @api
```
