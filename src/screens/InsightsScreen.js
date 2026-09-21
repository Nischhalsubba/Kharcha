import React, { useMemo } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import NepalTools from '../components/NepalTools';
import PlanningTools from '../components/PlanningTools';
import SavingsGoals from '../components/SavingsGoals';
import HouseholdBudgets from '../components/HouseholdBudgets';
import PlanningSnapshot from '../components/PlanningSnapshot';
import SmartInsights from '../components/SmartInsights';
import { categoryLabel, t } from '../i18n';
import s from '../appStyles';
import { FinanceCard, Progress, Section } from '../components/AppPrimitives';

function shiftMonth(monthKey,offset){
  const match=/^(\d{4})-(\d{2})$/.exec(String(monthKey||''));
  if(!match)return null;
  const date=new Date(Date.UTC(Number(match[1]),Number(match[2])-1+offset,1));
  return `${date.getUTCFullYear()}-${String(date.getUTCMonth()+1).padStart(2,'0')}`;
}
function monthLabel(key){
  if(!key)return '';
  const [year,month]=key.split('-').map(Number);
  return new Intl.DateTimeFormat('en',{month:'short'}).format(new Date(Date.UTC(year,month-1,1)));
}
function monthTotals(transactions,key){
  let income=0,expense=0,transfers=0;
  for(const item of transactions||[]){
    if(String(item.date||'').slice(0,7)!==key||item.savingsGoalMovement)continue;
    const amount=Number(item.amount)||0;
    if(item.type==='income')income+=amount;
    if(item.type==='expense')expense+=amount;
    if(item.type==='transfer')transfers+=amount;
  }
  return {income,expense,net:income-expense,transfers};
}
function incomeBreakdown(transactions,key){
  const map=new Map();
  for(const item of transactions||[]){
    if(item.type!=='income'||item.savingsGoalMovement||String(item.date||'').slice(0,7)!==key)continue;
    const category=item.category||'Other';
    map.set(category,(map.get(category)||0)+(Number(item.amount)||0));
  }
  return [...map].map(([category,amount])=>({category,amount})).sort((a,b)=>b.amount-a.amount);
}
function average(values){return values.length?values.reduce((a,b)=>a+b,0)/values.length:0;}

