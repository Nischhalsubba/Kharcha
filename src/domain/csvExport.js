const { adToBsIso } = require('./nepal');
const { isValidIsoDate } = require('./finance');

const HEADERS = [
  'Date AD','Date BS','Type','Amount NPR','Category','Note','Wallet','Payment Method','Transfer From','Transfer To','Event',
  'Household Budget','Household Member','Remittance Sender','Remittance Country',
  'Remittance Original Currency','Remittance Original Amount','Remittance Fee NPR',
  'Udhaaro Record ID','Obligation ID','Savings Goal','Savings Direction','Recurring ID','Transaction ID',
];

function safeDate(value) {
  const date = String(value || '');
  return isValidIsoDate(date) ? date : '';
}

function filterTransactionsForExport(transactions = [], options = {}) {
  const scope = options.scope || 'all';
  let filtered = [...transactions];

  if (scope === 'month') {
    const monthKey = String(options.monthKey || '');
    if (!/^\d{4}-\d{2}$/.test(monthKey)) throw new Error('A valid month is required for export.');
    filtered = filtered.filter((item) => String(item?.date || '').slice(0, 7) === monthKey);
  } else if (scope === 'range') {
    const startDate = safeDate(options.startDate);
    const endDate = safeDate(options.endDate);
    if (!startDate || !endDate || startDate > endDate) throw new Error('A valid date range is required for export.');
    filtered = filtered.filter((item) => {
      const date = safeDate(item?.date);
      return date && date >= startDate && date <= endDate;
    });
  } else if (scope !== 'all') {
    throw new Error('Unsupported export scope.');
  }

  return filtered.sort((a, b) => {
    const byDate = String(a?.date || '').localeCompare(String(b?.date || ''));
    if (byDate !== 0) return byDate;
    return String(a?.createdAt || a?.id || '').localeCompare(String(b?.createdAt || b?.id || ''));
  });
}

function spreadsheetSafeText(value) {
  if (value == null) return '';
  const text = String(value);
  return /^\s*[=+\-@]/.test(text) ? `'${text}` : text;
}

function csvCell(value, options = {}) {
  if (value == null) return '';
  const raw = options.numeric ? String(Number(value) || 0) : spreadsheetSafeText(value);
  if (/[",\n\r]/.test(raw) || /^'/.test(raw)) return `"${raw.replace(/"/g, '""')}"`;
  return raw;
}

function lookupName(list, id) {
  if (!id) return '';
  return list.find((item) => item?.id === id)?.name || id;
}

function exportSuffix(options) {
  if (options.scope === 'month') return `month-${options.monthKey}`;
  if (options.scope === 'range') return `range-${options.startDate}_to_${options.endDate}`;
  return 'all';
}

function exportDate(exportedAt) {
  const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(String(exportedAt || new Date().toISOString()));
  return match ? `${match[1]}${match[2]}${match[3]}` : 'export';
}

function createTransactionsCsv(state = {}, options = {}) {
  const transactions = filterTransactionsForExport(state.transactions || [], options);
  const wallets = state.settings?.wallets || [];
  const events = state.nepalData?.events || [];
  const households = state.planningData?.householdBudgets || [];
  const savingsGoals = state.planningData?.savingsGoals || [];

  const rows = transactions.map((item) => {
    let bsDate = '';
    try { bsDate = item.date ? adToBsIso(item.date) : ''; } catch {}
    const remittance = item.remittance || {};
    return [
      csvCell(item.date),
      csvCell(bsDate),
      csvCell(item.type),
      csvCell(item.amount, { numeric: true }),
      csvCell(item.category),
      csvCell(item.note),
      csvCell(lookupName(wallets, item.walletId)),
      csvCell(item.paymentMethod),
      csvCell(item.type === 'transfer' ? lookupName(wallets, item.fromWalletId || item.walletId) : ''),
      csvCell(item.type === 'transfer' ? lookupName(wallets, item.toWalletId) : ''),
      csvCell(lookupName(events, item.eventId)),
      csvCell(lookupName(households, item.householdBudgetId)),
      csvCell(item.householdMember),
      csvCell(remittance.sender),
      csvCell(remittance.country),
      csvCell(remittance.currency),
      csvCell(remittance.foreignAmount, { numeric: true }),
      csvCell(remittance.fees, { numeric: true }),
      csvCell(item.udharoPayment?.recordId),
      csvCell(item.obligationPayment?.obligationId),
      csvCell(lookupName(savingsGoals, item.savingsGoalMovement?.goalId)),
      csvCell(item.savingsGoalMovement?.direction),
      csvCell(item.recurringId),
      csvCell(item.id),
    ].join(',');
  });

  const csv = '\uFEFF' + [HEADERS.join(','), ...rows].join('\n');
  return {
    csv,
    rowCount: transactions.length,
    filename: `kharcha-transactions-${exportSuffix(options)}-${exportDate(options.exportedAt)}.csv`,
  };
}

module.exports = {
  filterTransactionsForExport,
  createTransactionsCsv,
};
