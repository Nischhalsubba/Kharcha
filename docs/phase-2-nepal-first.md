# Kharcha Phase 2 — Nepal-first specification

## Objective
Make Kharcha feel purpose-built for everyday Nepali money habits while preserving Phase 1 local data and workflows.

## Capability map

| Module | Responsibility | Depends on |
| --- | --- | --- |
| localization-calendar | English/Nepali UI preferences, NPR formatting, AD/BS conversion and display | Phase 1 settings |
| nepal-money-models | Remittance metadata, Udhaaro records, festival/event budgets | Phase 1 transactions, localization-calendar |
| nepal-money-ui | Forms, summaries and transaction/event linking for Nepal-first features | localization-calendar, nepal-money-models |

Build order: localization-calendar → nepal-money-models → nepal-money-ui.

## Phase 2 scope
- English / नेपाली preference stored locally.
- AD, BS or dual-date display; BS input converts to canonical AD transaction dates.
- NPR display uses Nepali/Indian grouping and optional lakh/crore compact mode.
- Nepal-first default categories and wallet/payment terminology.
- Remittance income entry with sender, origin country, foreign currency/amount, fees and destination wallet.
- Udhaaro tracking for borrowed/lent money with due date, partial repayments and outstanding balance.
- Festival/event budgets with Nepal-oriented presets and linked expense progress.
- Existing Phase 1 transactions/settings remain readable without manual migration.

## Technical boundaries
- Keep canonical transaction dates in AD `YYYY-MM-DD` for storage and sorting.
- Use `@inicrea/bikram-sambat-core` 0.1.3 for BS conversion; do not maintain a hand-written BS calendar table in Kharcha.
- No live FX rates, bank scraping, wallet credentials or automatic payment-provider access in Phase 2.
- No mandatory account/backend; all Phase 2 data remains on-device.

## Verification
- Existing Phase 1 test suite remains green.
- New pure-domain tests cover NPR formatting, date preference behavior, Udhaaro repayments, remittance summaries and event budgets.
- JavaScript/JSX parses successfully.
- No credentials or secrets added.
