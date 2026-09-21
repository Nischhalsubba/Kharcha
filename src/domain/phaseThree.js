function safeAmount(value) {
  const amount = Number(value);
  return Number.isFinite(amount) && amount > 0 ? amount : 0;
}

function normalizePlanningData(data = {}) {
  return {
    obligations: Array.isArray(data.obligations) ? data.obligations.map((item) => ({ ...item })) : [],
    savingsGoals: Array.isArray(data.savingsGoals) ? data.savingsGoals.map((item) => ({ ...item })) : [],
    householdBudgets: Array.isArray(data.householdBudgets) ? data.householdBudgets.map((item) => ({ ...item })) : [],
  };
}

function dueDateForMonth(monthKey, rawDueDay) {
  const match = /^(\d{4})-(\d{2})$/.exec(String(monthKey || ''));
  if (!match) return null;
  const year = Number(match[1]);
  const month = Number(match[2]);
  if (month < 1 || month > 12) return null;
  const requested = Math.max(1, Math.min(31, Math.trunc(Number(rawDueDay) || 1)));
  const lastDay = new Date(Date.UTC(year, month, 0)).getUTCDate();
  return `${year}-${String(month).padStart(2, '0')}-${String(Math.min(requested, lastDay)).padStart(2, '0')}`;
}

function cycleFor(obligation, date) {
  return obligation?.frequency === 'once' ? 'once' : String(date || '').slice(0, 7);
}

function dueDateFor(obligation, cycleKey) {
  if (obligation?.frequency === 'once') return obligation.dueDate || null;
  return dueDateForMonth(cycleKey, obligation?.dueDay);
}

function linkedPaymentTotal(obligationId, cycleKey, transactions = []) {
  return transactions.reduce((sum, item) => {
    if (item?.type !== 'expense') return sum;
    if (item?.obligationPayment?.obligationId !== obligationId) return sum;
    if (item?.obligationPayment?.cycleKey !== cycleKey) return sum;
    return sum + safeAmount(item.amount);
  }, 0);
}

function obligationStatus(obligation, transactions = [], today) {
  const cycleKey = cycleFor(obligation, today);
  const dueDate = dueDateFor(obligation, cycleKey);
  const amountDue = safeAmount(obligation?.amount);
  const paid = Math.min(linkedPaymentTotal(obligation?.id, cycleKey, transactions), amountDue);
  const remaining = Math.max(amountDue - paid, 0);
  let state = 'upcoming';
  if (obligation?.active === false) state = 'inactive';
  else if (remaining === 0 && amountDue > 0) state = 'paid';
  else if (dueDate && today > dueDate) state = 'overdue';
  else if (dueDate && today === dueDate) state = 'due';
  return { id: obligation?.id, cycleKey, dueDate, amountDue, paid, remaining, state };
}

function defaultObligationCategory(kind) {
  if (kind === 'emi') return 'EMI';
  if (kind === 'loan') return 'Loan Repayment';
  return 'Bills';
}

function createObligationPaymentTransaction(obligation, transactions, rawAmount, date, walletId, meta = {}) {
  const status = obligationStatus(obligation, transactions, date);
  const requested = safeAmount(rawAmount);
  const amount = Math.min(requested, status.remaining);
  if (!amount || !walletId) return null;
  const id = meta.id || `obligation-payment-${Date.now()}`;
  return {
    id,
    type: 'expense',
    amount,
    category: obligation.category || defaultObligationCategory(obligation.kind),
    note: obligation.name || 'Obligation payment',
    date,
    walletId,
    paymentMethod: 'bank',
    createdAt: meta.createdAt || new Date().toISOString(),
    obligationPayment: { obligationId: obligation.id, cycleKey: status.cycleKey },
  };
}

function repaymentTotal(record) {
  return (record?.repayments || []).reduce((sum, item) => sum + safeAmount(item.amount), 0);
}

function udharoOutstanding(record) {
  return Math.max(safeAmount(record?.amount) - repaymentTotal(record), 0);
}

function recordUdhaaroPayment(record, rawAmount, date, walletId, meta = {}) {
  const requested = safeAmount(rawAmount);
  const amount = Math.min(requested, udharoOutstanding(record));
  if (!amount || !walletId) return null;
  const transactionId = meta.transactionId || `udharo-payment-${Date.now()}`;
  const repayments = [...(record.repayments || []), { amount, date, transactionId }];
  const remaining = Math.max(safeAmount(record.amount) - repayments.reduce((sum, item) => sum + safeAmount(item.amount), 0), 0);
  const updatedRecord = { ...record, repayments, status: remaining === 0 ? 'settled' : 'active' };
  const transaction = {
    id: transactionId,
    type: record.direction === 'lent' ? 'income' : 'expense',
    amount,
    category: 'Udhaaro Repayment',
    note: `Udhaaro · ${record.person || ''}`.trim(),
    date,
    walletId,
    paymentMethod: walletId === 'cash' ? 'cash' : 'bank',
    createdAt: meta.createdAt || new Date().toISOString(),
    udharoPayment: { recordId: record.id },
  };
  return { record: updatedRecord, transaction, outstanding: remaining };
}

