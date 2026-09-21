import React, { useEffect, useMemo, useState } from 'react';
import { Alert, Pressable, SafeAreaView, StatusBar, Text, View } from 'react-native';
import AddTransactionModal from './src/components/AddTransactionModal';
import WalletModal from './src/components/WalletModal';
import CategoryModal from './src/components/CategoryModal';
import RecurringModal from './src/components/RecurringModal';
import NepalSettingsModal from './src/components/NepalSettingsModal';
import RemittanceModal from './src/components/RemittanceModal';
import UdhaaroModal from './src/components/UdhaaroModal';
import EventBudgetModal from './src/components/EventBudgetModal';
import ObligationModal from './src/components/ObligationModal';
import SavingsGoalModal from './src/components/SavingsGoalModal';
import HouseholdBudgetModal from './src/components/HouseholdBudgetModal';
import { COLORS, categoryPairs } from './src/constants';
import { t } from './src/i18n';
import s from './src/appStyles';
import { Tab } from './src/components/AppPrimitives';
import OverviewScreen from './src/screens/OverviewScreen';
import ActivityScreen from './src/screens/ActivityScreen';
import BudgetScreen from './src/screens/BudgetScreen';
import InsightsScreen from './src/screens/InsightsScreen';
import {
  defaultSettings, defaultNepalData, defaultPlanningData, loadSettings, loadTransactions, loadNepalData, loadPlanningData,
  saveSettings, saveTransactions, saveNepalData, savePlanningData,
} from './src/storage/expenseStore';
const { categoryBreakdown, monthlyBudgetStatus, normalizeAmount, summarizeTransactions } = require('./src/domain/finance');
const { categoryBudgetStatus, filterTransactions, materializeRecurringTransactions, walletBalances } = require('./src/domain/phaseOne');
const { eventBudgetStatus, remittanceSummary, udharoSummary } = require('./src/domain/phaseTwo');
const { formatNpr } = require('./src/domain/nepal');
const { obligationStatus, createObligationPaymentTransaction, recordUdhaaroPayment, reverseUdhaaroPayment, savingsGoalStatus, createSavingsGoalTransaction, householdBudgetStatus, planningAnalytics } = require('./src/domain/phaseThree');

function pad2(v){return String(v).padStart(2,'0');}
function localIsoDate(d=new Date()){return `${d.getFullYear()}-${pad2(d.getMonth()+1)}-${pad2(d.getDate())}`;}
function monthKey(){return localIsoDate().slice(0,7);}
function money(value,settings){if(settings.currency==='NPR')return formatNpr(value,{language:settings.language,mode:settings.amountFormat});try{return new Intl.NumberFormat('en-NP',{style:'currency',currency:settings.currency,maximumFractionDigits:0}).format(Number(value)||0);}catch{return `${settings.currency} ${Math.round(Number(value)||0)}`;}}

