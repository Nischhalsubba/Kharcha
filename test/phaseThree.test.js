const test = require('node:test');
const assert = require('node:assert/strict');
const {
  normalizePlanningData,
  dueDateForMonth,
  obligationStatus,
  createObligationPaymentTransaction,
  recordUdhaaroPayment,
  reverseUdhaaroPayment,
} = require('../src/domain/phaseThree');

test('normalizePlanningData supplies migration-safe Phase 3 collections', () => {
  assert.deepEqual(normalizePlanningData(), {
    obligations: [],
    savingsGoals: [],
    householdBudgets: [],
  });
});

test('dueDateForMonth clamps due day to the last valid day', () => {
  assert.equal(dueDateForMonth('2026-02', 31), '2026-02-28');
  assert.equal(dueDateForMonth('2028-02', 31), '2028-02-29');
  assert.equal(dueDateForMonth('2026-09', 15), '2026-09-15');
});

test('monthly obligation status derives current-cycle payment and overdue state', () => {
  const obligation = { id: 'emi-1', kind: 'emi', name: 'Bike EMI', amount: 12000, frequency: 'monthly', dueDay: 10, active: true };
  const tx = [
    { id: 'p1', type: 'expense', amount: 4000, date: '2026-09-05', obligationPayment: { obligationId: 'emi-1', cycleKey: '2026-09' } },
    { id: 'old', type: 'expense', amount: 12000, date: '2026-08-10', obligationPayment: { obligationId: 'emi-1', cycleKey: '2026-08' } },
  ];
  assert.deepEqual(obligationStatus(obligation, tx, '2026-09-12'), {
    id: 'emi-1',
    cycleKey: '2026-09',
    dueDate: '2026-09-10',
    amountDue: 12000,
    paid: 4000,
    remaining: 8000,
    state: 'overdue',
  });
});

test('one-time obligation becomes paid when linked payments cover the due amount', () => {
  const obligation = { id: 'bill-1', kind: 'bill', name: 'Insurance', amount: 5000, frequency: 'once', dueDate: '2026-09-25', active: true };
  const tx = [
    { type: 'expense', amount: 2000, date: '2026-09-20', obligationPayment: { obligationId: 'bill-1', cycleKey: 'once' } },
    { type: 'expense', amount: 3000, date: '2026-09-21', obligationPayment: { obligationId: 'bill-1', cycleKey: 'once' } },
  ];
  assert.equal(obligationStatus(obligation, tx, '2026-09-21').state, 'paid');
  assert.equal(obligationStatus(obligation, tx, '2026-09-21').remaining, 0);
});

test('obligation payment transaction caps partial payment at current remaining due', () => {
  const obligation = { id: 'bill-1', kind: 'bill', name: 'Internet', amount: 1800, frequency: 'monthly', dueDay: 20, active: true, category: 'Internet' };
  const tx = [{ type: 'expense', amount: 1000, date: '2026-09-10', obligationPayment: { obligationId: 'bill-1', cycleKey: '2026-09' } }];
  const payment = createObligationPaymentTransaction(obligation, tx, 2000, '2026-09-15', 'esewa', { id: 'pay-2', createdAt: '2026-09-15T01:00:00.000Z' });
  assert.equal(payment.amount, 800);
  assert.equal(payment.walletId, 'esewa');
  assert.equal(payment.type, 'expense');
  assert.deepEqual(payment.obligationPayment, { obligationId: 'bill-1', cycleKey: '2026-09' });
});

test('recordUdhaaroPayment creates expense when repaying borrowed money and can reverse by transaction id', () => {
  const record = { id: 'u1', direction: 'borrowed', person: 'Sita', amount: 5000, repayments: [{ amount: 1000, date: '2026-09-01', transactionId: 'old' }], status: 'active' };
  const result = recordUdhaaroPayment(record, 5000, '2026-09-21', 'cash', { transactionId: 'udharo-pay-1', createdAt: '2026-09-21T02:00:00.000Z' });
  assert.equal(result.transaction.amount, 4000);
  assert.equal(result.transaction.type, 'expense');
  assert.equal(result.transaction.walletId, 'cash');
  assert.equal(result.record.status, 'settled');
  assert.equal(result.record.repayments.at(-1).transactionId, 'udharo-pay-1');

  const reversed = reverseUdhaaroPayment(result.record, 'udharo-pay-1');
  assert.equal(reversed.status, 'active');
  assert.equal(reversed.repayments.length, 1);
});

test('recordUdhaaroPayment creates income when receiving repayment for lent money', () => {
  const record = { id: 'u2', direction: 'lent', person: 'Ram', amount: 3000, repayments: [], status: 'active' };
  const result = recordUdhaaroPayment(record, 1200, '2026-09-21', 'bank', { transactionId: 'udharo-in-1', createdAt: '2026-09-21T03:00:00.000Z' });
  assert.equal(result.transaction.type, 'income');
  assert.equal(result.transaction.amount, 1200);
  assert.equal(result.transaction.category, 'Udhaaro Repayment');
  assert.deepEqual(result.transaction.udharoPayment, { recordId: 'u2' });
});

test('savingsGoalStatus derives saved amount from linked deposits and withdrawals', () => {
  const { savingsGoalStatus } = require('../src/domain/phaseThree');
  const goal = { id: 'g1', name: 'Emergency fund', targetAmount: 10000 };
  const tx = [
    { type: 'expense', amount: 3000, savingsGoalMovement: { goalId: 'g1', direction: 'deposit' } },
    { type: 'income', amount: 500, savingsGoalMovement: { goalId: 'g1', direction: 'withdrawal' } },
  ];
  assert.deepEqual(savingsGoalStatus(goal, tx), {
    id: 'g1', targetAmount: 10000, saved: 2500, remaining: 7500, progress: 0.25,
  });
});

test('createSavingsGoalTransaction caps deposits at remaining target and withdrawals at saved amount', () => {
  const { createSavingsGoalTransaction } = require('../src/domain/phaseThree');
  const goal = { id: 'g1', name: 'Emergency fund', targetAmount: 10000 };
  const tx = [{ type: 'expense', amount: 9000, savingsGoalMovement: { goalId: 'g1', direction: 'deposit' } }];
  const deposit = createSavingsGoalTransaction(goal, tx, 5000, '2026-09-21', 'bank', 'deposit', { id: 'save-1', createdAt: '2026-09-21T04:00:00.000Z' });
  assert.equal(deposit.amount, 1000);
  assert.equal(deposit.type, 'expense');
  const withdrawal = createSavingsGoalTransaction(goal, [...tx, deposit], 20000, '2026-09-22', 'bank', 'withdrawal', { id: 'save-2', createdAt: '2026-09-22T04:00:00.000Z' });
  assert.equal(withdrawal.amount, 10000);
  assert.equal(withdrawal.type, 'income');
  assert.deepEqual(withdrawal.savingsGoalMovement, { goalId: 'g1', direction: 'withdrawal' });
});
