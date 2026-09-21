const { isValidIsoDate, normalizeAmount } = require('./finance');
const { reconcileUdhaaroRecords } = require('./phaseThree');

const REQUIRED_HEADERS = ['Date AD', 'Type', 'Amount NPR', 'Category'];

function parseCsvRows(raw) {
  const text = String(raw || '').replace(/^\uFEFF/, '');
  const rows = [];
  let row = [];
  let cell = '';
  let inQuotes = false;

  for (let index = 0; index < text.length; index += 1) {
    const char = text[index];
    if (char === '"') {
      if (inQuotes && text[index + 1] === '"') {
        cell += '"';
        index += 1;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }
    if (!inQuotes && char === ',') {
      row.push(cell);
      cell = '';
      continue;
    }
    if (!inQuotes && (char === '\n' || char === '\r')) {
      if (char === '\r' && text[index + 1] === '\n') index += 1;
      row.push(cell);
      if (row.some((value) => value !== '')) rows.push(row);
      row = [];
      cell = '';
      continue;
    }
    cell += char;
  }

  if (inQuotes) throw new Error('CSV contains an unterminated quoted field.');
  if (cell !== '' || row.length) {
    row.push(cell);
    if (row.some((value) => value !== '')) rows.push(row);
  }
  return rows;
}

function parseKharchaCsv(raw) {
  const rows = parseCsvRows(raw);
  if (rows.length < 1) throw new Error('CSV is empty.');
  const headers = rows[0].map((value) => String(value || '').trim());
  for (const required of REQUIRED_HEADERS) {
    if (!headers.includes(required)) throw new Error(`CSV is missing required column: ${required}`);
  }

  return rows.slice(1).map((values) => {
    const record = {};
    headers.forEach((header, index) => { record[header] = values[index] ?? ''; });
    return record;
  });
}

function lower(value) {
  return String(value || '').trim().toLowerCase();
}

function positiveNumber(value) {
  return normalizeAmount(String(value ?? '').replace(/,/g, ''));
}

function importHash(input) {
  let hash = 0x811c9dc5;
  const text = String(input);
  for (let index = 0; index < text.length; index += 1) {
    hash ^= text.charCodeAt(index);
    hash = Math.imul(hash, 0x01000193) >>> 0;
  }
  return hash.toString(16).padStart(8, '0');
}

function transactionSignature(item) {
  return [
    item?.date || '',
    item?.type || '',
    Number(item?.amount || 0).toFixed(2),
    item?.category || '',
    item?.note || '',
    item?.walletId || '',
    item?.fromWalletId || '',
    item?.toWalletId || '',
  ].join('|');
}

function namedMap(items = []) {
  const map = new Map();
  for (const item of items) {
    if (item?.name) map.set(lower(item.name), item);
  }
  return map;
}

function prepareTransactionImport(rawCsv, state = {}) {
  const rows = parseKharchaCsv(rawCsv);
  const settings = state.settings || {};
  const wallets = settings.wallets || [];
  const defaultWallet = wallets[0] || { id: 'cash', name: 'Cash' };
  const walletMap = namedMap(wallets);
  const eventMap = namedMap(state.nepalData?.events || []);
  const householdMap = namedMap(state.planningData?.householdBudgets || []);
  const savingsMap = namedMap(state.planningData?.savingsGoals || []);
  const udharoIds = new Set((state.nepalData?.udharo || []).map((item) => item.id));
  const obligations = new Map((state.planningData?.obligations || []).map((item) => [item.id, item]));
  const recurringIds = new Set((settings.recurringTransactions || []).map((item) => item.id));

  const existingIds = new Set((state.transactions || []).map((item) => item.id).filter(Boolean));
  const existingSignatures = new Set((state.transactions || []).map(transactionSignature));
  const transactions = [];
  const duplicates = [];
  const invalid = [];
  const warnings = [];

  rows.forEach((row, index) => {
    const rowNumber = index + 2;
    const transactionId = String(row['Transaction ID'] || '').trim();
    const date = String(row['Date AD'] || '').trim();
    const type = lower(row.Type);
    const amount = positiveNumber(row['Amount NPR']);
    const category = String(row.Category || '').trim();

    if (!isValidIsoDate(date) || !['income', 'expense', 'transfer'].includes(type) || !amount || !category) {
      invalid.push({ rowNumber, transactionId, reason: 'Invalid date, type, amount, or category.' });
      return;
    }

    const walletName = String(row.Wallet || '').trim();
    const wallet = walletMap.get(lower(walletName)) || defaultWallet;
    if (walletName && lower(walletName) !== lower(wallet.name)) {
      warnings.push({ rowNumber, message: `Wallet "${walletName}" was not found; using ${wallet.name}.` });
    }

    const note = String(row.Note || '');
    const base = {
      id: transactionId || '',
      type,
      amount,
      category,
      note,
      date,
      walletId: wallet.id,
      paymentMethod: lower(row['Payment Method']) || (wallet.id === 'cash' ? 'cash' : 'bank'),
    };

    if (type === 'transfer') {
      const fromName = String(row['Transfer From'] || row.Wallet || '').trim();
      const toName = String(row['Transfer To'] || '').trim();
      const fromWallet = walletMap.get(lower(fromName));
      const toWallet = walletMap.get(lower(toName));
      if (!fromWallet || !toWallet || fromWallet.id === toWallet.id) {
        invalid.push({ rowNumber, transactionId, reason: 'Transfer wallets must both exist and be different.' });
        return;
      }
      base.walletId = fromWallet.id;
      base.fromWalletId = fromWallet.id;
      base.toWalletId = toWallet.id;
      base.paymentMethod = 'transfer';
    }

    const signature = transactionSignature(base);
    if ((transactionId && existingIds.has(transactionId)) || (!transactionId && existingSignatures.has(signature))) {
      duplicates.push({ rowNumber, transactionId, signature });
      return;
    }

    base.id = transactionId || `import-${importHash(signature)}`;
    if (existingIds.has(base.id) || transactions.some((item) => item.id === base.id)) {
      duplicates.push({ rowNumber, transactionId: base.id, signature });
      return;
    }
    base.createdAt = `${date}T00:00:00.000Z`;

    const eventName = String(row.Event || '').trim();
    if (eventName) {
      const event = eventMap.get(lower(eventName));
      if (event) base.eventId = event.id;
      else warnings.push({ rowNumber, message: `Event "${eventName}" was not found; event link omitted.` });
    }

    const householdName = String(row['Household Budget'] || '').trim();
    if (householdName) {
      const household = householdMap.get(lower(householdName));
      if (household) {
        base.householdBudgetId = household.id;
        const member = String(row['Household Member'] || '').trim();
        if (member) base.householdMember = member;
      } else {
        warnings.push({ rowNumber, message: `Household budget "${householdName}" was not found; household link omitted.` });
      }
    }

    const remittanceFields = [
      row['Remittance Sender'], row['Remittance Country'], row['Remittance Original Currency'],
      row['Remittance Original Amount'], row['Remittance Fee NPR'],
    ];
    if (category === 'Remittance' || remittanceFields.some((value) => String(value || '').trim())) {
      base.remittance = {
        sender: String(row['Remittance Sender'] || '').trim(),
        country: String(row['Remittance Country'] || '').trim(),
        currency: String(row['Remittance Original Currency'] || '').trim().toUpperCase(),
        foreignAmount: Number(String(row['Remittance Original Amount'] || '0').replace(/,/g, '')) || 0,
        fees: Number(String(row['Remittance Fee NPR'] || '0').replace(/,/g, '')) || 0,
      };
    }

    const udharoId = String(row['Udhaaro Record ID'] || '').trim();
    if (udharoId) {
      if (udharoIds.has(udharoId)) base.udharoPayment = { recordId: udharoId };
      else warnings.push({ rowNumber, message: `Udhaaro record "${udharoId}" was not found; link omitted.` });
    }

    const obligationId = String(row['Obligation ID'] || '').trim();
    if (obligationId) {
      const obligation = obligations.get(obligationId);
      if (obligation) {
        base.obligationPayment = {
          obligationId,
          cycleKey: obligation.frequency === 'once' ? 'once' : date.slice(0, 7),
        };
      } else {
        warnings.push({ rowNumber, message: `Obligation "${obligationId}" was not found; link omitted.` });
      }
    }

    const savingsName = String(row['Savings Goal'] || '').trim();
    const savingsDirection = lower(row['Savings Direction']);
    if (savingsName) {
      const goal = savingsMap.get(lower(savingsName));
      if (goal && ['deposit', 'withdrawal'].includes(savingsDirection)) {
        base.savingsGoalMovement = { goalId: goal.id, direction: savingsDirection };
      } else {
        warnings.push({ rowNumber, message: `Savings goal "${savingsName}" could not be linked.` });
      }
    }

    const recurringId = String(row['Recurring ID'] || '').trim();
    if (recurringId) {
      if (recurringIds.has(recurringId)) base.recurringId = recurringId;
      else warnings.push({ rowNumber, message: `Recurring rule "${recurringId}" was not found; link omitted.` });
    }

    transactions.push(base);
    existingIds.add(base.id);
    existingSignatures.add(signature);
  });

  return { transactions, duplicates, invalid, warnings, totalRows: rows.length };
}

function mergeImportedTransactions(existing = [], imported = []) {
  const ids = new Set(existing.map((item) => item.id).filter(Boolean));
  const merged = [...existing];
  for (const item of imported) {
    if (!item?.id || ids.has(item.id)) continue;
    merged.push(item);
    ids.add(item.id);
  }
  return merged.sort((a, b) => {
    const byDate = String(b?.date || '').localeCompare(String(a?.date || ''));
    if (byDate !== 0) return byDate;
    return String(b?.createdAt || b?.id || '').localeCompare(String(a?.createdAt || a?.id || ''));
  });
}

function validMonthKey(monthKey) {
  const match = /^(\d{4})-(\d{2})$/.exec(String(monthKey || ''));
  return Boolean(match && Number(match[2]) >= 1 && Number(match[2]) <= 12);
}

function prepareMonthDeletion(state = {}, monthKey) {
  if (!validMonthKey(monthKey)) throw new Error('A valid month is required.');
  const transactions = state.transactions || [];
  const removed = transactions.filter((item) => String(item?.date || '').slice(0, 7) === monthKey);
  const remaining = transactions.filter((item) => String(item?.date || '').slice(0, 7) !== monthKey);

  const skippedByRule = new Map();
  for (const item of removed) {
    if (!item?.recurringId || !item?.id) continue;
    const list = skippedByRule.get(item.recurringId) || [];
    list.push(item.id);
    skippedByRule.set(item.recurringId, list);
  }

  const settings = {
    ...(state.settings || {}),
    recurringTransactions: (state.settings?.recurringTransactions || []).map((rule) => ({
      ...rule,
      skippedOccurrences: [
        ...new Set([...(rule.skippedOccurrences || []), ...(skippedByRule.get(rule.id) || [])]),
      ],
    })),
  };

  const filteredUdhaaro = (state.nepalData?.udharo || []).map((record) => ({
    ...record,
    repayments: (record.repayments || []).filter((repayment) => {
      if (repayment.transactionId) return true;
      return String(repayment.date || '').slice(0, 7) !== monthKey;
    }),
  }));

  const nepalData = {
    ...(state.nepalData || {}),
    udharo: reconcileUdhaaroRecords(filteredUdhaaro, remaining),
  };

  return {
    removedCount: removed.length,
    state: {
      transactions: remaining,
      settings,
      nepalData,
      planningData: state.planningData || {},
    },
  };
}

module.exports = {
  parseKharchaCsv,
  prepareTransactionImport,
  mergeImportedTransactions,
  prepareMonthDeletion,
};
