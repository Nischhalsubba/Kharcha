const test=require('node:test');
const assert=require('node:assert/strict');
const {
  parseKharchaCsv,
  prepareTransactionImport,
  mergeImportedTransactions,
  prepareMonthDeletion,
}=require('../src/domain/dataManagement');

const csv='\uFEFFDate AD,Date BS,Type,Amount NPR,Category,Note,Wallet,Payment Method,Event,Household Budget,Household Member,Remittance Sender,Remittance Country,Remittance Original Currency,Remittance Original Amount,Remittance Fee NPR,Udhaaro Record ID,Obligation ID,Savings Goal,Savings Direction,Recurring ID,Transaction ID\n'
  +'2026-09-01,2083-05-16,expense,1200,Food,"Khaja, tea",Cash,cash,,,,,,,,,,,,,,tx-1\n'
  +'2026-09-02,2083-05-17,income,20000,Remittance,Dai,Bank,bank,,,,"Dai","Qatar",QAR,540,200,,,,,,tx-2\n';

const state={
  transactions:[{id:'tx-1',type:'expense',amount:1200,category:'Food',note:'Khaja, tea',date:'2026-09-01',walletId:'cash'}],
  settings:{
    wallets:[{id:'cash',name:'Cash'},{id:'bank',name:'Bank'}],
    recurringTransactions:[{id:'rent-rule',active:true,skippedOccurrences:[]}],
  },
  nepalData:{
    udharo:[{id:'u1',direction:'borrowed',amount:5000,repayments:[{amount:1000,date:'2026-09-05',transactionId:'rent-pay'}],status:'active'}],
    events:[],
  },
  planningData:{obligations:[],savingsGoals:[],householdBudgets:[]},
};

test('Kharcha CSV parser handles BOM and quoted commas',()=>{
  const rows=parseKharchaCsv(csv);
  assert.equal(rows.length,2);
  assert.equal(rows[0].Note,'Khaja, tea');
  assert.equal(rows[1]['Remittance Country'],'Qatar');
});

test('transaction import previews duplicates and reconstructs remittance metadata',()=>{
  const preview=prepareTransactionImport(csv,state);
  assert.equal(preview.duplicates.length,1);
  assert.equal(preview.transactions.length,1);
  assert.equal(preview.invalid.length,0);
  assert.equal(preview.transactions[0].id,'tx-2');
  assert.equal(preview.transactions[0].walletId,'bank');
  assert.deepEqual(preview.transactions[0].remittance,{
    sender:'Dai',country:'Qatar',currency:'QAR',foreignAmount:540,fees:200,
  });
});

test('transaction import rejects rows with impossible dates or invalid money',()=>{
  const bad=csv+'2026-13-01,,expense,-10,Food,Bad,Cash,cash,,,,,,,,,,,,,,bad\n';
  const preview=prepareTransactionImport(bad,state);
  assert.equal(preview.invalid.length,1);
  assert.equal(preview.invalid[0].transactionId,'bad');
});

test('imported transactions merge newest-first without replacing existing duplicates',()=>{
  const preview=prepareTransactionImport(csv,state);
  const merged=mergeImportedTransactions(state.transactions,preview.transactions);
  assert.equal(merged.length,2);
  assert.equal(merged[0].id,'tx-2');
  assert.equal(merged[1].id,'tx-1');
});

test('clear month permanently skips deleted recurring occurrences and reconciles Udhaaro',()=>{
  const destructiveState={
    ...state,
    transactions:[
      {id:'rent-occurrence',type:'expense',amount:15000,date:'2026-09-01',category:'Rent',walletId:'cash',recurringId:'rent-rule'},
      {id:'rent-pay',type:'expense',amount:1000,date:'2026-09-05',category:'Udhaaro Repayment',walletId:'cash',udharoPayment:{recordId:'u1'}},
      {id:'october',type:'expense',amount:500,date:'2026-10-01',category:'Food',walletId:'cash'},
    ],
  };
  const result=prepareMonthDeletion(destructiveState,'2026-09');
  assert.equal(result.removedCount,2);
  assert.deepEqual(result.state.transactions.map(item=>item.id),['october']);
  assert.deepEqual(result.state.settings.recurringTransactions[0].skippedOccurrences,['rent-occurrence']);
  assert.equal(result.state.nepalData.udharo[0].repayments.length,0);
  assert.equal(result.state.nepalData.udharo[0].status,'active');
});

test('clear month rejects an invalid month',()=>{
  assert.throws(()=>prepareMonthDeletion(state,'2026-13'),/month/i);
});


test('transaction import restores wallet transfer endpoints without changing them into income or expense',()=>{
  const transferCsv='\uFEFFDate AD,Date BS,Type,Amount NPR,Category,Note,Wallet,Payment Method,Transfer From,Transfer To,Event,Household Budget,Household Member,Remittance Sender,Remittance Country,Remittance Original Currency,Remittance Original Amount,Remittance Fee NPR,Udhaaro Record ID,Obligation ID,Savings Goal,Savings Direction,Recurring ID,Transaction ID\n'
    +'2026-09-10,,transfer,5000,Transfer,Cash to bank,Cash,transfer,Cash,Bank,,,,,,,,,,,,,,,transfer-1\n';
  const preview=prepareTransactionImport(transferCsv,state);
  assert.equal(preview.invalid.length,0);
  assert.equal(preview.transactions.length,1);
  assert.equal(preview.transactions[0].type,'transfer');
  assert.equal(preview.transactions[0].fromWalletId,'cash');
  assert.equal(preview.transactions[0].toWalletId,'bank');
  assert.equal(preview.transactions[0].walletId,'cash');
  assert.equal(preview.transactions[0].paymentMethod,'transfer');
});

test('transaction import rejects transfers with missing or identical wallets',()=>{
  const transferCsv='\uFEFFDate AD,Type,Amount NPR,Category,Note,Wallet,Payment Method,Transfer From,Transfer To,Transaction ID\n'
    +'2026-09-10,transfer,5000,Transfer,Bad transfer,Cash,transfer,Cash,Cash,transfer-bad\n';
  const preview=prepareTransactionImport(transferCsv,state);
  assert.equal(preview.transactions.length,0);
  assert.equal(preview.invalid.length,1);
  assert.match(preview.invalid[0].reason,/different/i);
});
