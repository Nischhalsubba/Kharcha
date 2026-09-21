# Kharcha — Nepal-first Expo expense tracker

Kharcha is a local-first personal money tracker built with Expo / React Native, designed around everyday Nepali spending.

## Phase 1 features

- Overview with monthly net, income, spending and budget progress
- Add, edit and delete expense or income transactions
- Search transactions by note, category, amount and date
- Filter activity by type, wallet, category and current month
- Multiple wallets/accounts, including Cash, Bank, eSewa, Khalti, IME Pay and custom wallets
- Wallet opening balances and calculated current balances
- Custom expense and income categories
- Overall monthly budget plus category-specific monthly budgets
- Weekly and monthly recurring transactions for items such as rent, salary and bills
- Category spending breakdown and simple insights
- Migration-safe on-device persistence using `expo-sqlite/kv-store`
- Dark, mobile-first UI with accessible labels and large tap targets
- Finance and Phase 1 domain tests using Node's built-in test runner

## Stack

- Expo SDK 57
- React 19.2.3
- React Native 0.86
- expo-sqlite 57.0.3

## Run locally

```bash
npm install
npx expo start
```

Then open in Expo Go or a development build.

## Test

```bash
npm test
```

## Data and privacy

- Currency defaults to NPR.
- Data stays on the device and is not sent to a backend.
- Existing pre-Phase-1 transactions are migrated to the Cash wallet automatically.
- The current database is not app-level encrypted with SQLCipher; highly sensitive production use should add encrypted storage/key management.
- Persistence is isolated in `src/storage/expenseStore.js`, so optional cloud sync/auth can be added later without replacing the finance-domain logic.
