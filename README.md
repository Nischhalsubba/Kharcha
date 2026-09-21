# Kharcha — Nepal-first Expo expense tracker

Kharcha is a local-first personal money tracker built with Expo / React Native, designed around everyday Nepali spending.

## Phase 2 — Nepal-first

- English and नेपाली interface preferences
- AD, Bikram Sambat (BS), or dual-date display
- BS-aware transaction, recurring, remittance and Udhaaro date entry while storing canonical AD dates
- Nepal-style NPR formatting such as `Rs 1,25,000`
- Optional lakh/crore display, including Nepali digits in नेपाली mode
- Nepal-focused expense and income categories such as Khaja, Groceries, Fuel, Rent, School Fees, EMI, Puja & Donation, Festival and Remittance
- Payment-method tracking for Cash, QR, Card and Bank Transfer
- Remittance income tracking with sender, country, original currency/amount, fees and destination wallet
- Udhaaro tracking for money borrowed/lent, due dates, outstanding balances and partial repayments
- Festival/event budgets for Dashain, Tihar, Teej, Chhath, Losar, weddings, travel, puja and custom events
- Link expenses directly to a festival/event budget
- Nepal money tools surfaced alongside the existing Insights experience
- All Phase 1 data remains compatible and local-first

## Phase 1 foundation

- Overview with monthly net, income, spending and budget progress
- Add, edit and delete expense or income transactions
- Search and filter transactions
- Multiple wallets/accounts including Cash, Bank, eSewa, Khalti and IME Pay
- Wallet opening balances and calculated balances
- Custom categories
- Overall and category-specific monthly budgets
- Weekly and monthly recurring transactions
- Persistent skip behavior for individual recurring occurrences
- Category spending breakdown and simple insights

## Stack

- Expo SDK 57
- React 19.2.3
- React Native 0.86.3
- expo-sqlite 57.0.3
- `@inicrea/bikram-sambat-core` 0.1.3 for BS conversion

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

- NPR is the default currency.
- Data stays on the device and is not sent to a backend.
- Existing older transactions remain readable and migrate safely to Phase 1/Phase 2 defaults.
- Canonical transaction dates remain AD `YYYY-MM-DD` internally so sorting and existing data stay stable.
- Phase 2 does not connect to live bank/wallet accounts or fetch live foreign-exchange rates.
- The current database is not app-level encrypted with SQLCipher; highly sensitive production use should add encrypted storage/key management.
