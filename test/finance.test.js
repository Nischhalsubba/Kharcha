const test = require('node:test');
const assert = require('node:assert/strict');
const {
  summarizeTransactions,
  categoryBreakdown,
  monthlyBudgetStatus,
  normalizeAmount,
  isValidIsoDate,
  dailyAverage,
} = require('../src/domain/finance');

const tx = [
  { id: '1', type: 'income', amount: 100000, category: 'Salary', date: '2026-09-01' },
  { id: '2', type: 'expense', amount: 12500, category: 'Food', date: '2026-09-02' },
  { id: '3', type: 'expense', amount: 3500, category: 'Transport', date: '2026-09-03' },
  { id: '4', type: 'expense', amount: 2000, category: 'Food', date: '2026-08-30' },
];

test('summarizeTransactions returns balance, income and expense totals for a month', () => {
  const result = summarizeTransactions(tx, '2026-09');
  assert.deepEqual(result, {
    income: 100000,
    expense: 16000,
    balance: 84000,
    monthExpense: 16000,
  });
});

test('categoryBreakdown only includes expenses in the selected month', () => {
  const result = categoryBreakdown(tx, '2026-09');
  assert.deepEqual(result, [
    { category: 'Food', amount: 12500 },
    { category: 'Transport', amount: 3500 },
  ]);
});

test('monthlyBudgetStatus calculates remaining budget without going below zero', () => {
  const result = monthlyBudgetStatus(tx, '2026-09', 15000);
  assert.deepEqual(result, {
    limit: 15000,
    spent: 16000,
    remaining: 0,
    progress: 1,
    overBy: 1000,
  });
});

test('normalizeAmount converts valid user input and rejects invalid values', () => {
  assert.equal(normalizeAmount(' 1,250.50 '), 1250.5);
  assert.equal(normalizeAmount('0'), null);
  assert.equal(normalizeAmount('-50'), null);
  assert.equal(normalizeAmount('abc'), null);
});

test('isValidIsoDate rejects impossible calendar dates', () => {
  assert.equal(isValidIsoDate('2026-09-21'), true);
  assert.equal(isValidIsoDate('2026-02-29'), false);
  assert.equal(isValidIsoDate('2024-02-29'), true);
  assert.equal(isValidIsoDate('2026-99-99'), false);
});

test('dailyAverage uses elapsed days for the active month', () => {
  assert.equal(dailyAverage(tx, '2026-09', '2026-09-04'), 4000);
});
