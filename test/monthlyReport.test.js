const test=require('node:test');
const assert=require('node:assert/strict');
const { buildMonthlyReport, renderMonthlyReportHtml }=require('../src/domain/monthlyReport');

const state={
  transactions:[
    {id:'salary',type:'income',amount:100000,category:'Salary',note:'Salary',date:'2026-09-01',walletId:'bank'},
    {id:'food',type:'expense',amount:5000,category:'Food',note:'<script>alert(1)</script>',date:'2026-09-05',walletId:'cash'},
    {id:'remit',type:'income',amount:20000,category:'Remittance',note:'Dai',date:'2026-09-10',walletId:'bank',remittance:{currency:'QAR',foreignAmount:540,fees:200}},
    {id:'saving',type:'expense',amount:3000,category:'Savings Goal',note:'Emergency',date:'2026-09-12',walletId:'bank',savingsGoalMovement:{goalId:'g1',direction:'deposit'}},
    {id:'emi',type:'expense',amount:4000,category:'EMI',note:'Bike EMI',date:'2026-09-15',walletId:'bank',obligationPayment:{obligationId:'o1',cycleKey:'2026-09'}},
    {id:'old',type:'expense',amount:999,date:'2026-08-30',category:'Food',walletId:'cash'},
  ],
  settings:{
    currency:'NPR',monthlyBudget:30000,language:'en',amountFormat:'standard',
    wallets:[{id:'cash',name:'Cash',openingBalance:10000},{id:'bank',name:'Bank',openingBalance:5000}],
    categoryBudgets:{Food:10000},
  },
  nepalData:{
    udharo:[{id:'u1',direction:'lent',person:'Ram',amount:7000,repayments:[{amount:2000,date:'2026-09-02'}],status:'active'}],
    events:[],
  },
  planningData:{
    obligations:[{id:'o1',kind:'emi',name:'Bike EMI',amount:4000,frequency:'monthly',dueDay:15,startMonth:'2026-09',active:true}],
    savingsGoals:[{id:'g1',name:'Emergency fund',targetAmount:10000,targetDate:'2026-12-31',active:true}],
    householdBudgets:[{id:'h1',name:'Home',monthlyLimit:20000,members:['A']}],
  },
};

test('monthly report excludes savings transfers from income/spend summary but keeps savings progress',()=>{
  const report=buildMonthlyReport(state,'2026-09',{asOfDate:'2026-09-21'});
  assert.equal(report.summary.income,120000);
  assert.equal(report.summary.expense,9000);
  assert.equal(report.summary.net,111000);
  assert.equal(report.summary.transactionCount,5);
  assert.equal(report.savings.saved,3000);
  assert.equal(report.savings.target,10000);
  assert.equal(report.remittance.nprReceived,20000);
  assert.equal(report.remittance.fees,200);
});

test('monthly report includes budget, top category, Udhaaro and obligation state',()=>{
  const report=buildMonthlyReport(state,'2026-09',{asOfDate:'2026-09-21'});
  assert.equal(report.budget.limit,30000);
  assert.equal(report.budget.spent,9000);
  assert.equal(report.categories[0].category,'Food');
  assert.equal(report.categories[0].amount,5000);
  assert.equal(report.udharo.lent,5000);
  assert.equal(report.obligations.remaining,0);
  assert.equal(report.obligations.overdueCount,0);
});

test('monthly report exposes AD and BS month boundaries',()=>{
  const report=buildMonthlyReport(state,'2026-09',{asOfDate:'2026-09-21'});
  assert.equal(report.period.startAd,'2026-09-01');
  assert.equal(report.period.endAd,'2026-09-30');
  assert.match(report.period.startBs,/^2083-/);
  assert.match(report.period.endBs,/^2083-/);
});

test('PDF HTML escapes transaction notes and renders key report sections',()=>{
  const report=buildMonthlyReport(state,'2026-09',{asOfDate:'2026-09-21'});
  const html=renderMonthlyReportHtml(report,state.settings);
  assert.match(html,/Kharcha Monthly Report/);
  assert.match(html,/Income/);
  assert.match(html,/Expenses/);
  assert.match(html,/Savings goals/);
  assert.match(html,/Udhaaro/);
  assert.match(html,/&lt;script&gt;alert\(1\)&lt;\/script&gt;/);
  assert.doesNotMatch(html,/<script>alert\(1\)<\/script>/);
});

test('invalid report month fails closed',()=>{
  assert.throws(()=>buildMonthlyReport(state,'2026-13'),/month/i);
});


test('historical monthly report ignores later savings and Udhaaro repayments',()=>{
  const futureState={
    ...state,
    transactions:[
      ...state.transactions,
      {id:'future-saving',type:'expense',amount:2500,category:'Savings Goal',date:'2026-10-02',walletId:'bank',savingsGoalMovement:{goalId:'g1',direction:'deposit'}},
    ],
    nepalData:{
      ...state.nepalData,
      udharo:[{...state.nepalData.udharo[0],repayments:[
        ...state.nepalData.udharo[0].repayments,
        {amount:3000,date:'2026-10-01'},
      ]}],
    },
  };
  const report=buildMonthlyReport(futureState,'2026-09',{asOfDate:'2026-09-30'});
  assert.equal(report.savings.saved,3000);
  assert.equal(report.udharo.lent,5000);
});
