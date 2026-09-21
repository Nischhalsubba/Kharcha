const DEFAULT_WALLETS = [
  { id: 'cash', name: 'Cash', type: 'cash', icon: '💵', openingBalance: 0 },
];

const DEFAULT_CUSTOM_CATEGORIES = { expense: [], income: [] };

function safeNumber(value, fallback = 0) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function slugify(value) {
  const slug = String(value || '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  return slug || `item-${Date.now()}`;
}

function normalizeWallet(wallet, index = 0) {
  const name = String(wallet?.name || '').trim() || `Wallet ${index + 1}`;
  return {
    id: String(wallet?.id || slugify(name)),
    name,
    type: String(wallet?.type || 'other'),
    icon: String(wallet?.icon || '👛'),
    openingBalance: safeNumber(wallet?.openingBalance, 0),
  };
}

function normalizeSettings(settings = {}) {
  const suppliedWallets = Array.isArray(settings.wallets)
    ? settings.wallets.map(normalizeWallet)
    : [];
  const wallets = suppliedWallets.some((wallet) => wallet.id === 'cash')
    ? suppliedWallets
    : [DEFAULT_WALLETS[0], ...suppliedWallets];

  const customCategories = {
    expense: Array.isArray(settings.customCategories?.expense)
      ? settings.customCategories.expense.filter(Boolean)
      : [],
    income: Array.isArray(settings.customCategories?.income)
      ? settings.customCategories.income.filter(Boolean)
      : [],
  };

  return {
    currency: String(settings.currency || 'NPR'),
    monthlyBudget: safeNumber(settings.monthlyBudget, 50000),
    wallets,
    customCategories,
    categoryBudgets: settings.categoryBudgets && typeof settings.categoryBudgets === 'object'
      ? { ...settings.categoryBudgets }
      : {},
    recurringTransactions: Array.isArray(settings.recurringTransactions)
      ? settings.recurringTransactions.map((rule) => ({ ...rule, walletId: rule.walletId || 'cash' }))
      : [],
  };
}

function normalizeTransaction(transaction) {
  return {
    ...transaction,
    walletId: transaction?.walletId || 'cash',
  };
}

function normalizeTransactions(transactions) {
  return Array.isArray(transactions) ? transactions.map(normalizeTransaction) : [];
}

function filterTransactions(transactions, filters = {}) {
  const query = String(filters.query || '').trim().toLowerCase();
  return normalizeTransactions(transactions).filter((item) => {
    if (filters.type && filters.type !== 'all' && item.type !== filters.type) return false;
    if (filters.walletId && filters.walletId !== 'all' && item.walletId !== filters.walletId) return false;
    if (filters.category && filters.category !== 'all' && item.category !== filters.category) return false;
    if (filters.monthKey && String(item.date || '').slice(0, 7) !== filters.monthKey) return false;
    if (!query) return true;
    const haystack = [item.note, item.category, item.date, item.amount, item.type, item.walletId]
      .map((value) => String(value ?? '').toLowerCase())
      .join(' ');
    return haystack.includes(query);
  });
}

function walletBalances(transactions, wallets) {
  const totals = new Map();
  for (const wallet of (wallets || []).map(normalizeWallet)) {
    totals.set(wallet.id, safeNumber(wallet.openingBalance));
  }

  for (const item of normalizeTransactions(transactions)) {
    if (!totals.has(item.walletId)) totals.set(item.walletId, 0);
    const amount = safeNumber(item.amount);
    if (item.type === 'income') totals.set(item.walletId, totals.get(item.walletId) + amount);
    if (item.type === 'expense') totals.set(item.walletId, totals.get(item.walletId) - amount);
  }

  return (wallets || []).map(normalizeWallet).map((wallet) => ({
    id: wallet.id,
    name: wallet.name,
    openingBalance: wallet.openingBalance,
    balance: totals.get(wallet.id) ?? wallet.openingBalance,
  }));
}

function categoryBudgetStatus(transactions, monthKey, categoryBudgets = {}) {
  const spent = new Map();
  for (const item of normalizeTransactions(transactions)) {
    if (item.type !== 'expense' || String(item.date || '').slice(0, 7) !== monthKey) continue;
    spent.set(item.category, (spent.get(item.category) || 0) + safeNumber(item.amount));
  }

  return Object.entries(categoryBudgets)
    .filter(([, limit]) => safeNumber(limit) > 0)
    .map(([category, rawLimit]) => {
      const limit = safeNumber(rawLimit);
      const amount = spent.get(category) || 0;
      return {
        category,
        limit,
        spent: amount,
        remaining: Math.max(limit - amount, 0),
        progress: limit > 0 ? Math.min(amount / limit, 1) : 0,
        overBy: Math.max(amount - limit, 0),
      };
    });
}

function parseIso(value) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(value || ''));
  if (!match) return null;
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const date = new Date(Date.UTC(year, month - 1, day));
  if (date.getUTCFullYear() !== year || date.getUTCMonth() !== month - 1 || date.getUTCDate() !== day) return null;
  return date;
}

