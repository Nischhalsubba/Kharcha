function safeAmount(value) {
  const amount = Number(value);
  return Number.isFinite(amount) && amount > 0 ? amount : 0;
}

function normalizeNepalData(data = {}) {
  return {
    udharo: Array.isArray(data.udharo)
      ? data.udharo.map((item) => ({ ...item, repayments: Array.isArray(item.repayments) ? item.repayments : [] }))
      : [],
    events: Array.isArray(data.events) ? data.events.map((item) => ({ ...item })) : [],
  };
}

function repaymentTotal(record) {
  return (record.repayments || []).reduce((sum, item) => sum + safeAmount(item.amount), 0);
}

function udharoOutstanding(record) {
  return Math.max(safeAmount(record.amount) - repaymentTotal(record), 0);
}

function udharoSummary(records = []) {
  let borrowed = 0;
  let lent = 0;
  for (const record of records) {
    const outstanding = udharoOutstanding(record);
    if (record.direction === 'borrowed') borrowed += outstanding;
    if (record.direction === 'lent') lent += outstanding;
  }
  return { borrowed, lent, netReceivable: lent - borrowed };
}

function applyUdharoPayment(record, rawAmount, date) {
  const outstanding = udharoOutstanding(record);
  const requested = safeAmount(rawAmount);
  const amount = Math.min(requested, outstanding);
  if (!amount) return { record: { ...record }, outstanding };
  const repayments = [...(record.repayments || []), { amount, date }];
  const remaining = Math.max(safeAmount(record.amount) - repayments.reduce((sum, item) => sum + safeAmount(item.amount), 0), 0);
  return {
    record: { ...record, repayments, status: remaining === 0 ? 'settled' : 'active' },
    outstanding: remaining,
  };
}

function eventBudgetStatus(events = [], transactions = []) {
  return events.map((event) => {
    const budget = safeAmount(event.budget);
    const spent = transactions
      .filter((item) => item.type === 'expense' && item.eventId === event.id)
      .reduce((sum, item) => sum + safeAmount(item.amount), 0);
    return {
      id: event.id,
      name: event.name,
      budget,
      spent,
      remaining: Math.max(budget - spent, 0),
      overBy: Math.max(spent - budget, 0),
      progress: budget > 0 ? Math.min(spent / budget, 1) : 0,
    };
  });
}

function remittanceSummary(transactions = [], monthKey) {
  const summary = { nprReceived: 0, fees: 0, byCurrency: {}, count: 0 };
  for (const item of transactions) {
    if (!item.remittance || item.type !== 'income' || String(item.date || '').slice(0, 7) !== monthKey) continue;
    summary.nprReceived += safeAmount(item.amount);
    summary.fees += safeAmount(item.remittance.fees);
    const currency = String(item.remittance.currency || '').toUpperCase();
    if (currency) summary.byCurrency[currency] = (summary.byCurrency[currency] || 0) + safeAmount(item.remittance.foreignAmount);
    summary.count += 1;
  }
  return summary;
}

module.exports = {
  normalizeNepalData,
  udharoOutstanding,
  udharoSummary,
  applyUdharoPayment,
  eventBudgetStatus,
  remittanceSummary,
};
