const { normalizeSettings, normalizeTransactions } = require('./phaseOne');
const { normalizeNepalData } = require('./phaseTwo');
const { normalizePlanningData } = require('./phaseThree');

const BACKUP_FORMAT = 'kharcha-backup';
const BACKUP_SCHEMA_VERSION = 1;

function stableStringify(value) {
  if (value === null || typeof value !== 'object') return JSON.stringify(value);
  if (Array.isArray(value)) return `[${value.map(stableStringify).join(',')}]`;
  const keys = Object.keys(value).sort();
  return `{${keys.map((key) => `${JSON.stringify(key)}:${stableStringify(value[key])}`).join(',')}}`;
}

function fnv1a32(input) {
  let hash = 0x811c9dc5;
  for (let index = 0; index < input.length; index += 1) {
    hash ^= input.charCodeAt(index);
    hash = Math.imul(hash, 0x01000193) >>> 0;
  }
  return hash.toString(16).padStart(8, '0');
}

function normalizeBackupState(state = {}) {
  return {
    transactions: normalizeTransactions(state.transactions),
    settings: normalizeSettings(state.settings),
    nepalData: normalizeNepalData(state.nepalData),
    planningData: normalizePlanningData(state.planningData),
  };
}

function assertStateShape(payload) {
  if (!payload || typeof payload !== 'object' || Array.isArray(payload)) {
    throw new Error('Backup payload must be an object.');
  }
  if (!Array.isArray(payload.transactions)) {
    throw new Error('Backup transactions must be an array.');
  }
  if (!payload.settings || typeof payload.settings !== 'object' || Array.isArray(payload.settings)) {
    throw new Error('Backup settings must be an object.');
  }
  if (!payload.nepalData || typeof payload.nepalData !== 'object' || Array.isArray(payload.nepalData)) {
    throw new Error('Backup Nepal data must be an object.');
  }
  if (!payload.planningData || typeof payload.planningData !== 'object' || Array.isArray(payload.planningData)) {
    throw new Error('Backup planning data must be an object.');
  }
}

function checksumInput(envelope) {
  return stableStringify({
    format: envelope.format,
    schemaVersion: envelope.schemaVersion,
    metadata: envelope.metadata,
    payload: envelope.payload,
  });
}

function checksumFor(envelope) {
  return `fnv1a32:${fnv1a32(checksumInput(envelope))}`;
}

function createBackupEnvelope(state, options = {}) {
  const payload = normalizeBackupState(state);
  const envelope = {
    format: BACKUP_FORMAT,
    schemaVersion: BACKUP_SCHEMA_VERSION,
    metadata: {
      appVersion: String(options.appVersion || 'unknown'),
      createdAt: String(options.createdAt || new Date().toISOString()),
    },
    payload,
  };
  return { ...envelope, checksum: checksumFor(envelope) };
}

function serializeBackup(envelope) {
  return JSON.stringify(envelope, null, 2);
}

function parseBackup(raw) {
  let envelope;
  try {
    envelope = typeof raw === 'string' ? JSON.parse(raw) : raw;
  } catch {
    throw new Error('Backup file is not valid JSON.');
  }

  if (!envelope || typeof envelope !== 'object' || Array.isArray(envelope)) {
    throw new Error('This is not a Kharcha backup.');
  }
  if (envelope.format !== BACKUP_FORMAT) {
    throw new Error('This is not a Kharcha backup.');
  }
  if (Number(envelope.schemaVersion) > BACKUP_SCHEMA_VERSION) {
    throw new Error('This backup was created by a newer version of Kharcha.');
  }
  if (Number(envelope.schemaVersion) !== BACKUP_SCHEMA_VERSION) {
    throw new Error('Unsupported Kharcha backup version.');
  }
  if (!envelope.metadata || typeof envelope.metadata !== 'object' || Array.isArray(envelope.metadata)) {
    throw new Error('Backup metadata is missing.');
  }

  assertStateShape(envelope.payload);

  const expectedChecksum = checksumFor({
    format: envelope.format,
    schemaVersion: envelope.schemaVersion,
    metadata: {
      appVersion: String(envelope.metadata.appVersion || 'unknown'),
      createdAt: String(envelope.metadata.createdAt || ''),
    },
    payload: envelope.payload,
  });
  if (typeof envelope.checksum !== 'string' || envelope.checksum !== expectedChecksum) {
    throw new Error('Backup checksum does not match. The file may be corrupted or edited.');
  }

  return {
    metadata: {
      appVersion: String(envelope.metadata.appVersion || 'unknown'),
      createdAt: String(envelope.metadata.createdAt || ''),
      schemaVersion: BACKUP_SCHEMA_VERSION,
    },
    state: normalizeBackupState(envelope.payload),
  };
}

module.exports = {
  BACKUP_FORMAT,
  BACKUP_SCHEMA_VERSION,
  createBackupEnvelope,
  serializeBackup,
  parseBackup,
};