function formatIso(date) {
  return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, '0')}-${String(date.getUTCDate()).padStart(2, '0')}`;
}

function addDays(isoDate, days) {
  const date = parseIso(isoDate);
  if (!date) return null;
  date.setUTCDate(date.getUTCDate() + days);
  return formatIso(date);
}

function addMonthsClamped(startDate, monthsToAdd) {
  const start = parseIso(startDate);
  if (!start) return null;
  const startDay = start.getUTCDate();
  const target = new Date(Date.UTC(start.getUTCFullYear(), start.getUTCMonth() + monthsToAdd, 1));
  const lastDay = new Date(Date.UTC(target.getUTCFullYear(), target.getUTCMonth() + 1, 0)).getUTCDate();
  target.setUTCDate(Math.min(startDay, lastDay));
  return formatIso(target);
}

function recurrenceDates(rule, throughDate) {
  if (!rule?.active || !parseIso(rule.startDate) || !parseIso(throughDate)) return [];
  if (rule.startDate > throughDate) return [];

  const dates = [];
  if (rule.frequency === 'weekly') {
    let cursor = rule.startDate;
    while (cursor <= throughDate && dates.length < 520) {
      dates.push(cursor);
      cursor = addDays(cursor, 7);
    }
    return dates;
  }

  let index = 0;
  while (dates.length < 240) {
    const cursor = addMonthsClamped(rule.startDate, index);
    if (!cursor || cursor > throughDate) break;
    dates.push(cursor);
    index += 1;
  }
  return dates;
}

function occurrenceId(ruleId, date) {
  return `recurring:${ruleId}:${date}`;
}

function materializeRecurringTransactions(transactions, recurringRules, throughDate) {
  const normalized = normalizeTransactions(transactions);
  const existingIds = new Set(normalized.map((item) => item.id));
  const created = [];

  for (const rule of recurringRules || []) {
    for (const date of recurrenceDates(rule, throughDate)) {
      const id = occurrenceId(rule.id, date);
      if (existingIds.has(id)) continue;
      const item = {
        id,
        type: rule.type,
        amount: safeNumber(rule.amount),
        category: rule.category,
        note: rule.note || '',
        date,
        walletId: rule.walletId || 'cash',
        recurringId: rule.id,
        createdAt: `${date}T00:00:00.000Z`,
      };
      existingIds.add(id);
      created.push(item);
    }
  }

  const merged = [...created, ...normalized].sort((a, b) => {
    const dateCompare = String(b.date || '').localeCompare(String(a.date || ''));
    if (dateCompare !== 0) return dateCompare;
    return String(b.createdAt || '').localeCompare(String(a.createdAt || ''));
  });

  return { transactions: merged, created: created.sort((a, b) => a.date.localeCompare(b.date)) };
}

function nextRecurringDate(rule, fromDate) {
  if (!rule?.active || !parseIso(rule.startDate) || !parseIso(fromDate)) return null;
  if (rule.startDate >= fromDate) return rule.startDate;

  if (rule.frequency === 'weekly') {
    let cursor = rule.startDate;
    for (let i = 0; i < 520 && cursor < fromDate; i += 1) cursor = addDays(cursor, 7);
    return cursor;
  }

  for (let index = 0; index < 240; index += 1) {
    const cursor = addMonthsClamped(rule.startDate, index);
    if (cursor >= fromDate) return cursor;
  }
  return null;
}

module.exports = {
  DEFAULT_WALLETS,
  DEFAULT_CUSTOM_CATEGORIES,
  normalizeSettings,
  normalizeTransactions,
  filterTransactions,
  walletBalances,
  categoryBudgetStatus,
  materializeRecurringTransactions,
  nextRecurringDate,
  addMonthsClamped,
};
