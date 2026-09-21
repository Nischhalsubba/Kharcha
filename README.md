# Kharcha — Nepal-first Expo expense tracker

Kharcha is a local-first personal money tracker built with Expo / React Native, designed around everyday Nepali spending.

## Phase 5.1 — Wallet-to-wallet transfers

- Move money between Kharcha wallets without creating fake income or spending
- One transfer record updates both source and destination wallet balances
- Transfers are searchable/filterable from either participating wallet
- Transfers stay out of income, expense, budget and category analytics
- Transfer links are preserved in CSV export/import and portable backups
- Transfers remain local-first; no bank or wallet account is contacted

## Visual refresh — finance-first light UI

- Light neutral canvas with white functional surfaces
- Stronger balance and money hierarchy
- Accessible Kharcha emerald for actions and selected states
- Softer elevation, thinner separators and tighter card rhythm
- Cleaner bottom navigation and circular add action
- All existing sheets/modals use the same light design language
- Overview hierarchy prioritizes month net, budget, wallets and recent activity
- Visual redesign only: no finance logic, storage model, Nepal-first behavior or feature scope changed

## Phase 4.5 — Local app security

- Optional 4–6 digit Kharcha PIN lock
- PIN plaintext is never stored; a salted SHA-256 digest record is kept in Expo SecureStore
- SecureStore entries use device-only keychain accessibility where supported
- Optional enrolled fingerprint / Face ID unlock with PIN fallback
- Android biometric prompts require strong biometrics for Kharcha unlock
- Auto-lock choices: immediately, 30 seconds, 1 minute, or 5 minutes after backgrounding
- Five failed PIN attempts trigger a 30-second cooldown; ten trigger 60 seconds
- Financial screens are not rendered while the app is locked
- App-lock credentials are device-local and are not included in Kharcha backup/CSV/PDF exports
- iOS Face ID requires a development/native build for testing; Expo Go does not support Face ID authentication
- App lock protects access to Kharcha, but does not provide full SQLCipher encryption of the transaction database

## Phase 4.2–4.4 — Export, reports & safe data management

- Excel-compatible CSV export for all transactions, current month, or custom AD date range
- CSV includes AD + BS dates, transaction IDs, wallets, events, household, remittance, Udhaaro, obligations, savings and recurring links
- Spreadsheet formula-injection protection for user-controlled text
- Monthly PDF financial reports generated locally on-device
- PDF summary includes income, expenses, budget, remittance, Udhaaro, bills/EMI, savings, households and transaction detail
- Kharcha CSV import previews duplicates, invalid rows and warnings before import
- CSV import preserves stable transaction IDs and reconnects known wallet/planning links
- Clear-month flow prevents deleted recurring occurrences from regenerating and reconciles linked Udhaaro
- Destructive changes create a persistent safety snapshot first
- Full reset requires typed DELETE confirmation and remains recoverable through the last safety snapshot
- Export/import/report files remain local unless the user explicitly shares or selects them

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
