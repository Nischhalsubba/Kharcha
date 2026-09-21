const { categoryBreakdown, isValidIsoDate, summarizeTransactions } = require('./finance');
const { addMonthsClamped } = require('./phaseOne');

function validMonthKey(value) {
  const match = /^(\d{4})-(\d{2})$/.exec(String(value || ''));
  return Boolean(match && Number(match[2]) >= 1 && Number(match[2]) <= 12);
}

function previousMonthKey(monthKey) {
  if (!validMonthKey(monthKey)) return null;
  const [year, month] = monthKey.split('-').map(Number);
  const date = new Date(Date.UTC(year, month - 2, 1));
  return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, '0')}`;
}

function shiftMonthKey(monthKey, offset) {
  if (!validMonthKey(monthKey)) return null;
  const [year, month] = monthKey.split('-').map(Number);
  const date = new Date(Date.UTC(year, month - 1 + offset, 1));
  return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, '0')}`;
}

function monthComparison(transactions = [], currentMonth) {
  const previousMonth = previousMonthKey(currentMonth);
  if (!previousMonth) return null;
  const currentExpense = summarizeTransactions(transactions, currentMonth).expense;
  const previousExpense = summarizeTransactions(transactions, previousMonth).expense;
  const change = currentExpense - previousExpense;
  return {
    currentMonth,
    previousMonth,
    currentExpense,
    previousExpense,
    change,
    changeRate: previousExpense > 0 ? change / previousExpense : null,
  };
}

function savingsRate(transactions = [], monthKey) {
  if (!validMonthKey(monthKey)) return null;
  const summary = summarizeTransactions(transactions, monthKey);
  const saved = summary.income - summary.expense;
  return {
    income: summary.income,
    expense: summary.expense,
    saved,
    rate: summary.income > 0 ? saved / summary.income : null,
  };
}

function daysInMonth(monthKey) {
  if (!validMonthKey(monthKey)) return 0;
  const [year, month] = monthKey.split('-').map(Number);
  return new Date(Date.UTC(year, month, 0)).getUTCDate();
}

function projectedMonthExpense(transactions = [], monthKey, asOfDate) {
  if (!validMonthKey(monthKey) || !isValidIsoDate(asOfDate)) return null;
  const totalDays = daysInMonth(monthKey);
  const asOfMonth = String(asOfDate).slice(0, 7);
  if (asOfMonth < monthKey) {
    return { spentToDate: 0, elapsedDays: 0, daysInMonth: totalDays, projectedExpense: 0 };
  }
  const elapsedDays = asOfMonth === monthKey
    ? Math.min(Number(String(asOfDate).slice(8, 10)), totalDays)
    : totalDays;
  const throughDate = transactions.filter((item) => !item?.date || item.date <= asOfDate);
  const spentToDate = summarizeTransactions(throughDate, monthKey).expense;
  return {
    spentToDate,
    elapsedDays,
    daysInMonth: totalDays,
    projectedExpense: elapsedDays > 0
      ? Math.round((spentToDate / elapsedDays) * totalDays * 100) / 100
      : 0,
  };
}

function detectUnusualSpending(transactions = [], currentMonth, options = {}) {
  if (!validMonthKey(currentMonth)) return [];
  const lookbackMonths = Math.max(1, Math.trunc(Number(options.lookbackMonths) || 3));
  const minRatio = Math.max(1, Number(options.minRatio) || 1.5);
  const minExcess = Math.max(0, Number(options.minExcess) || 500);
  const minHistoryMonths = Math.max(1, Math.trunc(Number(options.minHistoryMonths) || 2));
  const historyMonths = Array.from({ length: lookbackMonths }, (_, index) => shiftMonthKey(currentMonth, -(index + 1)));
  const historical = historyMonths.map((monthKey) => new Map(
    categoryBreakdown(transactions, monthKey).map((item) => [item.category, item.amount]),
  ));

  return categoryBreakdown(transactions, currentMonth)
    .map((item) => {
      const values = historical.map((map) => Number(map.get(item.category)) || 0);
      const activeValues = values.filter((value) => value > 0);
      if (activeValues.length < minHistoryMonths) return null;
      const historicalAverage = activeValues.reduce((sum, value) => sum + value, 0) / activeValues.length;
      if (historicalAverage <= 0) return null;
      const ratio = item.amount / historicalAverage;
      const excess = item.amount - historicalAverage;
      if (ratio < minRatio || excess < minExcess) return null;
      return {
        category: item.category,
        currentAmount: item.amount,
        historicalAverage: Math.round(historicalAverage * 100) / 100,
        ratio: Math.round(ratio * 100) / 100,
        excess: Math.round(excess * 100) / 100,
      };
    })
    .filter(Boolean)
    .sort((a, b) => b.ratio - a.ratio || b.excess - a.excess);
}

