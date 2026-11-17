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


test('summarizeTransactions excludes wallet transfers from income and spending', () => {
  const withTransfer = [...tx, {
    id: '5',
    type: 'transfer',
    amount: 25000,
    category: 'Transfer',
    date: '2026-09-04',
    walletId: 'cash',
    fromWalletId: 'cash',
    toWalletId: 'bank',
  }];
  assert.deepEqual(summarizeTransactions(withTransfer, '2026-09'), {
    income: 100000,
    expense: 16000,
    balance: 84000,
    monthExpense: 16000,
  });
});

test('normalizeAmount rejects positive inputs that round to zero currency units', () => {
  assert.equal(normalizeAmount('0.001'), null);
  assert.equal(normalizeAmount('0.004'), null);
  assert.equal(normalizeAmount('0.005'), 0.01);
  assert.equal(normalizeAmount('0.01'), 0.01);
});

test('totals ignore malformed, negative and non-finite imported amounts', () => {
  const corrupt = [
    ...tx,
    { id: 'x1', type: 'income', amount: Infinity, date: '2026-09-05' },
    { id: 'x2', type: 'expense', amount: -250, category: 'Food', date: '2026-09-06' },
    { id: 'x3', type: 'expense', amount: '1e309', category: 'Food', date: '2026-09-07' },
    { id: 'x4', type: 'expense', amount: NaN, category: 'Food', date: '2026-09-08' },
  ];
  assert.deepEqual(summarizeTransactions(corrupt, '2026-09'), summarizeTransactions(tx, '2026-09'));
  assert.deepEqual(categoryBreakdown(corrupt, '2026-09'), categoryBreakdown(tx, '2026-09'));
});

test('monthly totals exclude imported transactions with impossible dates', () => {
  const invalid = { id: 'bad-date', type: 'expense', amount: 50000, category: 'Food', date: '2026-09-99' };
  assert.deepEqual(summarizeTransactions([...tx, invalid], '2026-09'), summarizeTransactions(tx, '2026-09'));
  assert.deepEqual(categoryBreakdown([...tx, invalid], '2026-09'), categoryBreakdown(tx, '2026-09'));
});
