const test = require('node:test');
const assert = require('node:assert/strict');
const { normalizeReminderSettings, buildReminderPlan } = require('../src/domain/reminders');

const state = {
  transactions: [
    { id:'goal-deposit', type:'expense', amount:1000, category:'Savings Goal', note:'Emergency', date:'2026-09-01', walletId:'bank', savingsGoalMovement:{goalId:'g1',direction:'deposit'} },
  ],
  planningData: {
    obligations:[
      { id:'o1', kind:'bill', name:'Internet', amount:2000, frequency:'monthly', dueDay:25, startMonth:'2026-09', category:'Bills', active:true },
      { id:'o2', kind:'emi', name:'Old EMI', amount:5000, frequency:'once', dueDate:'2026-09-10', category:'EMI', active:true },
    ],
    savingsGoals:[
      { id:'g1', name:'Emergency fund', targetAmount:10000, targetDate:'2026-09-30', active:true },
      { id:'g2', name:'Finished goal', targetAmount:1000, targetDate:'2026-09-28', active:true },
    ],
    householdBudgets:[],
  },
  nepalData: {
    udharo:[
      { id:'u1', direction:'lent', person:'Ram', amount:5000, dueDate:'2026-09-23', repayments:[{amount:1000,date:'2026-09-05'}], status:'active' },
      { id:'u2', direction:'borrowed', person:'Settled', amount:1000, dueDate:'2026-09-24', repayments:[{amount:1000,date:'2026-09-05'}], status:'settled' },
    ],
    events:[],
  },
};

test('normalizeReminderSettings defaults to opt-in disabled with useful categories enabled', () => {
  assert.deepEqual(normalizeReminderSettings(), {
    enabled:false,
    bills:true,
    udharo:true,
    savings:true,
    leadDays:1,
  });
  assert.equal(normalizeReminderSettings({ enabled:true, leadDays:7 }).enabled,true);
  assert.equal(normalizeReminderSettings({ enabled:true, leadDays:99 }).leadDays,1);
});

test('disabled reminders produce no schedule', () => {
  assert.deepEqual(buildReminderPlan(state,'2026-09-21',{enabled:false}),[]);
});

test('reminder plan schedules lead and due-day reminders for upcoming obligations', () => {
  const plan=buildReminderPlan(state,'2026-09-21',{enabled:true,bills:true,udharo:false,savings:false,leadDays:1});
  assert.deepEqual(plan.map(item=>[item.kind,item.entityId,item.stage,item.date]),[
    ['obligation','o1','lead','2026-09-24'],
    ['obligation','o1','due','2026-09-25'],
  ]);
});

test('reminder plan schedules outstanding Udhaaro but ignores settled records', () => {
  const plan=buildReminderPlan(state,'2026-09-21',{enabled:true,bills:false,udharo:true,savings:false,leadDays:1});
  assert.deepEqual(plan.map(item=>[item.kind,item.entityId,item.stage,item.date,item.amount]),[
    ['udharo','u1','lead','2026-09-22',4000],
    ['udharo','u1','due','2026-09-23',4000],
  ]);
});

test('reminder plan schedules active savings targets only while money remains', () => {
  const completedState={
    ...state,
    transactions:[
      ...state.transactions,
      { id:'goal-done', type:'expense', amount:1000, category:'Savings Goal', note:'Finished', date:'2026-09-02', walletId:'bank', savingsGoalMovement:{goalId:'g2',direction:'deposit'} },
    ],
  };
  const plan=buildReminderPlan(completedState,'2026-09-21',{enabled:true,bills:false,udharo:false,savings:true,leadDays:1});
  assert.deepEqual(plan.map(item=>[item.kind,item.entityId,item.stage,item.date,item.amount]),[
    ['savings','g1','lead','2026-09-29',9000],
    ['savings','g1','due','2026-09-30',9000],
  ]);
});

test('leadDays zero creates a single due reminder instead of duplicate notifications', () => {
  const plan=buildReminderPlan(state,'2026-09-21',{enabled:true,bills:false,udharo:true,savings:false,leadDays:0});
  assert.deepEqual(plan.map(item=>[item.stage,item.date]),[['due','2026-09-23']]);
});

test('past due dates are not scheduled as fresh device notifications', () => {
  const plan=buildReminderPlan(state,'2026-09-26',{enabled:true,bills:true,udharo:true,savings:false,leadDays:1});
  assert.deepEqual(plan,[]);
});
