# Spec: Phase 3 money-obligations

## Objective
Turn bills, EMI/loan dues, and Udhaaro repayments into real Kharcha money movements. Users should see what is due, record payment against a wallet, and immediately see the corresponding transaction and wallet-balance effect.

## Tech stack
Expo SDK 57, React 19, React Native 0.86, expo-sqlite/kv-store, CommonJS pure-domain tests with Node's built-in test runner.

## Commands
- Test: `npm test`
- Focused domain test: `node --test test/phaseThree.test.js`
- Dev: `npx expo start`

## Project structure
- `src/domain/phaseThree.js` — planning/obligation pure logic
- `src/storage/expenseStore.js` — migration-safe local planning persistence
- `src/components/ObligationModal.js` — create obligation / record payment
- `src/components/PlanningTools.js` — obligation dashboard
- `test/phaseThree.test.js` — Phase 3 domain tests

## Behavior
1. Obligation kinds: Bill, EMI, Loan.
2. Due cadence: one-time or monthly.
3. Monthly obligations use a due day (1–31) and calculate the current due date with month-end clamping.
4. Recording a payment creates an expense transaction linked with `obligationPayment.obligationId`.
5. Obligation status derives paid, remaining, due/overdue state from linked transactions; it does not duplicate wallet arithmetic.
6. Recording an Udhaaro repayment requires a wallet and creates:
   - expense when repaying money the user borrowed;
   - income when receiving repayment for money the user lent.
   The transaction links to the Udhaaro record and repayment.
7. Payments can be partial. Overpayment is capped at the current amount due/outstanding.
8. No interest/amortization calculation is performed; Kharcha tracks user-entered EMI/loan dues rather than giving lending advice.

## Testing strategy
Pure unit tests cover due-date clamping, monthly/one-time obligation state, partial payment capping, linked transaction creation, and Udhaaro wallet direction.

## Boundaries
- Always: preserve canonical AD dates, validate positive money values, create wallet transactions for real money movements, keep data migration-safe.
- Ask first: adding cloud sync, lender APIs, bank/wallet credentials, automatic interest calculations.
- Never: invent loan terms, silently move money between wallets, or mutate existing Phase 1/2 records without normalization.

## Success criteria
- A bill/EMI/loan can be stored locally and shown as upcoming/due/overdue.
- Paying it creates a linked transaction that changes the selected wallet balance.
- Udhaaro partial repayment creates a correctly directed linked transaction and reduces outstanding exactly once.
- Existing transaction, Nepal, and settings stores remain compatible.
