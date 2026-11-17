const test = require('node:test');
const assert = require('node:assert/strict');
const { prepareTransactionImport } = require('../src/domain/dataManagement');

const headers = 'Date AD,Type,Amount NPR,Category,Remittance Original Amount,Remittance Fee NPR,Transaction ID';
const state = { settings: { wallets: [{ id: 'cash', name: 'Cash' }] } };

test('CSV import rejects non-finite, negative and malformed remittance figures', () => {
  const csv = [headers,
    '2026-09-01,income,100,Remittance,1e309,5,bad-infinite',
    '2026-09-02,income,100,Remittance,20,-5,bad-fee',
    '2026-09-03,income,100,Remittance,"1,2",5,bad-grouping',
    '2026-09-04,income,100,Remittance,"1,23,456.75",0,valid-amount',
  ].join('\n');
  const preview = prepareTransactionImport(csv, state);
  assert.deepEqual(preview.invalid.map((row) => row.transactionId), [
    'bad-infinite', 'bad-fee', 'bad-grouping',
  ]);
  assert.equal(preview.transactions.length, 1);
  assert.deepEqual(preview.transactions[0].remittance.foreignAmount, 123456.75);
  assert.equal(preview.transactions[0].remittance.fees, 0);
});

test('foreign amounts may retain three decimal places without precision loss', () => {
  const csv = [headers, '2026-09-05,income,100,Remittance,0.125,0.001,precision'].join('\n');
  const preview = prepareTransactionImport(csv, state);
  assert.equal(preview.invalid.length, 0);
  assert.equal(preview.transactions[0].remittance.foreignAmount, 0.125);
  assert.equal(preview.transactions[0].remittance.fees, 0.001);
});
