const test = require('node:test');
const assert = require('node:assert/strict');
const {
  previousMonthKey,
  monthComparison,
  savingsRate,
  projectedMonthExpense,
  detectUnusualSpending,
  recurringTransactionSuggestions,
} = require('../src/domain/insights');

const history = [
  { id:'jun-food', type:'expense', amount:4000, category:'Food', note:'Groceries', date:'2026-06-10', walletId:'cash' },
  { id:'jul-food', type:'expense', amount:4000, category:'Food', note:'Groceries', date:'2026-07-10', walletId:'cash' },
  { id:'aug-food', type:'expense', amount:4000, category:'Food', note:'Groceries', date:'2026-08-10', walletId:'cash' },
  { id:'aug-transport', type:'expense', amount:2000, category:'Transport', note:'Pathao', date:'2026-08-12', walletId:'esewa' },
  { id:'sep-salary', type:'income', amount:100000, category:'Salary', note:'Salary', date:'2026-09-01', walletId:'bank' },
  { id:'sep-food', type:'expense', amount:12000, category:'Food', note:'Groceries', date:'2026-09-08', walletId:'cash' },
  { id:'sep-transport', type:'expense', amount:3000, category:'Transport', note:'Pathao', date:'2026-09-10', walletId:'esewa' },
  { id:'sep-transfer', type:'transfer', amount:20000, category:'Transfer', note:'Cash to bank', date:'2026-09-11', walletId:'cash', fromWalletId:'cash', toWalletId:'bank' },
];

test('previousMonthKey crosses year boundaries safely', () => {
  assert.equal(previousMonthKey('2026-09'), '2026-08');
  assert.equal(previousMonthKey('2026-01'), '2025-12');
  assert.equal(previousMonthKey('bad'), null);
});

test('monthComparison compares expense totals without counting transfers', () => {
  const result = monthComparison(history, '2026-09');
  assert.deepEqual(result, {
    currentMonth: '2026-09',
    previousMonth: '2026-08',
    currentExpense: 15000,
    previousExpense: 6000,
    change: 9000,
    changeRate: 1.5,
  });
});

test('savingsRate reports retained income after real expenses only', () => {
  const result = savingsRate(history, '2026-09');
  assert.deepEqual(result, {
    income: 100000,
    expense: 15000,
    saved: 85000,
    rate: 0.85,
  });
});

test('projectedMonthExpense estimates month-end spend from elapsed days', () => {
  const result = projectedMonthExpense(history, '2026-09', '2026-09-15');
  assert.deepEqual(result, {
    spentToDate: 15000,
    elapsedDays: 15,
    daysInMonth: 30,
    projectedExpense: 30000,
  });
});

test('projectedMonthExpense ignores transactions after the as-of date', () => {
  const transactions = [...history, {
    id:'future', type:'expense', amount:50000, category:'Shopping', note:'Future', date:'2026-09-20', walletId:'cash',
  }];
  assert.equal(projectedMonthExpense(transactions, '2026-09', '2026-09-15').spentToDate, 15000);
});

test('detectUnusualSpending flags categories far above their recent full-month baseline', () => {
  const result = detectUnusualSpending(history, '2026-09', { lookbackMonths: 3, minRatio: 1.5, minExcess: 500 });
  assert.equal(result.length, 1);
  assert.deepEqual(result[0], {
    category: 'Food',
    currentAmount: 12000,
    historicalAverage: 4000,
    ratio: 3,
    excess: 8000,
  });
});

test('recurringTransactionSuggestions detects monthly manual patterns and proposes the next occurrence', () => {
  const transactions = [
    { id:'r1', type:'expense', amount:15000, category:'Rent', note:'House rent', date:'2026-06-15', walletId:'bank' },
    { id:'r2', type:'expense', amount:15000, category:'Rent', note:'House rent', date:'2026-07-15', walletId:'bank' },
    { id:'r3', type:'expense', amount:15000, category:'Rent', note:'House rent', date:'2026-08-15', walletId:'bank' },
  ];
  const result = recurringTransactionSuggestions(transactions, []);
  assert.equal(result.length, 1);
  assert.deepEqual(result[0], {
    key: 'expense|rent|house rent|bank|15000',
    type: 'expense',
    amount: 15000,
    category: 'Rent',
    note: 'House rent',
    walletId: 'bank',
    frequency: 'monthly',
    occurrences: 3,
    lastDate: '2026-08-15',
    nextDate: '2026-09-15',
  });
});

test('recurringTransactionSuggestions detects weekly patterns', () => {
  const transactions = [
    { id:'w1', type:'expense', amount:500, category:'Khaja', note:'Office lunch', date:'2026-09-01', walletId:'cash' },
    { id:'w2', type:'expense', amount:500, category:'Khaja', note:'Office lunch', date:'2026-09-08', walletId:'cash' },
    { id:'w3', type:'expense', amount:500, category:'Khaja', note:'Office lunch', date:'2026-09-15', walletId:'cash' },
  ];
  const result = recurringTransactionSuggestions(transactions, []);
  assert.equal(result[0].frequency, 'weekly');
  assert.equal(result[0].nextDate, '2026-09-22');
});

test('recurringTransactionSuggestions excludes patterns already covered by a recurring rule', () => {
  const transactions = [
    { id:'r1', type:'expense', amount:15000, category:'Rent', note:'House rent', date:'2026-06-15', walletId:'bank' },
    { id:'r2', type:'expense', amount:15000, category:'Rent', note:'House rent', date:'2026-07-15', walletId:'bank' },
    { id:'r3', type:'expense', amount:15000, category:'Rent', note:'House rent', date:'2026-08-15', walletId:'bank' },
  ];
  const rules = [{ id:'rent', type:'expense', amount:15000, category:'Rent', note:'House rent', walletId:'bank', frequency:'monthly', active:true }];
  assert.deepEqual(recurringTransactionSuggestions(transactions, rules), []);
});

test('recurringTransactionSuggestions ignores transfers and linked planning movements', () => {
  const transactions = [
    { id:'t1', type:'transfer', amount:5000, category:'Transfer', note:'Top up', date:'2026-09-01', walletId:'cash', fromWalletId:'cash', toWalletId:'esewa' },
    { id:'t2', type:'transfer', amount:5000, category:'Transfer', note:'Top up', date:'2026-09-08', walletId:'cash', fromWalletId:'cash', toWalletId:'esewa' },
    { id:'t3', type:'transfer', amount:5000, category:'Transfer', note:'Top up', date:'2026-09-15', walletId:'cash', fromWalletId:'cash', toWalletId:'esewa' },
    { id:'s1', type:'expense', amount:1000, category:'Savings Goal', note:'Save', date:'2026-06-01', walletId:'cash', savingsGoalMovement:{goalId:'g1',direction:'deposit'} },
    { id:'s2', type:'expense', amount:1000, category:'Savings Goal', note:'Save', date:'2026-07-01', walletId:'cash', savingsGoalMovement:{goalId:'g1',direction:'deposit'} },
    { id:'s3', type:'expense', amount:1000, category:'Savings Goal', note:'Save', date:'2026-08-01', walletId:'cash', savingsGoalMovement:{goalId:'g1',direction:'deposit'} },
  ];
  assert.deepEqual(recurringTransactionSuggestions(transactions, []), []);
});