function normalizedText(value) {
  return String(value || '').trim().toLowerCase().replace(/\s+/g, ' ');
}

function patternKey(item) {
  return [
    item.type,
    normalizedText(item.category),
    normalizedText(item.note),
    item.walletId || 'cash',
    String(Number(item.amount) || 0),
  ].join('|');
}

function utcDate(value) {
  if (!isValidIsoDate(value)) return null;
  const [year, month, day] = value.split('-').map(Number);
  return new Date(Date.UTC(year, month - 1, day));
}

function daysBetween(a, b) {
  const first = utcDate(a), second = utcDate(b);
  if (!first || !second) return null;
  return Math.round((second - first) / 86400000);
}

function addDays(value, count) {
  const date = utcDate(value);
  if (!date) return null;
  date.setUTCDate(date.getUTCDate() + count);
  return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, '0')}-${String(date.getUTCDate()).padStart(2, '0')}`;
}

function monthIndex(value) {
  if (!isValidIsoDate(value)) return null;
  const [year, month] = value.split('-').map(Number);
  return year * 12 + month - 1;
}

function detectFrequency(items) {
  if (items.length < 3) return null;
  const dates = items.map((item) => item.date);
  const intervals = dates.slice(1).map((date, index) => daysBetween(dates[index], date));
  if (intervals.every((days) => days >= 6 && days <= 8)) return 'weekly';

  const monthly = dates.slice(1).every((date, index) => {
    const previous = dates[index];
    const previousIndex = monthIndex(previous);
    const currentIndex = monthIndex(date);
    const previousDay = Number(previous.slice(8, 10));
    const currentDay = Number(date.slice(8, 10));
    return currentIndex - previousIndex === 1 && Math.abs(currentDay - previousDay) <= 3;
  });
  return monthly ? 'monthly' : null;
}

function ruleMatchesSuggestion(rule, suggestion) {
  return rule?.type === suggestion.type
    && normalizedText(rule?.category) === normalizedText(suggestion.category)
    && normalizedText(rule?.note) === normalizedText(suggestion.note)
    && (rule?.walletId || 'cash') === suggestion.walletId
    && Number(rule?.amount || 0) === suggestion.amount;
}

function recurringTransactionSuggestions(transactions = [], existingRules = [], options = {}) {
  const minOccurrences = Math.max(3, Math.trunc(Number(options.minOccurrences) || 3));
  const groups = new Map();

  for (const item of transactions) {
    if (!['income', 'expense'].includes(item?.type)) continue;
    if (!isValidIsoDate(item?.date) || !Number(item?.amount) || !normalizedText(item?.note)) continue;
    if (item.recurringId || item.obligationPayment || item.udharoPayment || item.savingsGoalMovement) continue;
    const key = patternKey(item);
    const group = groups.get(key) || [];
    group.push(item);
    groups.set(key, group);
  }

  const suggestions = [];
  for (const [key, rawItems] of groups) {
    if (rawItems.length < minOccurrences) continue;
    const items = [...rawItems].sort((a, b) => a.date.localeCompare(b.date));
    const frequency = detectFrequency(items);
    if (!frequency) continue;
    const last = items[items.length - 1];
    const nextDate = frequency === 'weekly' ? addDays(last.date, 7) : addMonthsClamped(last.date, 1);
    const suggestion = {
      key,
      type: last.type,
      amount: Number(last.amount),
      category: last.category,
      note: last.note,
      walletId: last.walletId || 'cash',
      frequency,
      occurrences: items.length,
      lastDate: last.date,
      nextDate,
    };
    if (existingRules.some((rule) => ruleMatchesSuggestion(rule, suggestion))) continue;
    suggestions.push(suggestion);
  }

  return suggestions.sort((a, b) => b.occurrences - a.occurrences || a.nextDate.localeCompare(b.nextDate));
}

module.exports = {
  previousMonthKey,
  monthComparison,
  savingsRate,
  projectedMonthExpense,
  detectUnusualSpending,
  recurringTransactionSuggestions,
};
