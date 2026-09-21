const test = require('node:test');
const assert = require('node:assert/strict');
const {
  BACKUP_FORMAT,
  BACKUP_SCHEMA_VERSION,
  createBackupEnvelope,
  serializeBackup,
  parseBackup,
} = require('../src/domain/backup');

const sampleState = {
  transactions: [
    { id: 't1', type: 'expense', amount: 1200, category: 'Food', note: 'Khaja', date: '2026-09-21', walletId: 'cash' },
  ],
  settings: {
    currency: 'NPR',
    monthlyBudget: 50000,
    language: 'ne',
    dateSystem: 'both',
  },
  nepalData: {
    udharo: [{ id: 'u1', direction: 'lent', person: 'Ram', amount: 5000, repayments: [], status: 'active' }],
    events: [{ id: 'e1', name: 'Dashain', budget: 15000, date: '2026-10-15' }],
  },
  planningData: {
    obligations: [{ id: 'b1', kind: 'bill', name: 'Internet', amount: 1800, frequency: 'monthly', dueDay: 20, active: true }],
    savingsGoals: [{ id: 'g1', name: 'Emergency fund', targetAmount: 100000, active: true }],
    householdBudgets: [{ id: 'h1', name: 'Home', monthlyLimit: 30000, members: ['Nischhal', 'Reeja'] }],
  },
};

test('backup round trip preserves all normalized Phase 1-3 state', () => {
  const envelope = createBackupEnvelope(sampleState, {
    appVersion: '1.4.0',
    createdAt: '2026-09-21T05:00:00.000Z',
  });
  assert.equal(envelope.format, BACKUP_FORMAT);
  assert.equal(envelope.schemaVersion, BACKUP_SCHEMA_VERSION);
  assert.match(envelope.checksum, /^fnv1a32:[0-9a-f]{8}$/);

  const parsed = parseBackup(serializeBackup(envelope));
  assert.equal(parsed.metadata.appVersion, '1.4.0');
  assert.equal(parsed.metadata.createdAt, '2026-09-21T05:00:00.000Z');
  assert.deepEqual(parsed.state.transactions, sampleState.transactions);
  assert.equal(parsed.state.settings.currency, 'NPR');
  assert.equal(parsed.state.settings.language, 'ne');
  assert.deepEqual(parsed.state.nepalData.udharo, sampleState.nepalData.udharo);
  assert.deepEqual(parsed.state.planningData.savingsGoals, sampleState.planningData.savingsGoals);
});

test('backup checksum is deterministic for equivalent payload key order', () => {
  const first = createBackupEnvelope(sampleState, { appVersion: '1.4.0', createdAt: '2026-09-21T05:00:00.000Z' });
  const reordered = {
    planningData: sampleState.planningData,
    nepalData: sampleState.nepalData,
    settings: sampleState.settings,
    transactions: sampleState.transactions,
  };
  const second = createBackupEnvelope(reordered, { appVersion: '1.4.0', createdAt: '2026-09-21T05:00:00.000Z' });
  assert.equal(first.checksum, second.checksum);
});

test('corrupted backup content is rejected before restore', () => {
  const envelope = createBackupEnvelope(sampleState, { appVersion: '1.4.0', createdAt: '2026-09-21T05:00:00.000Z' });
  envelope.payload.transactions[0].amount = 999999;
  assert.throws(() => parseBackup(JSON.stringify(envelope)), /checksum/i);
});

test('future backup schema fails closed', () => {
  const envelope = createBackupEnvelope(sampleState, { appVersion: '1.4.0', createdAt: '2026-09-21T05:00:00.000Z' });
  envelope.schemaVersion = BACKUP_SCHEMA_VERSION + 1;
  assert.throws(() => parseBackup(JSON.stringify(envelope)), /newer version/i);
});

test('wrong product marker and malformed payload are rejected', () => {
  const envelope = createBackupEnvelope(sampleState, { appVersion: '1.4.0', createdAt: '2026-09-21T05:00:00.000Z' });
  assert.throws(
    () => parseBackup(JSON.stringify({ ...envelope, format: 'other-app' })),
    /Kharcha backup/i,
  );

  const invalid = { ...envelope, payload: { ...envelope.payload, transactions: {} } };
  assert.throws(() => parseBackup(JSON.stringify(invalid)), /transactions/i);
});

test('unknown top-level or payload fields do not enter restored app state', () => {
  const envelope = createBackupEnvelope(sampleState, { appVersion: '1.4.0', createdAt: '2026-09-21T05:00:00.000Z' });
  envelope.ignored = 'top-level';
  envelope.payload.ignored = { secret: 'not app state' };
  const canonical = createBackupEnvelope(envelope.payload, {
    appVersion: envelope.metadata.appVersion,
    createdAt: envelope.metadata.createdAt,
  });
  canonical.ignored = envelope.ignored;
  canonical.payload.ignored = envelope.payload.ignored;
  const parsed = parseBackup(serializeBackup(canonical));
  assert.deepEqual(Object.keys(parsed.state).sort(), ['nepalData', 'planningData', 'settings', 'transactions']);
});


test('restoreWithRollback writes the new state after taking a snapshot', async () => {
  const { restoreWithRollback } = require('../src/domain/backup');
  const before = { transactions: [], settings: {}, nepalData: {}, planningData: {} };
  const after = { transactions: [{ id: 'new' }], settings: {}, nepalData: {}, planningData: {} };
  const writes = [];
  const result = await restoreWithRollback(after, {
    readState: async () => before,
    writeState: async (state) => writes.push(state),
  });
  assert.deepEqual(result, after);
  assert.deepEqual(writes, [after]);
});

test('restoreWithRollback restores the pre-restore snapshot when a write fails', async () => {
  const { restoreWithRollback } = require('../src/domain/backup');
  const before = { transactions: [{ id: 'old' }], settings: {}, nepalData: {}, planningData: {} };
  const after = { transactions: [{ id: 'new' }], settings: {}, nepalData: {}, planningData: {} };
  const writes = [];
  let first = true;
  await assert.rejects(
    () => restoreWithRollback(after, {
      readState: async () => before,
      writeState: async (state) => {
        writes.push(state);
        if (first) {
          first = false;
          throw new Error('disk write failed');
        }
      },
    }),
    /Restore failed/,
  );
  assert.deepEqual(writes, [after, before]);
});


test('backup checksum matches JSON serialization when optional fields are undefined', () => {
  const withOptionalUndefined = {
    ...sampleState,
    transactions: [{ ...sampleState.transactions[0], eventId: undefined, householdMember: undefined }],
  };
  const envelope = createBackupEnvelope(withOptionalUndefined, {
    appVersion: '1.4.0',
    createdAt: '2026-09-21T05:00:00.000Z',
  });
  assert.doesNotThrow(() => parseBackup(serializeBackup(envelope)));
});
