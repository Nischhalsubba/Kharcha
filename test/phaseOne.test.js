const test = require('node:test');
const assert = require('node:assert/strict');
const {
  normalizeSettings,
  normalizeTransactions,
  filterTransactions,
  walletBalances,
  categoryBudgetStatus,
  materializeRecurringTransactions,
  nextRecurringDate,
} = require('../src/domain/phaseOne');

const wallets = [
  { id: 'cash', name: 'Cash', openingBalance: 1000 },
  { id: 'esewa', name: 'eSewa', openingBalance: 500 },
];

const transactions = [
  { id: '1', type: 'income', amount: 10000, category: 'Salary', note: 'September salary', date: '2026-09-01', walletId: 'cash' },
  { id: '2', type: 'expense', amount: 1200, category: 'Food', note: 'Khaja', date: '2026-09-02', walletId: 'cash' },
  { id: '3', type: 'expense', amount: 800, category: 'Transport', note: 'Pathao', date: '2026-09-03', walletId: 'esewa' },
  { id: '4', type: 'expense', amount: 3000, category: 'Food', note: 'Dinner', date: '2026-08-30', walletId: 'cash' },
];

test('normalizeSettings migrates old settings to Phase 1 defaults', () => {
  const settings = normalizeSettings({ currency: 'NPR', monthlyBudget: 42000 });
  assert.equal(settings.currency, 'NPR');
  assert.equal(settings.monthlyBudget, 42000);
  assert.ok(settings.wallets.some((wallet) => wallet.id === 'cash'));
  assert.deepEqual(settings.customCategories, { expense: [], income: [] });
  assert.deepEqual(settings.categoryBudgets, {});
  assert.deepEqual(settings.recurringTransactions, []);
});

test('normalizeTransactions migrates existing transactions to Cash wallet', () => {
  const result = normalizeTransactions([{ id: 'legacy', type: 'expense', amount: 50, category: 'Food', date: '2026-09-01' }]);
  assert.equal(result[0].walletId, 'cash');
});

test('filterTransactions supports text, type, wallet, category and current-month filters', () => {
  assert.deepEqual(
    filterTransactions(transactions, { query: 'pathao' }).map((item) => item.id),
    ['3'],
  );
  assert.deepEqual(
    filterTransactions(transactions, { type: 'expense', walletId: 'cash', category: 'Food', monthKey: '2026-09' }).map((item) => item.id),
    ['2'],
  );
  assert.deepEqual(
    filterTransactions(transactions, { query: '1200' }).map((item) => item.id),
    ['2'],
  );
});

test('walletBalances includes opening balance plus income minus expenses', () => {
  const result = walletBalances(transactions, wallets);
  assert.deepEqual(result, [
    { id: 'cash', name: 'Cash', openingBalance: 1000, balance: 6800 },
    { id: 'esewa', name: 'eSewa', openingBalance: 500, balance: -300 },
  ]);
});

test('categoryBudgetStatus calculates each configured category independently', () => {
  const result = categoryBudgetStatus(transactions, '2026-09', { Food: 2000, Transport: 500 });
  assert.deepEqual(result, [
    { category: 'Food', limit: 2000, spent: 1200, remaining: 800, progress: 0.6, overBy: 0 },
    { category: 'Transport', limit: 500, spent: 800, remaining: 0, progress: 1, overBy: 300 },
  ]);
});

test('materializeRecurringTransactions creates missing weekly and monthly occurrences once', () => {
  const recurring = [
    { id: 'rent', type: 'expense', amount: 15000, category: 'Home', note: 'Rent', walletId: 'cash', frequency: 'monthly', startDate: '2026-08-31', active: true },
    { id: 'allowance', type: 'income', amount: 1000, category: 'Other', note: 'Allowance', walletId: 'esewa', frequency: 'weekly', startDate: '2026-09-01', active: true },
  ];
  const first = materializeRecurringTransactions([], recurring, '2026-09-15');
  assert.deepEqual(first.created.map((item) => item.date), [
    '2026-08-31', '2026-09-30',
  ].filter((date) => date <= '2026-09-15').concat(['2026-09-01', '2026-09-08', '2026-09-15']).sort());
  const second = materializeRecurringTransactions(first.transactions, recurring, '2026-09-15');
  assert.equal(second.created.length, 0);
});

test('monthly recurrence clamps to the last valid day and exposes its next date', () => {
  const rule = { id: 'rent', frequency: 'monthly', startDate: '2026-08-31', active: true };
  assert.equal(nextRecurringDate(rule, '2026-09-01'), '2026-09-30');
  assert.equal(nextRecurringDate(rule, '2026-10-01'), '2026-10-31');
});