export default function InsightsScreen({
  lang,breakdown,m,transactions,currentMonth,today,summary,settings,remittance,udharo,nepalData,eventStatuses,
  obligationStatuses,savingsStatuses,householdStatuses,planningSummary,smartInsights,onAddRecurringSuggestion,
  remindersEnabled,reminderPermission,onOpenReminders,setSettingsOpen,setRemittanceOpen,setPaymentRecord,setUdhaaroOpen,
  setEventOpen,setObligationOpen,setPaymentObligation,setSavingsOpen,setSavingsMovement,setHouseholdOpen,setTab,openAdd
}) {
  const months=useMemo(()=>Array.from({length:6},(_,index)=>shiftMonth(currentMonth,index-5)),[currentMonth]);
  const history=useMemo(()=>months.map(key=>({key,...monthTotals(transactions,key)})),[months,transactions]);
  const incomeRows=useMemo(()=>incomeBreakdown(transactions,currentMonth),[transactions,currentMonth]);
  const maxFlow=Math.max(1,...history.flatMap(item=>[item.income,item.expense]));
  const avgExpense=average(history.map(item=>item.expense));
  const avgIncome=average(history.map(item=>item.income));
  const transferTotal=history.reduce((total,item)=>total+item.transfers,0);
  const expenseTotal=summary.expense||0;
  const incomeTotal=summary.income||0;

  return <ScrollView contentInsetAdjustmentBehavior="automatic" showsVerticalScrollIndicator={false} contentContainerStyle={s.scroll}>
    <View style={s.screenTitleRow}><Text style={s.screenTitle}>{t(lang,'reports','Reports')}</Text><View style={s.pill}><Text style={s.pillText}>Last 6 Months</Text><Text style={s.pillChevron}>⌄</Text></View></View>

    <FinanceCard title="Cash Flow">
      <View style={s.reportLegend}><View style={s.reportLegendItem}><View style={[s.reportDot,{backgroundColor:COLORS_SUCCESS}]}/><Text style={s.meta}>Income</Text></View><View style={s.reportLegendItem}><View style={[s.reportDot,{backgroundColor:COLORS_DANGER}]}/><Text style={s.meta}>Expenses</Text></View></View>
      <View style={s.reportChart}>{history.map(item=><View key={item.key} style={s.reportChartColumn}><View style={s.reportBarPair}><View style={[s.reportBar,{height:`${Math.max(4,item.income/maxFlow*100)}%`,backgroundColor:COLORS_SUCCESS}]}/><View style={[s.reportBar,{height:`${Math.max(4,item.expense/maxFlow*100)}%`,backgroundColor:COLORS_DANGER}]}/></View><Text style={s.chartLabel}>{monthLabel(item.key)}</Text></View>)}</View>
      <View style={s.reportSummaryRow}><View><Text style={s.meta}>Income</Text><Text style={[s.rowTitle,s.income]}>{m(summary.income)}</Text></View><View><Text style={s.meta}>Expenses</Text><Text style={[s.rowTitle,s.danger]}>−{m(summary.expense)}</Text></View><View><Text style={s.meta}>Net cash flow</Text><Text style={s.rowTitle}>{m(summary.balance)}</Text></View></View>
      <Pressable style={s.secondary} onPress={()=>setTab('activity')}><Text style={s.secondaryText}>View Transactions</Text></Pressable>
    </FinanceCard>

    <Section title="Category Breakdown"/>
    <FinanceCard title="Expenses" action="">
      {breakdown.length?breakdown.slice(0,5).map((item,index)=>{const ratio=expenseTotal?item.amount/expenseTotal:0;return <View key={item.category} style={[s.reportCategoryRow,index>0&&s.breakdownRowBorder]}><View style={{flex:1}}><View style={s.between}><View><Text style={s.rowTitle}>{categoryLabel(item.category,lang)}</Text><Text style={s.meta}>{Math.round(ratio*100)}% of expenses</Text></View><Text style={s.rowTitle}>{m(item.amount)}</Text></View><Progress value={ratio} tone="danger"/></View></View>}):<Text style={s.emptyInline}>No expense data yet.</Text>}
      <View style={s.reportTotals}><View><Text style={s.meta}>Total Expenses</Text><Text style={s.cardTitle}>{m(expenseTotal)}</Text></View><View><Text style={s.meta}>Avg. Expenses</Text><Text style={s.cardTitle}>{m(avgExpense)}</Text></View></View>
    </FinanceCard>

    <View style={{height:12}}/>
    <FinanceCard title="Income Breakdown" action="">
      {incomeRows.length?incomeRows.slice(0,5).map((item,index)=>{const ratio=incomeTotal?item.amount/incomeTotal:0;return <View key={item.category} style={[s.reportCategoryRow,index>0&&s.breakdownRowBorder]}><View style={{flex:1}}><View style={s.between}><View><Text style={s.rowTitle}>{categoryLabel(item.category,lang)}</Text><Text style={s.meta}>{Math.round(ratio*100)}% of income</Text></View><Text style={s.rowTitle}>{m(item.amount)}</Text></View><Progress value={ratio} tone="success"/></View></View>}):<Text style={s.emptyInline}>No income data yet.</Text>}
      <View style={s.reportTotals}><View><Text style={s.meta}>Total Income</Text><Text style={s.cardTitle}>{m(incomeTotal)}</Text></View><View><Text style={s.meta}>Avg. Income</Text><Text style={s.cardTitle}>{m(avgIncome)}</Text></View></View>
    </FinanceCard>

    <View style={{height:12}}/>
    <FinanceCard title="Transfers" action="">
      <View style={s.reportTransferRow}><View><Text style={s.meta}>Total Transfer In</Text><Text style={s.cardTitle}>{m(transferTotal)}</Text></View><View><Text style={s.meta}>Transfer Out</Text><Text style={s.cardTitle}>{m(transferTotal)}</Text></View></View>
      <Text style={s.meta}>Wallet transfers are internal movements and stay excluded from income and expense reporting.</Text>
    </FinanceCard>

    <SmartInsights settings={settings} money={m} comparison={smartInsights?.comparison} savings={smartInsights?.savings} forecast={smartInsights?.forecast} unusual={smartInsights?.unusual} suggestions={smartInsights?.recurringSuggestions} onAddSuggestion={onAddRecurringSuggestion}/>
    <Pressable style={s.secondary} onPress={onOpenReminders} accessibilityRole="button"><Text style={s.secondaryText}>🔔 {t(lang,'reminders','Reminders')} · {remindersEnabled&&reminderPermission?t(lang,'on','On'):t(lang,'off','Off')}</Text></Pressable>
    <PlanningSnapshot settings={settings} money={m} analytics={planningSummary}/>
    <PlanningTools settings={settings} money={m} statuses={obligationStatuses} onAdd={()=>{setPaymentObligation(null);setObligationOpen(true);}} onPay={(item)=>{setPaymentObligation({obligation:item,status:item});setObligationOpen(true);}}/>
    <SavingsGoals settings={settings} money={m} statuses={savingsStatuses} onAdd={()=>{setSavingsMovement(null);setSavingsOpen(true);}} onDeposit={(goal)=>{setSavingsMovement({goal,status:goal,direction:'deposit'});setSavingsOpen(true);}} onWithdraw={(goal)=>{setSavingsMovement({goal,status:goal,direction:'withdrawal'});setSavingsOpen(true);}}/>
    <HouseholdBudgets settings={settings} money={m} statuses={householdStatuses} onAdd={()=>setHouseholdOpen(true)}/>
    <NepalTools settings={settings} money={m} remittance={remittance} udharo={udharo} udharoRecords={nepalData.udharo} eventStatuses={eventStatuses} onSettings={()=>setSettingsOpen(true)} onAddRemittance={()=>setRemittanceOpen(true)} onAddUdhaaro={()=>{setPaymentRecord(null);setUdhaaroOpen(true);}} onPayUdhaaro={(record)=>{setPaymentRecord(record);setUdhaaroOpen(true);}} onAddEvent={()=>setEventOpen(true)} onAddEventExpense={(eventId)=>{setTab('overview');openAdd(eventId);}}/>
  </ScrollView>;
}

const COLORS_SUCCESS='#40C79A';
const COLORS_DANGER='#F26969';
