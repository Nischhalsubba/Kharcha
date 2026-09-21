const {
  summarizeTransactions,
  categoryBreakdown,
  monthlyBudgetStatus,
  isValidIsoDate,
} = require('./finance');
const { walletBalances } = require('./phaseOne');
const { remittanceSummary, udharoSummary } = require('./phaseTwo');
const {
  obligationStatus,
  savingsGoalStatus,
  householdBudgetStatus,
} = require('./phaseThree');
const { adToBsIso, formatNpr } = require('./nepal');

function monthBounds(monthKey) {
  const match=/^(\d{4})-(\d{2})$/.exec(String(monthKey||''));
  if(!match) throw new Error('A valid report month is required.');
  const year=Number(match[1]),month=Number(match[2]);
  if(month<1||month>12) throw new Error('A valid report month is required.');
  const lastDay=new Date(year,month,0).getDate();
  const startAd=`${year}-${String(month).padStart(2,'0')}-01`;
  const endAd=`${year}-${String(month).padStart(2,'0')}-${String(lastDay).padStart(2,'0')}`;
  return {startAd,endAd};
}

function safeBs(ad) {
  try{return adToBsIso(ad);}catch{return '';}
}

function buildMonthlyReport(state={},monthKey,options={}) {
  const bounds=monthBounds(monthKey);
  const asOfDate=isValidIsoDate(options.asOfDate)
    ? options.asOfDate
    : bounds.endAd;
  const monthTransactions=(state.transactions||[])
    .filter(item=>String(item?.date||'').slice(0,7)===monthKey)
    .sort((a,b)=>String(a.date||'').localeCompare(String(b.date||'')));

  const financeSummary=summarizeTransactions(state.transactions||[],monthKey);
  const categories=categoryBreakdown(state.transactions||[],monthKey);
  const budget=monthlyBudgetStatus(state.transactions||[],monthKey,state.settings?.monthlyBudget);
  const remittance=remittanceSummary(state.transactions||[],monthKey);
  const udharo=udharoSummary(state.nepalData?.udharo||[]);

  const obligationStates=(state.planningData?.obligations||[])
    .map(item=>obligationStatus(item,state.transactions||[],asOfDate));
  const savingsStates=(state.planningData?.savingsGoals||[])
    .map(item=>savingsGoalStatus(item,state.transactions||[]));
  const householdStates=(state.planningData?.householdBudgets||[])
    .map(item=>householdBudgetStatus(item,state.transactions||[],monthKey));

  const throughAsOf=(state.transactions||[]).filter(item=>!item?.date||item.date<=asOfDate);
  const wallets=walletBalances(throughAsOf,state.settings?.wallets||[]);

  return {
    monthKey,
    asOfDate,
    period:{
      startAd:bounds.startAd,
      endAd:bounds.endAd,
      startBs:safeBs(bounds.startAd),
      endBs:safeBs(bounds.endAd),
    },
    summary:{
      income:financeSummary.income,
      expense:financeSummary.expense,
      net:financeSummary.balance,
      transactionCount:monthTransactions.length,
    },
    budget,
    categories,
    topCategory:categories[0]||null,
    remittance,
    udharo,
    obligations:{
      remaining:obligationStates.reduce((sum,item)=>sum+(Number(item.remaining)||0),0),
      overdueCount:obligationStates.filter(item=>item.state==='overdue').length,
      items:obligationStates,
    },
    savings:{
      saved:savingsStates.reduce((sum,item)=>sum+(Number(item.saved)||0),0),
      target:savingsStates.reduce((sum,item)=>sum+(Number(item.targetAmount)||0),0),
      items:savingsStates,
    },
    households:{
      spent:householdStates.reduce((sum,item)=>sum+(Number(item.spent)||0),0),
      limit:householdStates.reduce((sum,item)=>sum+(Number(item.limit)||0),0),
      items:householdStates,
    },
    wallets,
    transactions:monthTransactions,
  };
}

