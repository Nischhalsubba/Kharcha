import Storage from 'expo-sqlite/kv-store';
const { normalizeSettings, normalizeTransactions } = require('../domain/phaseOne');
const { normalizeNepalData } = require('../domain/phaseTwo');
const { normalizePlanningData } = require('../domain/phaseThree');
const { restoreWithRollback } = require('../domain/backup');

const TRANSACTIONS_KEY = 'kharcha.transactions.v1';
const SETTINGS_KEY = 'kharcha.settings.v1';
const NEPAL_KEY = 'kharcha.nepal.v1';
const PLANNING_KEY = 'kharcha.planning.v1';
const RESTORE_JOURNAL_KEY = 'kharcha.restore.journal.v1';

export const defaultSettings = normalizeSettings({
  currency: 'NPR',
  monthlyBudget: 50000,
});

export async function loadTransactions() {
  const raw = await Storage.getItem(TRANSACTIONS_KEY);
  if (!raw) return [];
  try {
    return normalizeTransactions(JSON.parse(raw));
  } catch {
    return [];
  }
}

export async function saveTransactions(transactions) {
  await Storage.setItem(TRANSACTIONS_KEY, JSON.stringify(normalizeTransactions(transactions)));
}

export async function loadSettings() {
  const raw = await Storage.getItem(SETTINGS_KEY);
  if (!raw) return defaultSettings;
  try {
    return normalizeSettings(JSON.parse(raw));
  } catch {
    return defaultSettings;
  }
}

export async function saveSettings(settings) {
  const normalized = normalizeSettings(settings);
  await Storage.setItem(SETTINGS_KEY, JSON.stringify(normalized));
  return normalized;
}


export const defaultNepalData = normalizeNepalData();

export async function loadNepalData() {
  const raw = await Storage.getItem(NEPAL_KEY);
  if (!raw) return defaultNepalData;
  try {
    return normalizeNepalData(JSON.parse(raw));
  } catch {
    return defaultNepalData;
  }
}

export async function saveNepalData(data) {
  const normalized = normalizeNepalData(data);
  await Storage.setItem(NEPAL_KEY, JSON.stringify(normalized));
  return normalized;
}


export const defaultPlanningData = normalizePlanningData();

export async function loadPlanningData() {
  const raw = await Storage.getItem(PLANNING_KEY);
  if (!raw) return defaultPlanningData;
  try {
    return normalizePlanningData(JSON.parse(raw));
  } catch {
    return defaultPlanningData;
  }
}

export async function savePlanningData(data) {
  const normalized = normalizePlanningData(data);
  await Storage.setItem(PLANNING_KEY, JSON.stringify(normalized));
  return normalized;
}


function normalizeFullState(state = {}) {
  return {
    transactions: normalizeTransactions(state.transactions),
    settings: normalizeSettings(state.settings),
    nepalData: normalizeNepalData(state.nepalData),
    planningData: normalizePlanningData(state.planningData),
  };
}

export async function loadFullState() {
  const [transactions, settings, nepalData, planningData] = await Promise.all([
    loadTransactions(),
    loadSettings(),
    loadNepalData(),
    loadPlanningData(),
  ]);
  return normalizeFullState({ transactions, settings, nepalData, planningData });
}

async function writeFullState(state) {
  const normalized = normalizeFullState(state);
  await Storage.setItem(TRANSACTIONS_KEY, JSON.stringify(normalized.transactions));
  await Storage.setItem(SETTINGS_KEY, JSON.stringify(normalized.settings));
  await Storage.setItem(NEPAL_KEY, JSON.stringify(normalized.nepalData));
  await Storage.setItem(PLANNING_KEY, JSON.stringify(normalized.planningData));
  return normalized;
}

export async function restoreFullState(nextState) {
  const normalizedNext = normalizeFullState(nextState);
  const before = await loadFullState();
  await Storage.setItem(RESTORE_JOURNAL_KEY, JSON.stringify({
    createdAt: new Date().toISOString(),
    state: before,
  }));

  const restored = await restoreWithRollback(normalizedNext, {
    readState: async () => before,
    writeState: writeFullState,
  });
  await Storage.removeItem(RESTORE_JOURNAL_KEY);
  return normalizeFullState(restored);
}

export async function recoverInterruptedRestore() {
  const raw = await Storage.getItem(RESTORE_JOURNAL_KEY);
  if (!raw) return false;

  let journal;
  try {
    journal = JSON.parse(raw);
  } catch {
    throw new Error('Kharcha found an unreadable restore journal. Existing app data was left untouched.');
  }

  const snapshot = normalizeFullState(journal?.state);
  await writeFullState(snapshot);
  await Storage.removeItem(RESTORE_JOURNAL_KEY);
  return true;
}
