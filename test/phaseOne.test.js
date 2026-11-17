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
  assert.equal(settings.language, 'en');
  assert.equal(settings.dateSystem, 'AD');
  assert.equal(settings.amountFormat, 'standard');
  assert.ok(settings.wallets.some((wallet) => wallet.id === 'cash'));
  assert.deepEqual(settings.customCategories, { expense: [], income: [] });
  assert.deepEqual(settings.categoryBudgets, {});
  assert.deepEqual(settings.recurringTransactions, []);
});

test('normalizing root preferences tolerates malformed restored settings', () => {
  const expected = normalizeSettings();
  for (const invalid of [null, [], 'bad settings', 15, false]) {
    assert.deepEqual(normalizeSettings(invalid), expected);
  }
  assert.equal(normalizeSettings({ monthlyBudget: 42000 }).monthlyBudget, 42000);
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


test('materializeRecurringTransactions respects skipped recurring occurrences', () => {
  const recurring = [{
    id: 'rent', type: 'expense', amount: 15000, category: 'Home', note: 'Rent',
    walletId: 'cash', frequency: 'monthly', startDate: '2026-08-31', active: true,
    skippedOccurrences: ['recurring:rent:2026-09-30'],
  }];
  const result = materializeRecurringTransactions([], recurring, '2026-10-31');
  assert.deepEqual(result.created.map((item) => item.date), ['2026-08-31', '2026-10-31']);
});


test('walletBalances moves transfers between wallets without treating them as income or expense', () => {
  const withTransfer = [...transactions, {
    id: '5',
    type: 'transfer',
    amount: 400,
    category: 'Transfer',
    note: 'Top up eSewa',
    date: '2026-09-04',
    walletId: 'cash',
    fromWalletId: 'cash',
    toWalletId: 'esewa',
  }];
  const result = walletBalances(withTransfer, wallets);
  assert.deepEqual(result, [
    { id: 'cash', name: 'Cash', openingBalance: 1000, balance: 6400 },
    { id: 'esewa', name: 'eSewa', openingBalance: 500, balance: 100 },
  ]);
});

test('filterTransactions finds a transfer from either participating wallet', () => {
  const withTransfer = [...transactions, {
    id: '5',
    type: 'transfer',
    amount: 400,
    category: 'Transfer',
    note: 'Top up eSewa',
    date: '2026-09-04',
    walletId: 'cash',
    fromWalletId: 'cash',
    toWalletId: 'esewa',
  }];
  assert.deepEqual(
    filterTransactions(withTransfer, { walletId: 'esewa' }).map((item) => item.id),
    ['3', '5'],
  );
  assert.deepEqual(
    filterTransactions(withTransfer, { type: 'transfer' }).map((item) => item.id),
    ['5'],
  );
});

test('invalid recurrence frequencies and monetary rules are not materialized', () => {
  const base = { id: 'rent', type: 'expense', amount: 1500, category: 'Rent', note: 'Rent', frequency: 'monthly', active: true, startDate: '2026-09-01' };
  const invalid = [
    { ...base, id: 'unknown', frequency: 'yearly' },
    { ...base, id: 'negative', amount: -200 },
    { ...base, id: 'overflow', amount: Infinity },
    { ...base, id: 'transfer', type: 'transfer' },
  ];
  assert.deepEqual(materializeRecurringTransactions([], invalid, '2026-10-01').created, []);
  assert.equal(nextRecurringDate(invalid[0], '2026-09-02'), null);
  assert.equal(materializeRecurringTransactions([], [base], '2026-09-01').created.length, 1);
});

test('wallet and category balances ignore corrupt imported amounts', () => {
  const invalid = [
    { id:'bad-negative', type:'expense', amount:-50, category:'Food', date:'2026-09-06', walletId:'cash' },
    { id:'bad-infinite', type:'income', amount:Infinity, date:'2026-09-06', walletId:'cash' },
    { id:'bad-transfer', type:'transfer', amount:300, date:'2026-09-06', walletId:'cash', fromWalletId:'cash' },
    { id:'same-transfer', type:'transfer', amount:300, date:'2026-09-06', walletId:'cash', fromWalletId:'cash', toWalletId:'cash' },
    { id:'bad-date', type:'expense', amount:999, category:'Food', date:'2026-09-99', walletId:'cash' },
  ];
  const originalBalances = walletBalances(transactions, wallets);
  assert.deepEqual(walletBalances([...transactions, ...invalid.slice(0,4)], wallets), originalBalances);
  assert.deepEqual(
    categoryBudgetStatus([...transactions, ...invalid], '2026-09', { Food:2000, Transport:500 }),
    categoryBudgetStatus(transactions, '2026-09', { Food:2000, Transport:500 }),
  );
});

test('normalizing preferences skips null and malformed recurring entries', () => {
  const settings = normalizeSettings({
    recurringTransactions: [null, 123, 'malformed', [], { id: 'legacy', amount: 100 }, { id: 'wallet', walletId: 'esewa' }],
  });
  assert.deepEqual(settings.recurringTransactions, [
    { id: 'legacy', amount: 100, walletId: 'cash' },
    { id: 'wallet', walletId: 'esewa' },
  ]);
});

test('weekly recurrence never returns a past date beyond the generation horizon', () => {
  const rule = { id:'weekly', frequency:'weekly', startDate:'2020-01-01', active:true };
  assert.equal(nextRecurringDate(rule,'2020-01-02'),'2020-01-08');
  assert.equal(nextRecurringDate(rule,'2040-01-01'),null);
});

test('normalizeSettings keeps one wallet per ID and ignores malformed entries', () => {
  const normalized = normalizeSettings({ wallets: [
    { id:'cash', name:'Primary Cash' },
    { id:'cash', name:'Duplicate Cash' },
    null,
    { id:'esewa', name:'eSewa' },
    { id:'esewa', name:'Duplicate eSewa' },
  ] });
  assert.deepEqual(normalized.wallets.map(x => [x.id, x.name]), [
    ['cash', 'Primary Cash'], ['esewa', 'eSewa'],
  ]);
  assert.deepEqual(normalizeSettings({ wallets: [] }).wallets.map(x => x.id), ['cash']);
});

test('monthly transaction filtering excludes impossible date prefixes', () => {
  const malformed = { id:'invalid-day', type:'expense', amount:700, category:'Food', date:'2026-09-99', walletId:'cash' };
  const items = [...transactions, malformed];
  assert.deepEqual(
    filterTransactions(items, { monthKey:'2026-09' }).map(item => item.id),
    ['1', '2', '3'],
  );
  // Without a month filter, the malformed record remains visible for repair.
  assert.ok(filterTransactions(items).some(item => item.id === 'invalid-day'));
});