function reverseUdhaaroPayment(record, transactionId) {
  const repayments = (record?.repayments || []).filter((item) => item.transactionId !== transactionId);
  const remaining = Math.max(safeAmount(record?.amount) - repayments.reduce((sum, item) => sum + safeAmount(item.amount), 0), 0);
  return { ...record, repayments, status: remaining === 0 ? 'settled' : 'active' };
}

function savingsGoalStatus(goal, transactions = []) {
  const targetAmount = safeAmount(goal?.targetAmount);
  let saved = 0;
  for (const item of transactions) {
    if (item?.savingsGoalMovement?.goalId !== goal?.id) continue;
    const amount = safeAmount(item.amount);
    if (item.savingsGoalMovement.direction === 'deposit') saved += amount;
    if (item.savingsGoalMovement.direction === 'withdrawal') saved -= amount;
  }
  saved = Math.max(saved, 0);
  const remaining = Math.max(targetAmount - saved, 0);
  return {
    id: goal?.id,
    targetAmount,
    saved,
    remaining,
    progress: targetAmount > 0 ? Math.min(saved / targetAmount, 1) : 0,
  };
}

function createSavingsGoalTransaction(goal, transactions, rawAmount, date, walletId, direction, meta = {}) {
  const status = savingsGoalStatus(goal, transactions);
  const requested = safeAmount(rawAmount);
  const available = direction === 'withdrawal' ? status.saved : status.remaining;
  const amount = Math.min(requested, available);
  if (!amount || !walletId || !['deposit', 'withdrawal'].includes(direction)) return null;
  return {
    id: meta.id || `savings-${Date.now()}`,
    type: direction === 'deposit' ? 'expense' : 'income',
    amount,
    category: 'Savings Goal',
    note: goal?.name || 'Savings goal',
    date,
    walletId,
    paymentMethod: walletId === 'cash' ? 'cash' : 'bank',
    createdAt: meta.createdAt || new Date().toISOString(),
    savingsGoalMovement: { goalId: goal.id, direction },
  };
}


function householdBudgetStatus(household, transactions = [], monthKey) {
  const limit = safeAmount(household?.monthlyLimit);
  let spent = 0;
  const byMember = {};
  for (const item of transactions) {
    if (item?.type !== 'expense' || item?.savingsGoalMovement) continue;
    if (item?.householdBudgetId !== household?.id || String(item?.date || '').slice(0, 7) !== monthKey) continue;
    const amount = safeAmount(item.amount);
    spent += amount;
    const member = item.householdMember || 'Unassigned';
    byMember[member] = (byMember[member] || 0) + amount;
  }
  return {
    id: household?.id,
    limit,
    spent,
    remaining: Math.max(limit - spent, 0),
    overBy: Math.max(spent - limit, 0),
    progress: limit > 0 ? Math.min(spent / limit, 1) : 0,
    byMember,
  };
}

function planningAnalytics(planningData = {}, transactions = [], today) {
  const monthKey = String(today || '').slice(0, 7);
  const obligations = (planningData.obligations || []).map((item) => obligationStatus(item, transactions, today));
  const activeObligations = obligations.filter((item) => item.state !== 'inactive' && item.remaining > 0);
  const goals = (planningData.savingsGoals || []).map((item) => savingsGoalStatus(item, transactions));
  const households = (planningData.householdBudgets || []).map((item) => householdBudgetStatus(item, transactions, monthKey));
  const nextDue = activeObligations.map((item) => item.dueDate).filter(Boolean).sort()[0] || null;
  return {
    obligationRemaining: activeObligations.reduce((sum, item) => sum + item.remaining, 0),
    overdueCount: activeObligations.filter((item) => item.state === 'overdue').length,
    nextDueDate: nextDue,
    savingsSaved: goals.reduce((sum, item) => sum + item.saved, 0),
    savingsTarget: goals.reduce((sum, item) => sum + item.targetAmount, 0),
    householdSpent: households.reduce((sum, item) => sum + item.spent, 0),
    householdLimit: households.reduce((sum, item) => sum + item.limit, 0),
  };
}

module.exports = {
  normalizePlanningData,
  dueDateForMonth,
  obligationStatus,
  createObligationPaymentTransaction,
  recordUdhaaroPayment,
  reverseUdhaaroPayment,
  savingsGoalStatus,
  createSavingsGoalTransaction,
  householdBudgetStatus,
  planningAnalytics,
};
