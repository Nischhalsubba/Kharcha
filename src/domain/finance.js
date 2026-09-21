function toMonthKey(date) {
  return String(date || '').slice(0, 7);
}

function normalizeAmount(value) {
  const parsed = Number(String(value ?? '').replace(/,/g, '').trim());
  if (!Number.isFinite(parsed) || parsed <= 0) return null;
  return Math.round((parsed + Number.EPSILON) * 100) / 100;
}

function isValidIsoDate(value) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(String(value || ''))) return false;
  const [year, month, day] = value.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  return date.getFullYear() === year
    && date.getMonth() === month - 1
    && date.getDate() === day;
}

function summarizeTransactions(transactions, monthKey) {
  let income = 0;
  let expense = 0;
  let monthExpense = 0;

  for (const transaction of transactions || []) {
    if (toMonthKey(transaction.date) !== monthKey) continue;
    const amount = Number(transaction.amount) || 0;
    if (transaction.type === 'income') income += amount;
    if (transaction.type === 'expense') {
      expense += amount;
      monthExpense += amount;
    }
  }

  return {
    income,
    expense,
    balance: income - expense,
    monthExpense,
  };
}

function categoryBreakdown(transactions, monthKey) {
  const totals = new Map();

  for (const transaction of transactions || []) {
    if (transaction.type !== 'expense' || toMonthKey(transaction.date) !== monthKey) continue;
    const category = transaction.category || 'Other';
    totals.set(category, (totals.get(category) || 0) + (Number(transaction.amount) || 0));
  }

  return Array.from(totals, ([category, amount]) => ({ category, amount }))
    .sort((a, b) => b.amount - a.amount);
}

function monthlyBudgetStatus(transactions, monthKey, limit) {
  const safeLimit = Math.max(Number(limit) || 0, 0);
  const spent = categoryBreakdown(transactions, monthKey)
    .reduce((total, item) => total + item.amount, 0);
  const overBy = Math.max(spent - safeLimit, 0);
  const remaining = Math.max(safeLimit - spent, 0);
  const progress = safeLimit > 0 ? Math.min(spent / safeLimit, 1) : 0;

  return { limit: safeLimit, spent, remaining, progress, overBy };
}

function dailyAverage(transactions, monthKey, todayIso) {
  const spent = categoryBreakdown(transactions, monthKey)
    .reduce((total, item) => total + item.amount, 0);
  const today = new Date(`${todayIso}T00:00:00`);
  const isCurrentMonth = toMonthKey(todayIso) === monthKey;
  const days = isCurrentMonth ? Math.max(today.getDate(), 1) : new Date(
    Number(monthKey.slice(0, 4)),
    Number(monthKey.slice(5, 7)),
    0,
  ).getDate();
  return spent / days;
}

module.exports = {
  toMonthKey,
  normalizeAmount,
  summarizeTransactions,
  categoryBreakdown,
  monthlyBudgetStatus,
  dailyAverage,
  isValidIsoDate,
};
