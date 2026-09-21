import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Alert, AppState, Pressable, SafeAreaView, StatusBar, Text, View } from 'react-native';
import AddTransactionModal from './src/components/AddTransactionModal';
import WalletModal from './src/components/WalletModal';
import TransferModal from './src/components/TransferModal';
import CategoryModal from './src/components/CategoryModal';
import RecurringModal from './src/components/RecurringModal';
import RecurringManagerModal from './src/components/RecurringManagerModal';
import NepalSettingsModal from './src/components/NepalSettingsModal';
import RemittanceModal from './src/components/RemittanceModal';
import UdhaaroModal from './src/components/UdhaaroModal';
import EventBudgetModal from './src/components/EventBudgetModal';
import ObligationModal from './src/components/ObligationModal';
import SavingsGoalModal from './src/components/SavingsGoalModal';
import HouseholdBudgetModal from './src/components/HouseholdBudgetModal';
import DataSafetyModal from './src/components/DataSafetyModal';
import CsvExportModal from './src/components/CsvExportModal';
import MonthlyReportModal from './src/components/MonthlyReportModal';
import DataManagementModal from './src/components/DataManagementModal';
import SecuritySettingsModal from './src/components/SecuritySettingsModal';
import ReminderSettingsModal from './src/components/ReminderSettingsModal';
import TransactionDetailsModal from './src/components/TransactionDetailsModal';
import LockScreen from './src/components/LockScreen';
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
  saveSettings, saveTransactions, saveNepalData, savePlanningData, loadFullState, restoreFullState, recoverInterruptedRestore,
  applyFullStateWithSafetySnapshot, restoreLastSafetySnapshot, getSafetySnapshotInfo,
} from './src/storage/expenseStore';
const { categoryBreakdown, monthlyBudgetStatus, normalizeAmount, summarizeTransactions } = require('./src/domain/finance');
const { categoryBudgetStatus, filterTransactions, materializeRecurringTransactions, walletBalances } = require('./src/domain/phaseOne');
const { eventBudgetStatus, remittanceSummary, udharoSummary } = require('./src/domain/phaseTwo');
const { formatNpr } = require('./src/domain/nepal');
const { obligationStatus, createObligationPaymentTransaction, recordUdhaaroPayment, reverseUdhaaroPayment, reconcileUdhaaroRecords, savingsGoalStatus, createSavingsGoalTransaction, householdBudgetStatus, planningAnalytics } = require('./src/domain/phaseThree');
const { createBackupEnvelope, serializeBackup, parseBackup } = require('./src/domain/backup');
const { shareBackupText, pickBackupText } = require('./src/services/backupFiles');
const { createTransactionsCsv } = require('./src/domain/csvExport');
const { buildMonthlyReport, renderMonthlyReportHtml } = require('./src/domain/monthlyReport');
const { prepareTransactionImport, mergeImportedTransactions, prepareMonthDeletion } = require('./src/domain/dataManagement');
const { shareCsvExport } = require('./src/services/exportFiles');
const { shareMonthlyPdf } = require('./src/services/reportFiles');
const { pickCsvImportText } = require('./src/services/importFiles');
const { DEFAULT_SECURITY_CONFIG, isValidPin, shouldLockAfterBackground } = require('./src/domain/security');
const { monthComparison, savingsRate, projectedMonthExpense, detectUnusualSpending, recurringTransactionSuggestions } = require('./src/domain/insights');
const { buildReminderPlan, normalizeReminderSettings } = require('./src/domain/reminders');
const { getReminderPermission, requestReminderPermission, syncFinancialReminders } = require('./src/services/notificationReminders');
const { getSecurityConfig, enablePinLock, updatePin, verifyPin, disableAppLock, getBiometricAvailability, setBiometricEnabled, setLockAfterSeconds, authenticateBiometric, getPinAttemptState, attemptPinUnlock } = require('./src/services/appSecurity');
const APP_VERSION = require('./package.json').version;

function pad2(v){return String(v).padStart(2,'0');}
function localIsoDate(d=new Date()){return `${d.getFullYear()}-${pad2(d.getMonth()+1)}-${pad2(d.getDate())}`;}
function monthKey(){return localIsoDate().slice(0,7);}
function money(value,settings){if(settings.currency==='NPR')return formatNpr(value,{language:settings.language,mode:settings.amountFormat});try{return new Intl.NumberFormat('en-NP',{style:'currency',currency:settings.currency,maximumFractionDigits:0}).format(Number(value)||0);}catch{return `${settings.currency} ${Math.round(Number(value)||0)}`;}}

