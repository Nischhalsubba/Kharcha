const { isValidIsoDate } = require('./finance');
const { obligationStatus, savingsGoalStatus } = require('./phaseThree');
const { udharoOutstanding } = require('./phaseTwo');

const DEFAULT_REMINDER_SETTINGS = {
  enabled: false,
  bills: true,
  udharo: true,
  savings: true,
  leadDays: 1,
};

function normalizeReminderSettings(settings = {}) {
  const leadDays = [0, 1, 2, 3, 7].includes(Number(settings.leadDays))
    ? Number(settings.leadDays)
    : DEFAULT_REMINDER_SETTINGS.leadDays;
  return {
    enabled: settings.enabled === true,
    bills: settings.bills !== false,
    udharo: settings.udharo !== false,
    savings: settings.savings !== false,
    leadDays,
  };
}

function addDays(value, amount) {
  if (!isValidIsoDate(value)) return null;
  const [year, month, day] = value.split('-').map(Number);
  const date = new Date(Date.UTC(year, month - 1, day + amount));
  return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, '0')}-${String(date.getUTCDate()).padStart(2, '0')}`;
}

function addEntityReminders(plan, entity, settings, today) {
  const dueDate = entity.dueDate;
  if (!isValidIsoDate(dueDate) || dueDate < today) return;
  const leadDate = addDays(dueDate, -settings.leadDays);
  if (settings.leadDays > 0 && leadDate >= today && leadDate !== dueDate) {
    plan.push({ ...entity, stage: 'lead', date: leadDate });
  }
  plan.push({ ...entity, stage: 'due', date: dueDate });
}

function buildReminderPlan(state = {}, today, inputSettings = {}) {
  const settings = normalizeReminderSettings(inputSettings);
  if (!settings.enabled || !isValidIsoDate(today)) return [];
  const transactions = Array.isArray(state.transactions) ? state.transactions : [];
  const planningData = state.planningData || {};
  const nepalData = state.nepalData || {};
  const plan = [];

  if (settings.bills) {
    for (const obligation of planningData.obligations || []) {
      if (obligation?.active === false) continue;
      const status = obligationStatus(obligation, transactions, today);
      if (!status?.remaining || !status?.dueDate) continue;
      addEntityReminders(plan, {
        kind: 'obligation',
        entityId: obligation.id,
        name: obligation.name || 'Payment',
        amount: status.remaining,
        dueDate: status.dueDate,
      }, settings, today);
    }
  }

  if (settings.udharo) {
    for (const record of nepalData.udharo || []) {
      if (record?.status === 'settled') continue;
      const outstanding = udharoOutstanding(record);
      if (!outstanding || !record?.dueDate) continue;
      addEntityReminders(plan, {
        kind: 'udharo',
        entityId: record.id,
        name: record.person || 'Udhaaro',
        amount: outstanding,
        dueDate: record.dueDate,
        direction: record.direction,
      }, settings, today);
    }
  }

  if (settings.savings) {
    for (const goal of planningData.savingsGoals || []) {
      if (goal?.active === false || !goal?.targetDate) continue;
      const status = savingsGoalStatus(goal, transactions);
      if (!status?.remaining) continue;
      addEntityReminders(plan, {
        kind: 'savings',
        entityId: goal.id,
        name: goal.name || 'Savings goal',
        amount: status.remaining,
        dueDate: goal.targetDate,
      }, settings, today);
    }
  }

  return plan.sort((a, b) => {
    const byDate = a.date.localeCompare(b.date);
    if (byDate) return byDate;
    const byKind = a.kind.localeCompare(b.kind);
    if (byKind) return byKind;
    const byEntity = String(a.entityId).localeCompare(String(b.entityId));
    if (byEntity) return byEntity;
    return a.stage === 'lead' ? -1 : 1;
  });
}

module.exports = {
  DEFAULT_REMINDER_SETTINGS,
  normalizeReminderSettings,
  buildReminderPlan,
};
