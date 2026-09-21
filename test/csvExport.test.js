const test = require('node:test');
const assert = require('node:assert/strict');
const { createTransactionsCsv, filterTransactionsForExport } = require('../src/domain/csvExport');

const state = {
  transactions: [
    {
      id:'t2', type:'expense', amount:1200, category:'Food', note:'खाजा, tea', date:'2026-09-21',
      walletId:'cash', paymentMethod:'cash', householdBudgetId:'home-1', householdMember:'Reeja',
    },
    {
      id:'t1', type:'income', amount:100000, category:'Remittance', note:'=SUM(A1:A2)', date:'2026-08-15',
      walletId:'bank', paymentMethod:'bank', eventId:'event-1',
      remittance:{sender:'Dai',country:'Qatar',currency:'QAR',foreignAmount:2700,fees:500},
    },
  ],
  settings:{
    currency:'NPR',
    wallets:[{id:'cash',name:'Cash'},{id:'bank',name:'Bank'}],
  },
  nepalData:{events:[{id:'event-1',name:'Dashain'}]},
  planningData:{householdBudgets:[{id:'home-1',name:'Home',monthlyLimit:30000,members:['Nischhal','Reeja']}],savingsGoals:[]},
};

test('filterTransactionsForExport supports all, month and inclusive custom range', () => {
  assert.equal(filterTransactionsForExport(state.transactions,{scope:'all'}).length,2);
  assert.deepEqual(filterTransactionsForExport(state.transactions,{scope:'month',monthKey:'2026-09'}).map(x=>x.id),['t2']);
  assert.deepEqual(filterTransactionsForExport(state.transactions,{scope:'range',startDate:'2026-08-15',endDate:'2026-09-20'}).map(x=>x.id),['t1']);
});

test('CSV export is UTF-8 BOM compatible and includes Nepal/planning columns', () => {
  const result=createTransactionsCsv(state,{scope:'all',exportedAt:'2026-09-21T06:00:00.000Z'});
  assert.equal(result.rowCount,2);
  assert.equal(result.filename,'kharcha-transactions-all-20260921.csv');
  assert.equal(result.csv.charCodeAt(0),0xFEFF);
  assert.match(result.csv,/Date AD,Date BS,Type,Amount NPR,Category,Note,Wallet,Payment Method,Event,Household Budget,Household Member/);
  assert.match(result.csv,/2026-09-21,2083-/);
  assert.match(result.csv,/"खाजा, tea"/);
  assert.match(result.csv,/Home,Reeja/);
  assert.match(result.csv,/Dashain/);
});

test('CSV export neutralizes spreadsheet formulas in user-controlled text', () => {
  const result=createTransactionsCsv(state,{scope:'all',exportedAt:'2026-09-21T06:00:00.000Z'});
  assert.match(result.csv,/"'=SUM\(A1:A2\)"/);
  assert.doesNotMatch(result.csv,/,=SUM\(A1:A2\),/);
});

test('CSV rows are sorted oldest to newest for spreadsheet analysis', () => {
  const result=createTransactionsCsv(state,{scope:'all',exportedAt:'2026-09-21T06:00:00.000Z'});
  const lines=result.csv.replace(/^\uFEFF/,'').split('\n');
  assert.match(lines[1],/^2026-08-15,/);
  assert.match(lines[2],/^2026-09-21,/);
});

test('invalid custom date range fails closed', () => {
  assert.throws(
    ()=>filterTransactionsForExport(state.transactions,{scope:'range',startDate:'2026-09-22',endDate:'2026-09-21'}),
    /date range/i,
  );
});


test('custom export rejects impossible calendar dates', () => {
  assert.throws(
    ()=>filterTransactionsForExport(state.transactions,{scope:'range',startDate:'2026-13-01',endDate:'2026-13-05'}),
    /date range/i,
  );
});


test('CSV export uses the persisted remittance fees field', () => {
  const result=createTransactionsCsv(state,{scope:'all',exportedAt:'2026-09-21T06:00:00.000Z'});
  assert.match(result.csv,/Dai,Qatar,QAR,2700,500,/);
});
