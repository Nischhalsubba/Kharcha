# Kharcha Phase 3 — Financial planning capability map

## Assumptions
- Kharcha stays local-first and offline by default.
- Phase 3 does not connect to banks, lenders, or live credit systems.
- Existing Phase 1 and Phase 2 data remains readable without manual migration.
- Money movements recorded by planning tools must appear in normal wallet balances and transaction history.

| Module id | Responsibility | Depends on |
| --- | --- | --- |
| money-obligations | Bills, EMI/loan tracking, due-state logic, wallet-linked payments, and wallet-linked Udhaaro repayments | Phase 1 wallets/transactions, Phase 2 Udhaaro |
| savings-goals | Goal targets, contributions, progress, target dates, and wallet-linked deposits/withdrawals | Phase 1 wallets/transactions |
| household-budgeting | Shared household envelope/member budgeting without cloud accounts | Phase 1 budgets/transactions |
| planning-analytics | Upcoming obligations, savings progress, household burn rate, cash-flow outlook | money-obligations, savings-goals, household-budgeting |

Build order: money-obligations → savings-goals + household-budgeting → planning-analytics.
