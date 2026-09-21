import Storage from 'expo-sqlite/kv-store';

const TRANSACTIONS_KEY = 'kharcha.transactions.v1';
const SETTINGS_KEY = 'kharcha.settings.v1';

export const defaultSettings = {
  currency: 'NPR',
  monthlyBudget: 50000,
};

export async function loadTransactions() {
  const raw = await Storage.getItem(TRANSACTIONS_KEY);
  if (!raw) return [];
  try {
    const value = JSON.parse(raw);
    return Array.isArray(value) ? value : [];
  } catch {
    return [];
  }
}

export async function saveTransactions(transactions) {
  await Storage.setItem(TRANSACTIONS_KEY, JSON.stringify(transactions));
}

export async function loadSettings() {
  const raw = await Storage.getItem(SETTINGS_KEY);
  if (!raw) return defaultSettings;
  try {
    return { ...defaultSettings, ...JSON.parse(raw) };
  } catch {
    return defaultSettings;
  }
}

export async function saveSettings(settings) {
  await Storage.setItem(SETTINGS_KEY, JSON.stringify(settings));
}
