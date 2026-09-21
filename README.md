# Kharcha — Expo expense tracker

A focused personal expense tracker built for Expo / React Native.

## What is included

- Overview with current balance, total income, total spending and monthly budget progress
- Add expense or income with category, note and date
- Persistent on-device storage using `expo-sqlite/kv-store`
- Full transaction history with deletion
- Editable monthly budget
- Category spending breakdown
- Simple spending insights (top category and daily average)
- Dark, mobile-first UI with accessible contrast and large tap targets
- Pure finance-domain tests using Node's built-in test runner

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

## Notes

- Currency defaults to NPR.
- Data stays on the device in v1 and is not sent to a backend.
- The v1 database is not app-level encrypted with SQLCipher; production use with highly sensitive data should add encrypted storage/key management.
- The persistence layer is isolated in `src/storage/expenseStore.js`, so cloud sync/auth can be added later without changing the finance-domain logic.
