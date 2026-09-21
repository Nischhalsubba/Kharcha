const test = require('node:test');
const assert = require('node:assert/strict');
const {
  normalizeNepalData,
  udharoSummary,
  applyUdharoPayment,
  eventBudgetStatus,
  remittanceSummary,
} = require('../src/domain/phaseTwo');

test('normalizeNepalData supplies empty migration-safe collections', () => {
  assert.deepEqual(normalizeNepalData(), { udharo: [], events: [] });
});

test('udharoSummary separates borrowed and lent outstanding amounts', () => {
  const records = [
    { id: 'a', direction: 'borrowed', amount: 5000, repayments: [{ amount: 1000 }] },
    { id: 'b', direction: 'lent', amount: 3000, repayments: [] },
  ];
  assert.deepEqual(udharoSummary(records), { borrowed: 4000, lent: 3000, netReceivable: -1000 });
});

test('applyUdharoPayment supports partial payment and caps at outstanding amount', () => {
  const record = { id: 'a', direction: 'borrowed', amount: 5000, repayments: [] };
  const once = applyUdharoPayment(record, 1200, '2026-09-21');
  assert.equal(once.outstanding, 3800);
  const twice = applyUdharoPayment(once.record, 9999, '2026-09-22');
  assert.equal(twice.outstanding, 0);
  assert.equal(twice.record.status, 'settled');
});

test('eventBudgetStatus totals only linked expenses', () => {
  const events = [{ id: 'dashain', name: 'Dashain 2083', budget: 30000 }];
  const tx = [
    { id: '1', type: 'expense', amount: 8000, eventId: 'dashain' },
    { id: '2', type: 'income', amount: 1000, eventId: 'dashain' },
    { id: '3', type: 'expense', amount: 2000 },
  ];
  assert.deepEqual(eventBudgetStatus(events, tx)[0], {
    id: 'dashain', name: 'Dashain 2083', budget: 30000, spent: 8000,
    remaining: 22000, overBy: 0, progress: 8000 / 30000,
  });
});

test('remittanceSummary totals NPR received and groups original currency', () => {
  const tx = [
    { type: 'income', amount: 100000, date: '2026-09-01', remittance: { currency: 'AED', foreignAmount: 2700, fees: 500 } },
    { type: 'income', amount: 50000, date: '2026-09-10', remittance: { currency: 'USD', foreignAmount: 375, fees: 250 } },
    { type: 'income', amount: 25000, date: '2026-08-01', remittance: { currency: 'AED', foreignAmount: 700, fees: 100 } },
  ];
  assert.deepEqual(remittanceSummary(tx, '2026-09'), {
    nprReceived: 150000,
    fees: 750,
    byCurrency: { AED: 2700, USD: 375 },
    count: 2,
  });
});