function escapeHtml(value) {
  return String(value??'')
    .replace(/&/g,'&amp;')
    .replace(/</g,'&lt;')
    .replace(/>/g,'&gt;')
    .replace(/"/g,'&quot;')
    .replace(/'/g,'&#39;');
}

function money(value,settings) {
  return formatNpr(value,{language:settings?.language,mode:settings?.amountFormat});
}

function row(label,value) {
  return `<div class="metric"><span>${escapeHtml(label)}</span><strong>${escapeHtml(value)}</strong></div>`;
}

function renderMonthlyReportHtml(report,settings={}) {
  const categoryRows=report.categories.length
    ? report.categories.map(item=>`<tr><td>${escapeHtml(item.category)}</td><td class="num">${escapeHtml(money(item.amount,settings))}</td></tr>`).join('')
    : '<tr><td colspan="2" class="muted">No expense categories this month.</td></tr>';

  const txRows=report.transactions.length
    ? report.transactions.map(item=>`<tr>
      <td>${escapeHtml(item.date)}</td>
      <td>${escapeHtml(item.category||'Other')}</td>
      <td>${escapeHtml(item.note||'')}</td>
      <td>${escapeHtml(item.type||'')}</td>
      <td class="num">${escapeHtml(money(item.amount,settings))}</td>
    </tr>`).join('')
    : '<tr><td colspan="5" class="muted">No transactions this month.</td></tr>';

  const goalRows=report.savings.items.length
    ? report.savings.items.map(item=>`<li><span>${escapeHtml(item.id)}</span><strong>${escapeHtml(money(item.saved,settings))} / ${escapeHtml(money(item.targetAmount,settings))}</strong></li>`).join('')
    : '<li class="muted">No savings goals.</li>';

  return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8"/>
<meta name="viewport" content="width=device-width, initial-scale=1"/>
<style>
@page{margin:28px}
*{box-sizing:border-box}
body{font-family:Arial,"Noto Sans Devanagari",sans-serif;color:#111827;font-size:12px;line-height:1.45;margin:0}
h1{font-size:24px;margin:0 0 4px} h2{font-size:15px;margin:22px 0 8px}
.subtitle,.muted{color:#6B7280}.grid{display:grid;grid-template-columns:repeat(2,1fr);gap:8px}
.card{border:1px solid #E5E7EB;border-radius:10px;padding:12px;background:#F9FAFB}
.metric{display:flex;justify-content:space-between;gap:16px;padding:4px 0}.metric strong{text-align:right}
table{width:100%;border-collapse:collapse}th,td{padding:7px;border-bottom:1px solid #E5E7EB;text-align:left;vertical-align:top}.num{text-align:right;white-space:nowrap}
ul{list-style:none;padding:0;margin:0}li{display:flex;justify-content:space-between;border-bottom:1px solid #E5E7EB;padding:6px 0}
.footer{margin-top:24px;color:#9CA3AF;font-size:10px}
</style>
</head>
<body>
  <h1>Kharcha Monthly Report</h1>
  <div class="subtitle">${escapeHtml(report.monthKey)} · AD ${escapeHtml(report.period.startAd)}–${escapeHtml(report.period.endAd)} · BS ${escapeHtml(report.period.startBs)}–${escapeHtml(report.period.endBs)}</div>

  <h2>Month summary</h2>
  <div class="grid">
    <div class="card">${row('Income',money(report.summary.income,settings))}${row('Expenses',money(report.summary.expense,settings))}${row('Net',money(report.summary.net,settings))}</div>
    <div class="card">${row('Transactions',report.summary.transactionCount)}${row('Budget spent',money(report.budget.spent,settings))}${row('Budget limit',money(report.budget.limit,settings))}</div>
  </div>

  <h2>Planning</h2>
  <div class="grid">
    <div class="card">${row('Remittance received',money(report.remittance.nprReceived,settings))}${row('Remittance fees',money(report.remittance.fees,settings))}${row('Udhaaro lent outstanding',money(report.udharo.lent,settings))}${row('Udhaaro borrowed outstanding',money(report.udharo.borrowed,settings))}</div>
    <div class="card">${row('Bills / EMI remaining',money(report.obligations.remaining,settings))}${row('Overdue obligations',report.obligations.overdueCount)}${row('Savings goals',`${money(report.savings.saved,settings)} / ${money(report.savings.target,settings)}`)}${row('Household spend',`${money(report.households.spent,settings)} / ${money(report.households.limit,settings)}`)}</div>
  </div>

  <h2>Expense categories</h2>
  <table><thead><tr><th>Category</th><th class="num">Amount</th></tr></thead><tbody>${categoryRows}</tbody></table>

  <h2>Savings goals</h2>
  <ul>${goalRows}</ul>

  <h2>Transactions</h2>
  <table><thead><tr><th>Date</th><th>Category</th><th>Note</th><th>Type</th><th class="num">Amount</th></tr></thead><tbody>${txRows}</tbody></table>

  <div class="footer">Generated by Kharcha · Data remains local unless you choose to share this PDF.</div>
</body>
</html>`;
}

module.exports={buildMonthlyReport,renderMonthlyReportHtml,escapeHtml};
