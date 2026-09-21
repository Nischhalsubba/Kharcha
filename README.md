# Kharcha — Nepal-first Expo expense tracker

Kharcha is a local-first personal money tracker built with Expo / React Native, designed around everyday Nepali spending.

## Phase 4.3 — Monthly PDF reports

- Generate a shareable PDF for any AD month
- Report period shows both AD and Bikram Sambat boundaries
- Summary includes income, expenses, net, transaction count and monthly budget
- Includes category spending, remittance, Udhaaro, bills/EMI, savings goals and household budgets
- Historical reports are bounded to that report date so later savings/Udhaaro activity does not rewrite the past
- User-entered text is HTML-escaped before rendering
- PDF is generated locally on-device with Expo Print and only leaves the app through the user-invoked share sheet

## Phase 4.2 — CSV / Excel-compatible export

- Export all transactions, the current month, or an inclusive custom AD date range
- UTF-8 BOM keeps Nepali text readable when the CSV is opened in Excel
- Every export includes both canonical AD and Bikram Sambat dates
- Includes wallet, payment method, event, household budget/member, remittance, Udhaaro, obligation, savings-goal and recurring-link fields
- User-controlled spreadsheet text is neutralized against formula injection
- Rows are ordered oldest to newest for easier spreadsheet analysis
- Export uses the Android/iOS system share sheet and does not upload data to a Kharcha server

## Phase 4.1 — Backup & restore

- Full portable `.kharcha.json` backup covering transactions, settings/wallets/categories/recurring rules, Nepal data, and Phase 3 planning data
- Versioned backup schema with deterministic corruption checksum
- Unknown future backup versions fail closed until a migration exists
- Backup imports are normalized through the existing Phase 1–3 compatibility layers before any restore
- Restore creates a persistent pre-restore recovery journal
- If a restore write fails, Kharcha attempts to roll back to the previous state
- If the app is interrupted during restore, the journal is recovered on the next launch before normal data loading
- Android/iOS export uses the system share sheet; import uses the system document picker
- Backup files remain local unless the user explicitly chooses a destination
- Backup files are not encrypted yet and should be stored somewhere trusted

## Phase 3 — Financial planning

- Bills, EMI and loan plans with one-time or monthly due schedules
- Monthly dues carry unpaid cycles forward instead of resetting at the month boundary
- Partial payments allocate to the oldest unpaid monthly cycle first
- Obligation payments create normal wallet transactions, so balances and activity stay consistent
- Udhaaro repayments now move the selected wallet and reconcile automatically with debt records on startup
- Savings goals with target amounts, optional target dates, deposits and withdrawals
- Savings movements change wallet balances but are excluded from income/spending analytics
- Household budgets with monthly limits and optional member attribution on expenses
- Planning snapshot for outstanding obligations, overdue count, savings progress, household spend and nearest due date
- Phase 3 planning data remains local-first in a migration-safe on-device store
- Pull-request CI runs the full test suite, validates Expo configuration and bundles Android JavaScript before merge

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

Install dependencies once:

```bash
npm install
```

For Expo Go (the default and the correct QR to scan with the Expo Go app):

```bash
npm start
```

If the phone cannot reach the local development server over LAN, use the tunnel command:

```bash
npm run start:go:tunnel
```

For a custom Kharcha development client instead of Expo Go:

```bash
npm run start:dev
```

Do not scan a development-client QR with Expo Go. The two launch targets use different deep links.

## Test

```bash
npm test
```

## Data and privacy

- NPR is the default currency.
- Data stays on the device and is not sent to a backend.
- Existing older transactions remain readable and migrate safely through Phase 1, Phase 2 and Phase 3 defaults.
- Canonical transaction dates remain AD `YYYY-MM-DD` internally so sorting and existing data stay stable.
- Kharcha does not connect to live bank/wallet/lender accounts or fetch live foreign-exchange rates in Phase 3.
- The current database is not app-level encrypted with SQLCipher; highly sensitive production use should add encrypted storage/key management.