export default function App(){
  const [ready,setReady]=useState(false),[tab,setTab]=useState('overview'),[transactions,setTransactions]=useState([]),[settings,setSettings]=useState(defaultSettings),[nepalData,setNepalData]=useState(defaultNepalData),[planningData,setPlanningData]=useState(defaultPlanningData);
  const [transactionOpen,setTransactionOpen]=useState(false),[editing,setEditing]=useState(null),[draftEventId,setDraftEventId]=useState('');
  const [walletOpen,setWalletOpen]=useState(false),[categoryOpen,setCategoryOpen]=useState(false),[recurringOpen,setRecurringOpen]=useState(false),[settingsOpen,setSettingsOpen]=useState(false),[remittanceOpen,setRemittanceOpen]=useState(false),[udharoOpen,setUdhaaroOpen]=useState(false),[eventOpen,setEventOpen]=useState(false),[paymentRecord,setPaymentRecord]=useState(null),[obligationOpen,setObligationOpen]=useState(false),[paymentObligation,setPaymentObligation]=useState(null),[savingsOpen,setSavingsOpen]=useState(false),[savingsMovement,setSavingsMovement]=useState(null),[householdOpen,setHouseholdOpen]=useState(false);
  const [budgetDraft,setBudgetDraft]=useState(String(defaultSettings.monthlyBudget));
  const [query,setQuery]=useState(''),[filterType,setFilterType]=useState('all'),[filterWallet,setFilterWallet]=useState('all'),[filterCategory,setFilterCategory]=useState('all'),[filterPeriod,setFilterPeriod]=useState('all');
  const [categoryBudgetCategory,setCategoryBudgetCategory]=useState('Food'),[categoryBudgetDraft,setCategoryBudgetDraft]=useState('');
  const currentMonth=monthKey(),today=localIsoDate();
  const summary=useMemo(()=>summarizeTransactions(transactions,currentMonth),[transactions,currentMonth]);
  const breakdown=useMemo(()=>categoryBreakdown(transactions,currentMonth),[transactions,currentMonth]);
  const budget=useMemo(()=>monthlyBudgetStatus(transactions,currentMonth,settings.monthlyBudget),[transactions,currentMonth,settings.monthlyBudget]);
  const wallets=useMemo(()=>walletBalances(transactions,settings.wallets),[transactions,settings.wallets]);
  const categoryBudgets=useMemo(()=>categoryBudgetStatus(transactions,currentMonth,settings.categoryBudgets),[transactions,currentMonth,settings.categoryBudgets]);
  const expenseCategories=useMemo(()=>categoryPairs('expense',settings.customCategories),[settings.customCategories]);
  const incomeCategories=useMemo(()=>categoryPairs('income',settings.customCategories),[settings.customCategories]);
  const activityCategories=useMemo(()=>{const source=filterType==='income'?incomeCategories:filterType==='expense'?expenseCategories:[...expenseCategories,...incomeCategories];return [...new Set(source.map(([name])=>name))];},[filterType,expenseCategories,incomeCategories]);
  const filteredTransactions=useMemo(()=>filterTransactions(transactions,{query,type:filterType,walletId:filterWallet,category:filterCategory,monthKey:filterPeriod==='month'?currentMonth:undefined}),[transactions,query,filterType,filterWallet,filterCategory,filterPeriod,currentMonth]);
  const remittance=useMemo(()=>remittanceSummary(transactions,currentMonth),[transactions,currentMonth]);
  const udharo=useMemo(()=>udharoSummary(nepalData.udharo),[nepalData.udharo]);
  const eventStatuses=useMemo(()=>eventBudgetStatus(nepalData.events,transactions),[nepalData.events,transactions]);
  const obligationStatuses=useMemo(()=>planningData.obligations.map(obligation=>({...obligation,...obligationStatus(obligation,transactions,today)})),[planningData.obligations,transactions,today]);
  const savingsStatuses=useMemo(()=>planningData.savingsGoals.map(goal=>({...goal,...savingsGoalStatus(goal,transactions)})),[planningData.savingsGoals,transactions]);
  const householdStatuses=useMemo(()=>planningData.householdBudgets.map(household=>({...household,...householdBudgetStatus(household,transactions,currentMonth)})),[planningData.householdBudgets,transactions,currentMonth]);
  const planningSummary=useMemo(()=>planningAnalytics(planningData,transactions,today),[planningData,transactions,today]);

  useEffect(()=>{let mounted=true;Promise.all([loadTransactions(),loadSettings(),loadNepalData(),loadPlanningData()]).then(async([tx,st,np,pl])=>{if(!mounted)return;const materialized=materializeRecurringTransactions(tx,st.recurringTransactions,localIsoDate());setTransactions(materialized.transactions);setSettings(st);setNepalData(np);setPlanningData(pl);setBudgetDraft(String(st.monthlyBudget));if(materialized.created.length)await saveTransactions(materialized.transactions);}).finally(()=>mounted&&setReady(true));return()=>{mounted=false;};},[]);

  async function persistSettings(next){const saved=await saveSettings(next);setSettings(saved);return saved;}
  async function persistNepalData(next){const saved=await saveNepalData(next);setNepalData(saved);return saved;}
  async function persistPlanningData(next){const saved=await savePlanningData(next);setPlanningData(saved);return saved;}
  function openAdd(eventId=''){setEditing(null);setDraftEventId(eventId);setTransactionOpen(true);}
  function openEdit(tx){setEditing(tx);setDraftEventId(tx.eventId||'');setTransactionOpen(true);}
  async function saveTransaction(tx){const exists=transactions.some(item=>item.id===tx.id);const next=(exists?transactions.map(item=>item.id===tx.id?tx:item):[tx,...transactions]).sort((a,b)=>String(b.date).localeCompare(String(a.date)));setTransactions(next);await saveTransactions(next);setEditing(null);setDraftEventId('');setTransactionOpen(false);}
  function remove(id){const target=transactions.find(item=>item.id===id);const recurring=Boolean(target?.recurringId);Alert.alert(recurring?'Skip recurring occurrence?':'Delete transaction?',recurring?'This occurrence will stay skipped. Future repeats remain active.':'This removes it from your local history.',[{text:'Cancel',style:'cancel'},{text:recurring?'Skip':'Delete',style:'destructive',onPress:async()=>{if(recurring){const rules=settings.recurringTransactions.map(rule=>rule.id===target.recurringId?{...rule,skippedOccurrences:[...new Set([...(rule.skippedOccurrences||[]),id])]}:rule);await persistSettings({...settings,recurringTransactions:rules});}let nextNepal=nepalData;if(target?.udharoPayment?.recordId){nextNepal={...nepalData,udharo:nepalData.udharo.map(record=>record.id===target.udharoPayment.recordId?reverseUdhaaroPayment(record,id):record)};setNepalData(nextNepal);}const next=transactions.filter(x=>x.id!==id);setTransactions(next);await Promise.all([saveTransactions(next),target?.udharoPayment?.recordId?saveNepalData(nextNepal):Promise.resolve()]);}}]);}
  async function updateBudget(){const amount=normalizeAmount(budgetDraft);if(!amount)return Alert.alert('Enter a valid budget','Use an amount greater than zero.');await persistSettings({...settings,monthlyBudget:amount});Alert.alert('Budget updated',`${money(amount,settings)} for this month.`);}
  async function addWallet(wallet){await persistSettings({...settings,wallets:[...settings.wallets,wallet]});setWalletOpen(false);}
  async function addCategory({type,item}){const duplicate=categoryPairs(type,settings.customCategories).some(([name])=>name.toLowerCase()===item.name.toLowerCase());if(duplicate)return Alert.alert('Category already exists','Choose a different name.');await persistSettings({...settings,customCategories:{...settings.customCategories,[type]:[...(settings.customCategories[type]||[]),item]}});setCategoryOpen(false);}
  async function removeCategory(type,id,name){const nextBudgets={...settings.categoryBudgets};delete nextBudgets[name];await persistSettings({...settings,customCategories:{...settings.customCategories,[type]:(settings.customCategories[type]||[]).filter(item=>item.id!==id)},categoryBudgets:nextBudgets});}
  async function saveCategoryBudget(){const amount=normalizeAmount(categoryBudgetDraft);if(!amount)return Alert.alert('Enter a category budget','Use an amount greater than zero.');await persistSettings({...settings,categoryBudgets:{...settings.categoryBudgets,[categoryBudgetCategory]:amount}});setCategoryBudgetDraft('');}
  async function removeCategoryBudget(category){const next={...settings.categoryBudgets};delete next[category];await persistSettings({...settings,categoryBudgets:next});}
  async function addRecurring(rule){const nextSettings=await persistSettings({...settings,recurringTransactions:[...settings.recurringTransactions,rule]});const materialized=materializeRecurringTransactions(transactions,nextSettings.recurringTransactions,today);setTransactions(materialized.transactions);if(materialized.created.length)await saveTransactions(materialized.transactions);setRecurringOpen(false);}
  async function toggleRecurring(id){const rules=settings.recurringTransactions.map(rule=>rule.id===id?{...rule,active:!rule.active}:rule);const nextSettings=await persistSettings({...settings,recurringTransactions:rules});const materialized=materializeRecurringTransactions(transactions,nextSettings.recurringTransactions,today);setTransactions(materialized.transactions);if(materialized.created.length)await saveTransactions(materialized.transactions);}
  async function deleteRecurring(id){await persistSettings({...settings,recurringTransactions:settings.recurringTransactions.filter(rule=>rule.id!==id)});}
  function clearFilters(){setQuery('');setFilterType('all');setFilterWallet('all');setFilterCategory('all');setFilterPeriod('all');}
  async function saveRemittance(tx){await saveTransaction(tx);setRemittanceOpen(false);}
  async function addUdhaaro(record){await persistNepalData({...nepalData,udharo:[record,...nepalData.udharo]});setUdhaaroOpen(false);}
  async function payUdhaaro(id,amount,date,walletId){const record=nepalData.udharo.find(item=>item.id===id);const result=recordUdhaaroPayment(record,amount,date,walletId);if(!result)return Alert.alert('Payment not recorded','Check the amount and wallet.');const nextNepal={...nepalData,udharo:nepalData.udharo.map(item=>item.id===id?result.record:item)};const nextTransactions=[result.transaction,...transactions].sort((a,b)=>String(b.date).localeCompare(String(a.date)));setNepalData(nextNepal);setTransactions(nextTransactions);await Promise.all([saveNepalData(nextNepal),saveTransactions(nextTransactions)]);setPaymentRecord(null);setUdhaaroOpen(false);}
  async function addEvent(event){await persistNepalData({...nepalData,events:[event,...nepalData.events]});setEventOpen(false);}
  async function addObligation(obligation){await persistPlanningData({...planningData,obligations:[obligation,...planningData.obligations]});setObligationOpen(false);}
  async function payObligation(id,amount,date,walletId){const obligation=planningData.obligations.find(item=>item.id===id);const payment=createObligationPaymentTransaction(obligation,transactions,amount,date,walletId);if(!payment)return Alert.alert('Payment not recorded','Check the amount and wallet.');await saveTransaction(payment);setPaymentObligation(null);setObligationOpen(false);}
  async function addSavingsGoal(goal){await persistPlanningData({...planningData,savingsGoals:[goal,...planningData.savingsGoals]});setSavingsOpen(false);}
  async function moveSavingsGoal(id,amount,date,walletId,direction){const goal=planningData.savingsGoals.find(item=>item.id===id);const movement=createSavingsGoalTransaction(goal,transactions,amount,date,walletId,direction);if(!movement)return Alert.alert('Savings movement not recorded','Check the amount and wallet.');await saveTransaction(movement);setSavingsMovement(null);setSavingsOpen(false);}
  async function addHouseholdBudget(household){await persistPlanningData({...planningData,householdBudgets:[household,...planningData.householdBudgets]});setHouseholdOpen(false);}

  if(!ready)return <SafeAreaView style={[s.safe,s.center]}><StatusBar barStyle="light-content"/><Text style={s.brand}>Kharcha</Text><Text style={s.meta}>Loading your money view…</Text></SafeAreaView>;
  const lang=settings.language;
  const m=(value)=>money(value,settings);
  return <SafeAreaView style={s.safe}><StatusBar barStyle="light-content" backgroundColor={COLORS.bg}/><View style={s.app}>
    <View style={s.top}><View><Text style={s.eyebrow}>{t(lang,'personalMoney','PERSONAL MONEY').toUpperCase()}</Text><Text style={s.brand}>Kharcha</Text></View><Pressable style={s.badge} onPress={()=>setSettingsOpen(true)}><Text style={s.dot}>●</Text><Text style={s.badgeText}>{lang==='ne'?'नेपाली · ':'EN · '}{settings.dateSystem}</Text></Pressable></View>
    <View style={s.content}>
      {tab==='overview'&&<OverviewScreen lang={lang} summary={summary} m={m} wallets={wallets} settings={settings} setWalletOpen={setWalletOpen} budget={budget} transactions={transactions} setTab={setTab} remove={remove} openEdit={openEdit} openAdd={openAdd}/>} 
      {tab==='activity'&&<ActivityScreen lang={lang} query={query} setQuery={setQuery} filterType={filterType} setFilterType={setFilterType} filterWallet={filterWallet} setFilterWallet={setFilterWallet} filterCategory={filterCategory} setFilterCategory={setFilterCategory} filterPeriod={filterPeriod} setFilterPeriod={setFilterPeriod} clearFilters={clearFilters} settings={settings} activityCategories={activityCategories} filteredTransactions={filteredTransactions} transactions={transactions} remove={remove} openEdit={openEdit} openAdd={openAdd} m={m}/>} 
      {tab==='budget'&&<BudgetScreen lang={lang} budgetDraft={budgetDraft} setBudgetDraft={setBudgetDraft} updateBudget={updateBudget} expenseCategories={expenseCategories} categoryBudgetCategory={categoryBudgetCategory} setCategoryBudgetCategory={setCategoryBudgetCategory} categoryBudgetDraft={categoryBudgetDraft} setCategoryBudgetDraft={setCategoryBudgetDraft} settings={settings} saveCategoryBudget={saveCategoryBudget} categoryBudgets={categoryBudgets} removeCategoryBudget={removeCategoryBudget} m={m} breakdown={breakdown} budget={budget} setWalletOpen={setWalletOpen} setCategoryOpen={setCategoryOpen} setRecurringOpen={setRecurringOpen} setSettingsOpen={setSettingsOpen} removeCategory={removeCategory} toggleRecurring={toggleRecurring} deleteRecurring={deleteRecurring} today={today}/>} 
      {tab==='insights'&&<InsightsScreen lang={lang} breakdown={breakdown} m={m} transactions={transactions} currentMonth={currentMonth} today={today} summary={summary} settings={settings} remittance={remittance} udharo={udharo} nepalData={nepalData} eventStatuses={eventStatuses} obligationStatuses={obligationStatuses} savingsStatuses={savingsStatuses} householdStatuses={householdStatuses} planningSummary={planningSummary} setSettingsOpen={setSettingsOpen} setRemittanceOpen={setRemittanceOpen} setPaymentRecord={setPaymentRecord} setUdhaaroOpen={setUdhaaroOpen} setEventOpen={setEventOpen} setObligationOpen={setObligationOpen} setPaymentObligation={setPaymentObligation} setSavingsOpen={setSavingsOpen} setSavingsMovement={setSavingsMovement} setHouseholdOpen={setHouseholdOpen} setTab={setTab} openAdd={openAdd}/>} 
    </View>
    <View style={s.bottom}>{[['overview','⌂',t(lang,'overview','Overview')],['activity','↕',t(lang,'activity','Activity')]].map(([k,i,l])=><Tab key={k} active={tab===k} icon={i} label={l} onPress={()=>setTab(k)}/>)}<Pressable style={s.fab} onPress={()=>openAdd()} accessibilityRole="button" accessibilityLabel="Add transaction"><Text style={s.fabText}>＋</Text></Pressable>{[['budget','◎',t(lang,'budget','Budget')],['insights','◔',t(lang,'insights','Insights')]].map(([k,i,l])=><Tab key={k} active={tab===k} icon={i} label={l} onPress={()=>setTab(k)}/>)}</View>
    <AddTransactionModal visible={transactionOpen} initialTransaction={editing} wallets={settings.wallets} customCategories={settings.customCategories} events={nepalData.events} householdBudgets={planningData.householdBudgets} settings={settings} initialEventId={draftEventId} onClose={()=>{setTransactionOpen(false);setEditing(null);setDraftEventId('');}} onSave={saveTransaction}/>
    <WalletModal visible={walletOpen} language={lang} onClose={()=>setWalletOpen(false)} onSave={addWallet}/><CategoryModal visible={categoryOpen} language={lang} onClose={()=>setCategoryOpen(false)} onSave={addCategory}/><RecurringModal visible={recurringOpen} settings={settings} onClose={()=>setRecurringOpen(false)} onSave={addRecurring} wallets={settings.wallets} customCategories={settings.customCategories}/>
    <NepalSettingsModal visible={settingsOpen} settings={settings} onClose={()=>setSettingsOpen(false)} onSave={async(next)=>{await persistSettings(next);setSettingsOpen(false);}}/><RemittanceModal visible={remittanceOpen} wallets={settings.wallets} settings={settings} onClose={()=>setRemittanceOpen(false)} onSave={saveRemittance}/><UdhaaroModal visible={udharoOpen} paymentRecord={paymentRecord} settings={settings} wallets={settings.wallets} onClose={()=>{setUdhaaroOpen(false);setPaymentRecord(null);}} onSave={addUdhaaro} onPay={payUdhaaro}/><EventBudgetModal visible={eventOpen} settings={settings} onClose={()=>setEventOpen(false)} onSave={addEvent}/><ObligationModal visible={obligationOpen} paymentTarget={paymentObligation} settings={settings} wallets={settings.wallets} onClose={()=>{setObligationOpen(false);setPaymentObligation(null);}} onSave={addObligation} onPay={payObligation}/><SavingsGoalModal visible={savingsOpen} movementTarget={savingsMovement} settings={settings} wallets={settings.wallets} onClose={()=>{setSavingsOpen(false);setSavingsMovement(null);}} onSaveGoal={addSavingsGoal} onMove={moveSavingsGoal}/><HouseholdBudgetModal visible={householdOpen} settings={settings} onClose={()=>setHouseholdOpen(false)} onSave={addHouseholdBudget}/>
  </View></SafeAreaView>;
}
