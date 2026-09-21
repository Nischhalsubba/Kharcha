import Storage from 'expo-sqlite/kv-store';
const { normalizeSettings, normalizeTransactions } = require('../domain/phaseOne');
const { normalizeNepalData } = require('../domain/phaseTwo');

const TRANSACTIONS_KEY = 'kharcha.transactions.v1';
const SETTINGS_KEY = 'kharcha.settings.v1';
const NEPAL_KEY = 'kharcha.nepal.v1';

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
