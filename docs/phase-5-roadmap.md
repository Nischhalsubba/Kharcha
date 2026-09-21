# Kharcha Phase 5 — Missing-feature delivery roadmap

This file is the durable handoff for post-1.8 feature work. Each batch should be small, independently testable, merged to `main`, and reflected here so future ChatGPT sessions can resume without relying on chat history.

## Batch status

- [x] **5.1A — Wallet-to-wallet transfers** — local transfer records, two-wallet balance movement, activity/filter support, CSV round-trip safety.
- [ ] **5.1B — Smarter local insights** — month-over-month change, savings rate, month-end spending forecast, unusual-spend detection, recurring-transaction suggestions.
- [ ] **5.2 — Device reminders** — bills/EMI/Udhaaro/budget/savings reminders using Expo notifications with explicit permission controls.
- [ ] **5.3 — Merchant memory & auto-categorization** — user-confirmed merchant/category rules; no opaque model required.
- [ ] **5.4 — Receipt capture / OCR** — camera/image input, local-safe extraction workflow, user confirmation before saving.
- [ ] **5.5 — Salary management** — expected pay, received status, deductions/allowances, salary history.
- [ ] **5.6 — Assets & net worth** — assets, liabilities and net-worth history without live brokerage/bank integrations.
- [ ] **5.7 — Trip expense mode** — trip budgets, participants/splits and multi-currency records.
- [ ] **5.8 — Optional sync/sharing architecture** — encrypted account-backed multi-device/shared-household mode; remains opt-in and separate from local-first default.

## Delivery rules

1. Check current code before implementing so existing features are not duplicated.
2. Add failing behavioral tests before logic changes where feasible.
3. Keep native-module batches separate from pure-JavaScript batches.
4. Do not count wallet transfers as income or expense.
5. Preserve backup/CSV/PDF compatibility for every new transaction type or state field.
6. Merge only after domain tests, dependency audit, Expo config validation and Android JS bundle pass.
7. Update this file after every merge.
