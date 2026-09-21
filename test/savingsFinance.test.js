const test = require('node:test');
const assert = require('node:assert/strict');
const { summarizeTransactions, categoryBreakdown } = require('../src/domain/finance');

test('savings goal wallet movements do not count as income or spending analytics', () => {
  const tx = [
    { type: 'income', amount: 10000, date: '2026-09-01', category: 'Salary' },
    { type: 'expense', amount: 2500, date: '2026-09-02', category: 'Savings Goal', savingsGoalMovement: { goalId: 'g1', direction: 'deposit' } },
    { type: 'income', amount: 500, date: '2026-09-03', category: 'Savings Goal', savingsGoalMovement: { goalId: 'g1', direction: 'withdrawal' } },
    { type: 'expense', amount: 1200, date: '2026-09-04', category: 'Food' },
  ];
  assert.deepEqual(summarizeTransactions(tx, '2026-09'), { income: 10000, expense: 1200, balance: 8800, monthExpense: 1200 });
  assert.deepEqual(categoryBreakdown(tx, '2026-09'), [{ category: 'Food', amount: 1200 }]);
});