export default function App(){
  const [ready,setReady]=useState(false),[tab,setTab]=useState('overview'),[transactions,setTransactions]=useState([]),[settings,setSettings]=useState(defaultSettings),[nepalData,setNepalData]=useState(defaultNepalData),[planningData,setPlanningData]=useState(defaultPlanningData);
  const [transactionOpen,setTransactionOpen]=useState(false),[editing,setEditing]=useState(null),[draftEventId,setDraftEventId]=useState(''),[detailsTransaction,setDetailsTransaction]=useState(null);
  const [walletOpen,setWalletOpen]=useState(false),[transferOpen,setTransferOpen]=useState(false),[categoryOpen,setCategoryOpen]=useState(false),[recurringOpen,setRecurringOpen]=useState(false),[recurringEditorOpen,setRecurringEditorOpen]=useState(false),[settingsOpen,setSettingsOpen]=useState(false),[remittanceOpen,setRemittanceOpen]=useState(false),[udharoOpen,setUdhaaroOpen]=useState(false),[eventOpen,setEventOpen]=useState(false),[paymentRecord,setPaymentRecord]=useState(null),[obligationOpen,setObligationOpen]=useState(false),[paymentObligation,setPaymentObligation]=useState(null),[savingsOpen,setSavingsOpen]=useState(false),[savingsMovement,setSavingsMovement]=useState(null),[householdOpen,setHouseholdOpen]=useState(false),[dataSafetyOpen,setDataSafetyOpen]=useState(false),[backupBusy,setBackupBusy]=useState(false),[csvExportOpen,setCsvExportOpen]=useState(false),[monthlyReportOpen,setMonthlyReportOpen]=useState(false),[dataManagementOpen,setDataManagementOpen]=useState(false),[snapshotInfo,setSnapshotInfo]=useState(null),[securityOpen,setSecurityOpen]=useState(false),[reminderOpen,setReminderOpen]=useState(false),[reminderPermission,setReminderPermission]=useState(false),[securityReady,setSecurityReady]=useState(false),[securityConfig,setSecurityConfig]=useState(DEFAULT_SECURITY_CONFIG),[biometricAvailable,setBiometricAvailable]=useState(false),[locked,setLocked]=useState(false),[securityBusy,setSecurityBusy]=useState(false),[failedAttempts,setFailedAttempts]=useState(0),[cooldownUntil,setCooldownUntil]=useState(0);
  const [budgetDraft,setBudgetDraft]=useState(String(defaultSettings.monthlyBudget));
  const [query,setQuery]=useState(''),[filterType,setFilterType]=useState('all'),[filterWallet,setFilterWallet]=useState('all'),[filterCategory,setFilterCategory]=useState('all'),[filterPeriod,setFilterPeriod]=useState('all');
  const [categoryBudgetCategory,setCategoryBudgetCategory]=useState('Food'),[categoryBudgetDraft,setCategoryBudgetDraft]=useState('');
  const appStateRef=useRef(AppState.currentState),backgroundAtRef=useRef(null);
  const currentMonth=monthKey(),today=localIsoDate();
  const summary=useMemo(()=>summarizeTransactions(transactions,currentMonth),[transactions,currentMonth]);
  const breakdown=useMemo(()=>categoryBreakdown(transactions,currentMonth),[transactions,currentMonth]);
  const budget=useMemo(()=>monthlyBudgetStatus(transactions,currentMonth,settings.monthlyBudget),[transactions,currentMonth,settings.monthlyBudget]);
  const wallets=useMemo(()=>walletBalances(transactions,settings.wallets),[transactions,settings.wallets]);
  const categoryBudgets=useMemo(()=>categoryBudgetStatus(transactions,currentMonth,settings.categoryBudgets),[transactions,currentMonth,settings.categoryBudgets]);
  const expenseCategories=useMemo(()=>categoryPairs('expense',settings.customCategories),[settings.customCategories]);
  const incomeCategories=useMemo(()=>categoryPairs('income',settings.customCategories),[settings.customCategories]);
  const activityCategories=useMemo(()=>{const source=filterType==='transfer'?[]:filterType==='income'?incomeCategories:filterType==='expense'?expenseCategories:[...expenseCategories,...incomeCategories];return [...new Set(source.map(([name])=>name))];},[filterType,expenseCategories,incomeCategories]);
  const filteredTransactions=useMemo(()=>filterTransactions(transactions,{query,type:filterType,walletId:filterWallet,category:filterCategory,monthKey:filterPeriod==='month'?currentMonth:undefined}),[transactions,query,filterType,filterWallet,filterCategory,filterPeriod,currentMonth]);
  const remittance=useMemo(()=>remittanceSummary(transactions,currentMonth),[transactions,currentMonth]);
  const udharo=useMemo(()=>udharoSummary(nepalData.udharo),[nepalData.udharo]);
  const eventStatuses=useMemo(()=>eventBudgetStatus(nepalData.events,transactions),[nepalData.events,transactions]);
  const obligationStatuses=useMemo(()=>planningData.obligations.map(obligation=>({...obligation,...obligationStatus(obligation,transactions,today)})),[planningData.obligations,transactions,today]);
  const savingsStatuses=useMemo(()=>planningData.savingsGoals.map(goal=>({...goal,...savingsGoalStatus(goal,transactions)})),[planningData.savingsGoals,transactions]);
  const householdStatuses=useMemo(()=>planningData.householdBudgets.map(household=>({...household,...householdBudgetStatus(household,transactions,currentMonth)})),[planningData.householdBudgets,transactions,currentMonth]);
  const planningSummary=useMemo(()=>planningAnalytics(planningData,transactions,today),[planningData,transactions,today]);
  const reminderPlan=useMemo(()=>buildReminderPlan({transactions,planningData,nepalData},today,settings.reminders),[transactions,planningData,nepalData,today,settings.reminders]);
  const smartInsights=useMemo(()=>({
    comparison:monthComparison(transactions,currentMonth),
    savings:savingsRate(transactions,currentMonth),
    forecast:projectedMonthExpense(transactions,currentMonth,today),
    unusual:detectUnusualSpending(transactions,currentMonth),
    recurringSuggestions:recurringTransactionSuggestions(transactions,settings.recurringTransactions),
  }),[transactions,currentMonth,today,settings.recurringTransactions]);

  useEffect(()=>{let mounted=true;(async()=>{let recovered=false;try{recovered=await recoverInterruptedRestore();}catch(error){if(mounted)Alert.alert('Recovery issue',error?.message||'Kharcha could not recover an interrupted restore.');}try{const [tx,st,np,pl]=await Promise.all([loadTransactions(),loadSettings(),loadNepalData(),loadPlanningData()]);if(!mounted)return;const materialized=materializeRecurringTransactions(tx,st.recurringTransactions,localIsoDate());const reconciledUdhaaro=reconcileUdhaaroRecords(np.udharo,materialized.transactions);const reconciledNepal={...np,udharo:reconciledUdhaaro};setTransactions(materialized.transactions);setSettings(st);setNepalData(reconciledNepal);setPlanningData(pl);setBudgetDraft(String(st.monthlyBudget));const writes=[];if(materialized.created.length)writes.push(saveTransactions(materialized.transactions));if(JSON.stringify(reconciledUdhaaro)!==JSON.stringify(np.udharo))writes.push(saveNepalData(reconciledNepal));if(writes.length)await Promise.all(writes);if(recovered)Alert.alert('Restore recovered','Kharcha recovered the data that existed before an interrupted restore.');}finally{if(mounted)setReady(true);}})();return()=>{mounted=false;};},[]);

  useEffect(()=>{let mounted=true;(async()=>{try{setReminderPermission(await getReminderPermission());}catch{};return()=>{};})();return()=>{mounted=false;};},[]);

  useEffect(()=>{if(!ready)return;let active=true;(async()=>{try{const result=await syncFinancialReminders(reminderPlan,settings.language);if(active)setReminderPermission(result.permissionGranted);}catch{}})();return()=>{active=false;};},[ready,reminderPlan,settings.language]);

  useEffect(()=>{let mounted=true;(async()=>{try{const [config,bio,attempts]=await Promise.all([getSecurityConfig(),getBiometricAvailability(),getPinAttemptState()]);if(!mounted)return;setSecurityConfig(config);setBiometricAvailable(bio);setFailedAttempts(attempts.failureCount);setCooldownUntil(attempts.cooldownUntil);setLocked(config.enabled);}catch(error){if(mounted)Alert.alert('Security unavailable',error?.message||'Kharcha could not load app-lock settings.');}finally{if(mounted)setSecurityReady(true);}})();return()=>{mounted=false;};},[]);

  useEffect(()=>{
    const subscription=AppState.addEventListener('change',(nextState)=>{
      const previous=appStateRef.current;
      if(nextState==='active'){
        if(securityConfig.enabled&&shouldLockAfterBackground(backgroundAtRef.current,Date.now(),securityConfig.lockAfterSeconds))setLocked(true);
        backgroundAtRef.current=null;
      }else if(previous==='active'){
        backgroundAtRef.current=Date.now();
        if(securityConfig.enabled&&securityConfig.lockAfterSeconds===0)setLocked(true);
      }
      appStateRef.current=nextState;
    });
    return()=>subscription.remove();
  },[securityConfig.enabled,securityConfig.lockAfterSeconds]);


  async function persistSettings(next){const saved=await saveSettings(next);setSettings(saved);return saved;}
  async function persistNepalData(next){const saved=await saveNepalData(next);setNepalData(saved);return saved;}
  async function persistPlanningData(next){const saved=await savePlanningData(next);setPlanningData(saved);return saved;}
  function openAdd(eventId=''){setEditing(null);setDraftEventId(eventId);setTransactionOpen(true);}
  function openEdit(tx){setDetailsTransaction(null);setEditing(tx);setDraftEventId(tx.eventId||'');setTransactionOpen(true);}
  function openDetails(tx){setDetailsTransaction(tx);}
  async function saveTransaction(tx){const exists=transactions.some(item=>item.id===tx.id);const next=(exists?transactions.map(item=>item.id===tx.id?tx:item):[tx,...transactions]).sort((a,b)=>String(b.date).localeCompare(String(a.date)));setTransactions(next);await saveTransactions(next);setEditing(null);setDraftEventId('');setTransactionOpen(false);}
  function remove(id){const target=transactions.find(item=>item.id===id);const recurring=Boolean(target?.recurringId);Alert.alert(recurring?'Skip recurring occurrence?':'Delete transaction?',recurring?'This occurrence will stay skipped. Future repeats remain active.':'This removes it from your local history.',[{text:'Cancel',style:'cancel'},{text:recurring?'Skip':'Delete',style:'destructive',onPress:async()=>{if(recurring){const rules=settings.recurringTransactions.map(rule=>rule.id===target.recurringId?{...rule,skippedOccurrences:[...new Set([...(rule.skippedOccurrences||[]),id])]}:rule);await persistSettings({...settings,recurringTransactions:rules});}let nextNepal=nepalData;if(target?.udharoPayment?.recordId){nextNepal={...nepalData,udharo:nepalData.udharo.map(record=>record.id===target.udharoPayment.recordId?reverseUdhaaroPayment(record,id):record)};setNepalData(nextNepal);}const next=transactions.filter(x=>x.id!==id);setTransactions(next);await Promise.all([saveTransactions(next),target?.udharoPayment?.recordId?saveNepalData(nextNepal):Promise.resolve()]);}}]);}
  async function updateBudget(){const amount=normalizeAmount(budgetDraft);if(!amount)return Alert.alert('Enter a valid budget','Use an amount greater than zero.');await persistSettings({...settings,monthlyBudget:amount});Alert.alert('Budget updated',`${money(amount,settings)} for this month.`);}
  async function addWallet(wallet){await persistSettings({...settings,wallets:[...settings.wallets,wallet]});setWalletOpen(false);}
  async function saveWalletTransfer(tx){await saveTransaction(tx);setTransferOpen(false);}
  async function addCategory({type,item}){const duplicate=categoryPairs(type,settings.customCategories).some(([name])=>name.toLowerCase()===item.name.toLowerCase());if(duplicate)return Alert.alert('Category already exists','Choose a different name.');await persistSettings({...settings,customCategories:{...settings.customCategories,[type]:[...(settings.customCategories[type]||[]),item]}});setCategoryOpen(false);}
  async function removeCategory(type,id,name){const nextBudgets={...settings.categoryBudgets};delete nextBudgets[name];await persistSettings({...settings,customCategories:{...settings.customCategories,[type]:(settings.customCategories[type]||[]).filter(item=>item.id!==id)},categoryBudgets:nextBudgets});}
  async function saveCategoryBudget(){const amount=normalizeAmount(categoryBudgetDraft);if(!amount)return Alert.alert('Enter a category budget','Use an amount greater than zero.');await persistSettings({...settings,categoryBudgets:{...settings.categoryBudgets,[categoryBudgetCategory]:amount}});setCategoryBudgetDraft('');}
  async function removeCategoryBudget(category){const next={...settings.categoryBudgets};delete next[category];await persistSettings({...settings,categoryBudgets:next});}
  async function addRecurring(rule){const nextSettings=await persistSettings({...settings,recurringTransactions:[...settings.recurringTransactions,rule]});const materialized=materializeRecurringTransactions(transactions,nextSettings.recurringTransactions,today);setTransactions(materialized.transactions);if(materialized.created.length)await saveTransactions(materialized.transactions);setRecurringEditorOpen(false);}
  async function toggleRecurring(id){const rules=settings.recurringTransactions.map(rule=>rule.id===id?{...rule,active:!rule.active}:rule);const nextSettings=await persistSettings({...settings,recurringTransactions:rules});const materialized=materializeRecurringTransactions(transactions,nextSettings.recurringTransactions,today);setTransactions(materialized.transactions);if(materialized.created.length)await saveTransactions(materialized.transactions);}
  async function deleteRecurring(id){await persistSettings({...settings,recurringTransactions:settings.recurringTransactions.filter(rule=>rule.id!==id)});}
  async function addRecurringSuggestion(suggestion){
    if(!suggestion?.nextDate)return;
    await addRecurring({
      id:`suggested-${Date.now()}`,
      type:suggestion.type,
      amount:suggestion.amount,
      category:suggestion.category,
      note:suggestion.note,
      walletId:suggestion.walletId,
      frequency:suggestion.frequency,
      startDate:suggestion.nextDate,
      active:true,
      skippedOccurrences:[],
    });
    Alert.alert('Recurring rule added',`${suggestion.note||suggestion.category} will repeat ${suggestion.frequency}.`);
  }
  async function saveReminderSettings(input){
    let next=normalizeReminderSettings(input);
    if(next.enabled&&!reminderPermission){
      const granted=await requestReminderPermission();
      setReminderPermission(granted);
      if(!granted){
        next={...next,enabled:false};
        Alert.alert('Notifications not enabled','Kharcha will keep reminders off until notification permission is allowed.');
      }
    }
    await persistSettings({...settings,reminders:next});
    setReminderOpen(false);
  }
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
  async function createPortableBackup(){
    setBackupBusy(true);
    try{
      const state=await loadFullState();
      const envelope=createBackupEnvelope(state,{appVersion:APP_VERSION});
      await shareBackupText(serializeBackup(envelope),envelope.metadata.createdAt);
    }catch(error){
      Alert.alert('Backup failed',error?.message||'Kharcha could not create the backup.');
    }finally{
      setBackupBusy(false);
    }
  }

  async function applyBackupRestore(parsed){
    setBackupBusy(true);
    try{
      const restored=await restoreFullState(parsed.state);
      setTransactions(restored.transactions);
      setSettings(restored.settings);
      setNepalData(restored.nepalData);
      setPlanningData(restored.planningData);
      setBudgetDraft(String(restored.settings.monthlyBudget));
      setDataSafetyOpen(false);
      Alert.alert('Backup restored','Kharcha restored the selected backup successfully.');
    }catch(error){
      Alert.alert('Restore failed',error?.message||'Kharcha could not restore this backup.');
    }finally{
      setBackupBusy(false);
    }
  }

  function applyStateToUi(state){
    setTransactions(state.transactions);setSettings(state.settings);setNepalData(state.nepalData);setPlanningData(state.planningData);setBudgetDraft(String(state.settings.monthlyBudget));
  }
  async function refreshSafetySnapshot(){try{setSnapshotInfo(await getSafetySnapshotInfo());}catch{setSnapshotInfo(null);}}

  async function exportTransactionsCsv(options){
    setBackupBusy(true);
    try{
      const result=createTransactionsCsv({transactions,settings,nepalData,planningData},{...options,exportedAt:new Date().toISOString()});
      if(!result.rowCount)return Alert.alert('Nothing to export','No transactions match this export range.');
      await shareCsvExport(result);setCsvExportOpen(false);
    }catch(error){Alert.alert('Export failed',error?.message||'Kharcha could not create this CSV export.');}
    finally{setBackupBusy(false);}
  }

  async function generateMonthlyPdf(month){
    setBackupBusy(true);
    try{
      const report=buildMonthlyReport({transactions,settings,nepalData,planningData},month,{asOfDate:month===currentMonth?today:undefined});
      await shareMonthlyPdf({html:renderMonthlyReportHtml(report,settings),monthKey:month});setMonthlyReportOpen(false);
    }catch(error){Alert.alert('Report failed',error?.message||'Kharcha could not generate this monthly PDF.');}
    finally{setBackupBusy(false);}
  }

  async function chooseCsvImport(){
    setBackupBusy(true);
    let picked,preview;
    try{
      picked=await pickCsvImportText();if(!picked)return;
      preview=prepareTransactionImport(picked.text,{transactions,settings,nepalData,planningData});
    }catch(error){Alert.alert('CSV not accepted',error?.message||'Kharcha could not validate this CSV.');return;}
    finally{setBackupBusy(false);}
    if(!preview.transactions.length)return Alert.alert('Nothing to import',`${preview.duplicates.length} duplicates · ${preview.invalid.length} invalid rows`);
    Alert.alert('Import transactions?',`${picked.name}\n\nNew: ${preview.transactions.length}\nDuplicates skipped: ${preview.duplicates.length}\nInvalid rows: ${preview.invalid.length}\nWarnings: ${preview.warnings.length}\n\nA safety snapshot will be saved first.`,[
      {text:'Cancel',style:'cancel'},
      {text:'Import',onPress:async()=>{
        setBackupBusy(true);try{
          const merged=mergeImportedTransactions(transactions,preview.transactions);
          const nextNepal={...nepalData,udharo:reconcileUdhaaroRecords(nepalData.udharo,merged)};
          const restored=await applyFullStateWithSafetySnapshot({transactions:merged,settings,nepalData:nextNepal,planningData});
          applyStateToUi(restored);await refreshSafetySnapshot();
          Alert.alert('Import complete',`${preview.transactions.length} transactions imported.`);
        }catch(error){Alert.alert('Import failed',error?.message||'Kharcha could not import this CSV.');}
        finally{setBackupBusy(false);}
      }}
    ]);
  }

  function clearMonthSafely(month){
    let prepared;
    try{prepared=prepareMonthDeletion({transactions,settings,nepalData,planningData},month);}catch(error){return Alert.alert('Check month',error.message);}
    if(!prepared.removedCount)return Alert.alert('Nothing to clear',`No transactions were found in ${month}.`);
    Alert.alert('Clear this month?',`${prepared.removedCount} transactions from ${month} will be removed. A safety snapshot is saved first.`,[
      {text:'Cancel',style:'cancel'},
      {text:'Clear month',style:'destructive',onPress:async()=>{
        setBackupBusy(true);try{const restored=await applyFullStateWithSafetySnapshot(prepared.state);applyStateToUi(restored);await refreshSafetySnapshot();Alert.alert('Month cleared',`${prepared.removedCount} transactions removed.`);}catch(error){Alert.alert('Clear failed',error?.message||'Kharcha could not clear this month.');}finally{setBackupBusy(false);}
      }}
    ]);
  }

  function deleteAllSafely(){
    Alert.alert('Delete all Kharcha data?','All transactions, wallets, categories, budgets, Udhaaro and planning data will reset. A safety snapshot is saved first.',[
      {text:'Cancel',style:'cancel'},
      {text:'Delete all',style:'destructive',onPress:async()=>{
        setBackupBusy(true);try{
          const restored=await applyFullStateWithSafetySnapshot({transactions:[],settings:defaultSettings,nepalData:defaultNepalData,planningData:defaultPlanningData});
          applyStateToUi(restored);await refreshSafetySnapshot();Alert.alert('Kharcha reset','All app data was reset. You can restore the last safety snapshot from Data management.');
        }catch(error){Alert.alert('Reset failed',error?.message||'Kharcha could not reset safely.');}
        finally{setBackupBusy(false);}
      }}
    ]);
  }

  async function restoreSafetySnapshot(){
    setBackupBusy(true);try{const restored=await restoreLastSafetySnapshot();applyStateToUi(restored);await refreshSafetySnapshot();Alert.alert('Safety snapshot restored','Your previous Kharcha state is back.');}
    catch(error){Alert.alert('Restore failed',error?.message||'Kharcha could not restore the safety snapshot.');}
    finally{setBackupBusy(false);}
  }

  async function enableSecurityPin(pin){
    if(!isValidPin(pin))return Alert.alert('Check PIN','Use 4 to 6 numeric digits.');
    setSecurityBusy(true);try{const config=await enablePinLock(pin);setSecurityConfig(config);setBiometricAvailable(await getBiometricAvailability());Alert.alert('App lock enabled','Kharcha will lock when you leave the app based on your auto-lock setting.');}catch(error){Alert.alert('Could not enable lock',error?.message||'Try again.');}finally{setSecurityBusy(false);}
  }
  async function updateSecurityPin(currentPin,newPin){
    if(!isValidPin(newPin))return Alert.alert('Check new PIN','Use 4 to 6 numeric digits.');
    setSecurityBusy(true);try{if(!(await verifyPin(currentPin)))return Alert.alert('Incorrect PIN','The current PIN did not match.');await updatePin(newPin);Alert.alert('PIN updated','Your Kharcha app-lock PIN has been changed.');}catch(error){Alert.alert('Could not update PIN',error?.message||'Try again.');}finally{setSecurityBusy(false);}
  }
  async function disableSecurity(currentPin){
    setSecurityBusy(true);try{if(!(await verifyPin(currentPin)))return Alert.alert('Incorrect PIN','The current PIN did not match.');const config=await disableAppLock();setSecurityConfig(config);setLocked(false);setSecurityOpen(false);setFailedAttempts(0);setCooldownUntil(0);Alert.alert('App lock disabled','Kharcha will no longer ask for a PIN when reopened.');}catch(error){Alert.alert('Could not disable lock',error?.message||'Try again.');}finally{setSecurityBusy(false);}
  }
  async function toggleSecurityBiometric(enabled){
    setSecurityBusy(true);try{
      if(enabled){const result=await authenticateBiometric();if(!result.success)return Alert.alert('Biometric not enabled','Authentication was not completed.');}
      const config=await setBiometricEnabled(enabled);setSecurityConfig(config);
    }catch(error){Alert.alert('Biometric unavailable',error?.message||'Kharcha could not update biometric unlock.');}finally{setSecurityBusy(false);}
  }
  async function changeSecurityTimeout(seconds){
    setSecurityBusy(true);try{const config=await setLockAfterSeconds(seconds);setSecurityConfig(config);}catch(error){Alert.alert('Could not update auto-lock',error?.message||'Try again.');}finally{setSecurityBusy(false);}
  }
  async function unlockWithPin(pin){
    const result=await attemptPinUnlock(pin);
    setFailedAttempts(result.state.failureCount);
    setCooldownUntil(result.state.cooldownUntil);
    if(result.success){setLocked(false);return true;}
    return false;
  }
  async function unlockWithBiometric(){
    const result=await authenticateBiometric();
    if(result.success){setLocked(false);setFailedAttempts(0);setCooldownUntil(0);return true;}
    return false;
  }

  async function chooseBackupToRestore(){
    setBackupBusy(true);
    let picked;
    let parsed;
    try{
      picked=await pickBackupText();
      if(!picked)return;
      parsed=parseBackup(picked.text);
    }catch(error){
      Alert.alert('Backup not accepted',error?.message||'Kharcha could not validate this backup.');
      return;
    }finally{
      setBackupBusy(false);
    }
    const created=parsed.metadata.createdAt?new Date(parsed.metadata.createdAt).toLocaleString():'Unknown date';
    Alert.alert(
      'Restore this backup?',
      `${picked.name}\nCreated: ${created}\nKharcha version: ${parsed.metadata.appVersion}\n\nYour current Kharcha data will be replaced. A recovery snapshot is created before the restore starts.`,
      [
        {text:'Cancel',style:'cancel'},
        {text:'Restore',style:'destructive',onPress:()=>applyBackupRestore(parsed)},
      ],
    );
  }


  if(!ready||!securityReady)return <SafeAreaView style={[s.safe,s.center]}><StatusBar barStyle="dark-content"/><Text style={s.brand}>Kharcha</Text><Text style={s.meta}>Loading your money view…</Text></SafeAreaView>;
  if(locked)return <LockScreen onUnlockPin={unlockWithPin} onUnlockBiometric={unlockWithBiometric} biometricEnabled={securityConfig.biometricEnabled} biometricAvailable={biometricAvailable} cooldownUntil={cooldownUntil} failedAttempts={failedAttempts}/>;
  const lang=settings.language;
  const m=(value)=>money(value,settings);
  return <SafeAreaView style={s.safe}><StatusBar barStyle="dark-content" backgroundColor={COLORS.bg}/><View style={s.app}>
    <View style={s.top}><View><Text style={s.eyebrow}>{t(lang,'personalMoney','PERSONAL MONEY').toUpperCase()}</Text><Text style={s.brand}>Kharcha</Text></View><Pressable style={s.badge} onPress={()=>setSettingsOpen(true)}><Text style={s.dot}>●</Text><Text style={s.badgeText}>{lang==='ne'?'नेपाली · ':'EN · '}{settings.dateSystem}</Text></Pressable></View>
    <View style={s.content}>
      {tab==='overview'&&<OverviewScreen lang={lang} summary={summary} m={m} wallets={wallets} settings={settings} setWalletOpen={setWalletOpen} onTransfer={()=>setTransferOpen(true)} budget={budget} transactions={transactions} currentMonth={currentMonth} setTab={setTab} remove={remove} openEdit={openEdit} openDetails={openDetails} openAdd={openAdd}/>} 
      {tab==='activity'&&<ActivityScreen lang={lang} query={query} setQuery={setQuery} filterType={filterType} setFilterType={setFilterType} filterWallet={filterWallet} setFilterWallet={setFilterWallet} filterCategory={filterCategory} setFilterCategory={setFilterCategory} filterPeriod={filterPeriod} setFilterPeriod={setFilterPeriod} clearFilters={clearFilters} settings={settings} activityCategories={activityCategories} filteredTransactions={filteredTransactions} transactions={transactions} remove={remove} openEdit={openEdit} openDetails={openDetails} openAdd={openAdd} m={m}/>} 
      {tab==='budget'&&<BudgetScreen lang={lang} budgetDraft={budgetDraft} setBudgetDraft={setBudgetDraft} updateBudget={updateBudget} expenseCategories={expenseCategories} categoryBudgetCategory={categoryBudgetCategory} setCategoryBudgetCategory={setCategoryBudgetCategory} categoryBudgetDraft={categoryBudgetDraft} setCategoryBudgetDraft={setCategoryBudgetDraft} settings={settings} saveCategoryBudget={saveCategoryBudget} categoryBudgets={categoryBudgets} removeCategoryBudget={removeCategoryBudget} m={m} breakdown={breakdown} budget={budget} transactions={transactions} summary={summary} currentMonth={currentMonth} setTab={setTab} setWalletOpen={setWalletOpen} setCategoryOpen={setCategoryOpen} setRecurringOpen={setRecurringOpen} setSettingsOpen={setSettingsOpen} removeCategory={removeCategory} toggleRecurring={toggleRecurring} deleteRecurring={deleteRecurring} today={today}/>} 
      {tab==='insights'&&<InsightsScreen lang={lang} breakdown={breakdown} m={m} transactions={transactions} currentMonth={currentMonth} today={today} summary={summary} settings={settings} remittance={remittance} udharo={udharo} nepalData={nepalData} eventStatuses={eventStatuses} obligationStatuses={obligationStatuses} savingsStatuses={savingsStatuses} householdStatuses={householdStatuses} planningSummary={planningSummary} smartInsights={smartInsights} onAddRecurringSuggestion={addRecurringSuggestion} remindersEnabled={settings.reminders?.enabled} reminderPermission={reminderPermission} onOpenReminders={()=>setReminderOpen(true)} setSettingsOpen={setSettingsOpen} setRemittanceOpen={setRemittanceOpen} setPaymentRecord={setPaymentRecord} setUdhaaroOpen={setUdhaaroOpen} setEventOpen={setEventOpen} setObligationOpen={setObligationOpen} setPaymentObligation={setPaymentObligation} setSavingsOpen={setSavingsOpen} setSavingsMovement={setSavingsMovement} setHouseholdOpen={setHouseholdOpen} setTab={setTab} openAdd={openAdd}/>} 
    </View>
    <View style={s.bottom}>{[['overview','⌂',t(lang,'overview','Overview')],['activity','≡',t(lang,'activity','Activity')]].map(([k,i,l])=><Tab key={k} active={tab===k} icon={i} label={l} onPress={()=>setTab(k)}/>)}<Pressable style={s.fab} onPress={()=>openAdd()} accessibilityRole="button" accessibilityLabel="Add transaction"><Text style={s.fabText}>＋</Text></Pressable>{[['budget','◫',t(lang,'budget','Budget')],['insights','◔',t(lang,'reports','Reports')]].map(([k,i,l])=><Tab key={k} active={tab===k} icon={i} label={l} onPress={()=>setTab(k)}/>)}</View>
    <AddTransactionModal visible={transactionOpen} initialTransaction={editing} wallets={settings.wallets} customCategories={settings.customCategories} events={nepalData.events} householdBudgets={planningData.householdBudgets} settings={settings} initialEventId={draftEventId} onClose={()=>{setTransactionOpen(false);setEditing(null);setDraftEventId('');}} onSave={saveTransaction}/>
    <WalletModal visible={walletOpen} language={lang} onClose={()=>setWalletOpen(false)} onSave={addWallet}/><TransferModal visible={transferOpen} settings={settings} wallets={settings.wallets} onClose={()=>setTransferOpen(false)} onSave={saveWalletTransfer}/><CategoryModal visible={categoryOpen} language={lang} onClose={()=>setCategoryOpen(false)} onSave={addCategory}/><RecurringManagerModal visible={recurringOpen} onClose={()=>setRecurringOpen(false)} onAdd={()=>{setRecurringOpen(false);setRecurringEditorOpen(true);}} rules={settings.recurringTransactions} settings={settings} money={m} today={today} onToggle={toggleRecurring} onDelete={deleteRecurring}/><RecurringModal visible={recurringEditorOpen} settings={settings} onClose={()=>setRecurringEditorOpen(false)} onSave={addRecurring} wallets={settings.wallets} customCategories={settings.customCategories}/>
    <NepalSettingsModal visible={settingsOpen} settings={settings} onClose={()=>setSettingsOpen(false)} onSave={async(next)=>{await persistSettings(next);setSettingsOpen(false);}} onDataSafety={()=>{setSettingsOpen(false);setDataSafetyOpen(true);}}/><RemittanceModal visible={remittanceOpen} wallets={settings.wallets} settings={settings} onClose={()=>setRemittanceOpen(false)} onSave={saveRemittance}/><UdhaaroModal visible={udharoOpen} paymentRecord={paymentRecord} settings={settings} wallets={settings.wallets} onClose={()=>{setUdhaaroOpen(false);setPaymentRecord(null);}} onSave={addUdhaaro} onPay={payUdhaaro}/><EventBudgetModal visible={eventOpen} settings={settings} onClose={()=>setEventOpen(false)} onSave={addEvent}/><ObligationModal visible={obligationOpen} paymentTarget={paymentObligation} settings={settings} wallets={settings.wallets} onClose={()=>{setObligationOpen(false);setPaymentObligation(null);}} onSave={addObligation} onPay={payObligation}/><SavingsGoalModal visible={savingsOpen} movementTarget={savingsMovement} settings={settings} wallets={settings.wallets} onClose={()=>{setSavingsOpen(false);setSavingsMovement(null);}} onSaveGoal={addSavingsGoal} onMove={moveSavingsGoal}/><HouseholdBudgetModal visible={householdOpen} settings={settings} onClose={()=>setHouseholdOpen(false)} onSave={addHouseholdBudget}/><DataSafetyModal visible={dataSafetyOpen} language={settings.language} busy={backupBusy} onClose={()=>setDataSafetyOpen(false)} onBackup={createPortableBackup} onRestore={chooseBackupToRestore} onCsvExport={()=>{setDataSafetyOpen(false);setCsvExportOpen(true);}} onMonthlyReport={()=>{setDataSafetyOpen(false);setMonthlyReportOpen(true);}} onDataManagement={async()=>{setDataSafetyOpen(false);await refreshSafetySnapshot();setDataManagementOpen(true);}} onSecurity={()=>{setDataSafetyOpen(false);setSecurityOpen(true);}}/><CsvExportModal visible={csvExportOpen} language={settings.language} busy={backupBusy} onClose={()=>setCsvExportOpen(false)} onExport={exportTransactionsCsv}/><MonthlyReportModal visible={monthlyReportOpen} language={settings.language} busy={backupBusy} onClose={()=>setMonthlyReportOpen(false)} onGenerate={generateMonthlyPdf}/><DataManagementModal visible={dataManagementOpen} busy={backupBusy} snapshotInfo={snapshotInfo} onClose={()=>setDataManagementOpen(false)} onImport={chooseCsvImport} onClearMonth={clearMonthSafely} onDeleteAll={deleteAllSafely} onRestoreSnapshot={restoreSafetySnapshot}/><TransactionDetailsModal visible={Boolean(detailsTransaction)} item={detailsTransaction} settings={settings} wallets={settings.wallets} money={m} onClose={()=>setDetailsTransaction(null)} onEdit={openEdit} onDelete={(id)=>{setDetailsTransaction(null);remove(id);}}/><ReminderSettingsModal visible={reminderOpen} settings={settings} permissionGranted={reminderPermission} onClose={()=>setReminderOpen(false)} onSave={saveReminderSettings}/><SecuritySettingsModal visible={securityOpen} onClose={()=>setSecurityOpen(false)} config={securityConfig} biometricAvailable={biometricAvailable} busy={securityBusy} onEnable={enableSecurityPin} onUpdatePin={updateSecurityPin} onDisable={disableSecurity} onToggleBiometric={toggleSecurityBiometric} onSetTimeout={changeSecurityTimeout}/>
  </View></SafeAreaView>;
}
