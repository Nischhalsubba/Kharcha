const test = require('node:test');
const assert = require('node:assert/strict');
const {
  formatNpr,
  toNepaliDigits,
  transactionDateLabel,
  normalizeNepalPreferences,
} = require('../src/domain/nepal');

test('formatNpr uses Nepal-style grouping and Nepali digits', () => {
  assert.equal(formatNpr(125000, { language: 'en' }), 'Rs 1,25,000');
  assert.equal(formatNpr(125000, { language: 'ne' }), 'रु १,२५,०००');
  assert.equal(formatNpr(12500000, { language: 'en', mode: 'compact' }), 'Rs 1.25 crore');
  assert.equal(formatNpr(250000, { language: 'ne', mode: 'compact' }), 'रु २.५ लाख');
});

test('toNepaliDigits converts all ASCII digits', () => {
  assert.equal(toNepaliDigits('2083-05-04'), '२०८३-०५-०४');
});

test('normalizeNepalPreferences supplies migration-safe defaults', () => {
  assert.deepEqual(normalizeNepalPreferences({}), {
    language: 'en',
    dateSystem: 'AD',
    amountFormat: 'standard',
  });
});

test('transactionDateLabel supports AD, BS and dual display through the calendar adapter', () => {
  const core = {
    adToBs: () => ({ year: 2083, month: 5, day: 4 }),
    formatBs: (_date, _format, { locale }) => locale === 'ne' ? '२०८३ भदौ ०४' : '2083 Bhadra 04',
  };
  assert.deepEqual(transactionDateLabel('2026-08-20', { language: 'en', dateSystem: 'AD' }, core), { primary: '2026-08-20', secondary: '' });
  assert.deepEqual(transactionDateLabel('2026-08-20', { language: 'en', dateSystem: 'BS' }, core), { primary: '2083 Bhadra 04', secondary: '' });
  assert.deepEqual(transactionDateLabel('2026-08-20', { language: 'ne', dateSystem: 'both' }, core), { primary: '२०८३ भदौ ०४', secondary: '2026-08-20' });
});
