import React, { useMemo, useState } from 'react';
import { Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { COLORS } from '../constants';
import { categoryLabel, t } from '../i18n';
import s from '../appStyles';
import { FinanceCard, Progress, Section, TransactionRow } from '../components/AppPrimitives';
import NativeIcon, { categoryIconName } from '../components/NativeIcon';
import HapticPressable from '../components/HapticPressable';
const { nextRecurringDate } = require('../domain/phaseOne');

function shiftMonth(monthKey, offset){
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
function sum(items,type,monthKey){
  return (items||[]).filter(item=>item.type===type&&!item.savingsGoalMovement&&String(item.date||'').slice(0,7)===monthKey).reduce((total,item)=>total+(Number(item.amount)||0),0);
}
function categoryTotals(items,type,monthKey){
  const totals=new Map();
  for(const item of items||[]){
    if(item.type!==type||item.savingsGoalMovement||String(item.date||'').slice(0,7)!==monthKey)continue;
    const category=item.category||'Other';
    totals.set(category,(totals.get(category)||0)+(Number(item.amount)||0));
  }
  return [...totals].map(([category,amount])=>({category,amount})).sort((a,b)=>b.amount-a.amount);
}

function Header({title,onBack,right}){
  return <View style={s.budgetFlowHeader}>{onBack?<HapticPressable style={s.headerIconButton} onPress={onBack} accessibilityRole="button" accessibilityLabel="Back"><NativeIcon name="chevron-left" size={22} color={COLORS.text}/></HapticPressable>:<View style={s.headerIconButton}/>}<Text style={s.budgetFlowTitle}>{title}</Text>{right||<View style={s.headerIconButton}/>}</View>;
}
function MonthStrip({transactions,currentMonth}){
  const months=useMemo(()=>Array.from({length:6},(_,index)=>shiftMonth(currentMonth,index-3)),[currentMonth]);
  const max=Math.max(1,...months.flatMap(key=>[sum(transactions,'income',key),sum(transactions,'expense',key)]));
  return <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.monthStrip}>{months.map(key=>{
    const income=sum(transactions,'income',key),expense=sum(transactions,'expense',key),active=key===currentMonth;
    return <View key={key} style={[s.monthCard,!active&&s.monthCardMuted]}><Text style={s.monthCardLabel}>{monthLabel(key)}</Text><View style={s.monthBars}><View style={s.monthBarTrack}><View style={[s.monthBar,{height:`${Math.max(8,(income/max)*100)}%`,backgroundColor:COLORS.success}]}/></View><View style={s.monthBarTrack}><View style={[s.monthBar,{height:`${Math.max(8,(expense/max)*100)}%`,backgroundColor:COLORS.danger}]}/></View></View></View>;
  })}</ScrollView>;
}
function CashflowCard({summary,m}){
  return <View style={s.cashflowCard}><View style={s.cashflowItem}><Text style={s.meta}>Income</Text><Text style={[s.cashflowValue,s.income]}>{m(summary.income)}</Text></View><View style={s.cashflowDivider}/><View style={s.cashflowItem}><Text style={s.meta}>Expenses</Text><Text style={[s.cashflowValue,s.danger]}>−{m(summary.expense)}</Text></View><View style={s.cashflowDivider}/><View style={s.cashflowItem}><Text style={s.meta}>Cash flow</Text><Text style={s.cashflowValue}>{m(summary.balance)}</Text></View></View>;
}
function BreakdownTabs({value,onChange}){
  return <View style={s.breakdownTabs}>{['expense','budget','income'].map(key=><Pressable key={key} onPress={()=>onChange(key)} style={[s.breakdownTab,value===key&&s.breakdownTabActive]} accessibilityRole="tab" accessibilityState={{selected:value===key}}><Text style={[s.breakdownTabText,value===key&&s.breakdownTabTextActive]}>{key==='expense'?'Expenses':key==='income'?'Income':'Budget'}</Text></Pressable>)}</View>;
}
function CategoryRows({items,total,type,m,settings,onSelect}){
  if(!items.length)return <Text style={s.emptyInline}>No category activity yet.</Text>;
  return <View>{items.map((item,index)=>{
    const ratio=total?item.amount/total:0;
    return <Pressable key={item.category} onPress={()=>onSelect?.(item.category)} disabled={!onSelect} style={[s.breakdownRow,index>0&&s.breakdownRowBorder]}>
      <View style={[s.icon,type==='income'?s.iconIncome:s.iconExpense]}><NativeIcon name={categoryIconName(item.category,type)} size={18} color={type==='income'?'#239B78':'#E45757'}/></View>
      <View style={{flex:1}}><View style={s.between}><View style={{flex:1}}><Text style={s.rowTitle}>{categoryLabel(item.category,settings.language)}</Text><Text style={s.meta}>{Math.round(ratio*100)}% {type==='income'?'of income':'of expenses'}</Text></View><Text style={s.rowTitle}>{m(item.amount)}</Text></View><Progress value={ratio} tone={type==='income'?'success':'danger'}/></View>
    </Pressable>;
  })}</View>;
}
function BudgetRows({categoryBudgets,m,settings,onEdit,onRemove}){
  if(!categoryBudgets.length)return <Text style={s.emptyInline}>No category budgets yet.</Text>;
  return <View>{categoryBudgets.map((item,index)=><Pressable key={item.category} onPress={()=>onEdit(item.category)} style={[s.breakdownRow,index>0&&s.breakdownRowBorder]}>
    <View style={s.icon}><NativeIcon name={categoryIconName(item.category,'expense')} size={18} color="#0074FC"/></View>
    <View style={{flex:1}}><View style={s.between}><View><Text style={s.rowTitle}>{categoryLabel(item.category,settings.language)}</Text><Text style={s.meta}>{m(item.spent)} of {m(item.limit)}</Text></View><Text style={s.percent}>{Math.round(item.progress*100)}%</Text></View><Progress value={item.progress} tone={item.overBy>0?'danger':'primary'}/>{item.overBy>0?<Text style={s.danger}>+{m(item.overBy)}</Text>:<Text style={s.meta}>{m(item.remaining)} left</Text>}</View>
    {onRemove?<Pressable onPress={()=>onRemove(item.category)} hitSlop={10}><Text style={s.delete}>×</Text></Pressable>:null}
  </Pressable>)}</View>;
}

export default function BudgetScreen({
  lang,budgetDraft,setBudgetDraft,updateBudget,expenseCategories,categoryBudgetCategory,setCategoryBudgetCategory,categoryBudgetDraft,setCategoryBudgetDraft,
  settings,saveCategoryBudget,categoryBudgets,removeCategoryBudget,m,breakdown,budget,transactions,summary,currentMonth,setTab,
  setWalletOpen,setCategoryOpen,setRecurringOpen,setSettingsOpen,removeCategory,toggleRecurring,deleteRecurring,today
}) {
  const [view,setView]=useState('breakdown');
  const [breakdownTab,setBreakdownTab]=useState('expense');
  const [detailCategory,setDetailCategory]=useState('');
  const incomeBreakdown=useMemo(()=>categoryTotals(transactions,'income',currentMonth),[transactions,currentMonth]);
  const expenseTotal=summary.expense||0,incomeTotal=summary.income||0;
  const potentialSavings=Math.max(summary.income-budget.limit,0);

  function chooseCategory(name){
    setCategoryBudgetCategory(name);
    setCategoryBudgetDraft(settings.categoryBudgets[name]?String(settings.categoryBudgets[name]):'');
    setView('categoryEditor');
  }
  async function saveOverallBudget(){await updateBudget();setView('management');}
  async function saveSelectedCategory(){await saveCategoryBudget();setView('management');}

  if(view==='incomeEditor')return <ScrollView contentInsetAdjustmentBehavior="automatic" showsVerticalScrollIndicator={false} contentContainerStyle={s.scroll}>
    <Header title="Budget Management" onBack={()=>setView('management')}/>
    <FinanceCard title="Monthly Income" action="">
      <Text style={s.cardTitle}>{m(summary.income)}</Text><Text style={s.meta}>Recorded take-home income for {monthLabel(currentMonth)}.</Text>
      <View style={s.miniChart}>{Array.from({length:5},(_,i)=>shiftMonth(currentMonth,i-4)).map(key=>{const value=sum(transactions,'income',key);const max=Math.max(1,...Array.from({length:5},(_,j)=>sum(transactions,'income',shiftMonth(currentMonth,j-4))));return <View key={key} style={s.miniChartColumn}><View style={[s.miniChartBar,{height:`${Math.max(6,(value/max)*100)}%`}]}/><Text style={s.chartLabel}>{monthLabel(key)}</Text></View>;})}</View>
      <Pressable style={s.secondary} onPress={()=>setTab('activity')}><Text style={s.secondaryText}>View Transactions</Text></Pressable>
    </FinanceCard>
    <View style={s.infoCallout}><Text style={s.rowTitle}>How income works in Kharcha</Text><Text style={s.meta}>Monthly income is calculated from recorded income transactions, so it always matches your actual data.</Text></View>
  </ScrollView>;

  if(view==='budgetEditor')return <ScrollView contentInsetAdjustmentBehavior="automatic" showsVerticalScrollIndicator={false} contentContainerStyle={s.scroll}>
    <Header title="Budget Management" onBack={()=>setView('management')}/>
    <FinanceCard title="Monthly Budget" action="">
      <Text style={s.meta}>We deduct your monthly budget from recorded income to show potential savings.</Text>
      <View style={s.budgetEquation}><View><Text style={s.meta}>Monthly income</Text><Text style={s.cardTitle}>{m(summary.income)}</Text></View><Text style={s.equationMark}>−</Text><View><Text style={s.meta}>Monthly budget</Text><Text style={s.cardTitle}>{m(Number(budgetDraft)||0)}</Text></View><Text style={s.equationMark}>=</Text><View><Text style={s.meta}>Potential savings</Text><Text style={[s.cardTitle,s.income]}>{m(Math.max(summary.income-(Number(budgetDraft)||0),0))}</Text></View></View>
      <Text style={s.label}>Monthly budget</Text><View style={s.inputRow}><Text style={s.prefix}>{lang==='ne'?'रु':'NPR'}</Text><TextInput value={budgetDraft} onChangeText={setBudgetDraft} keyboardType="decimal-pad" placeholder="50000" placeholderTextColor={COLORS.muted} style={s.input}/></View>
      <Pressable style={s.primary} onPress={saveOverallBudget}><Text style={s.primaryText}>Save</Text></Pressable>
    </FinanceCard>
  </ScrollView>;

  if(view==='categorySelect')return <ScrollView contentInsetAdjustmentBehavior="automatic" showsVerticalScrollIndicator={false} contentContainerStyle={s.scroll}>
    <Header title="Add Category" onBack={()=>setView('management')}/>
    <View style={s.categoryPickerCard}>
      <Text style={s.cardHeaderTitle}>Choose a category to budget</Text>
      <Text style={[s.meta,{marginTop:4}]}>Recent spending helps you decide where a limit is useful.</Text>
      <View style={{marginTop:12}}>{expenseCategories.map(([name],index)=>{const spent=breakdown.find(item=>item.category===name)?.amount||0;return <HapticPressable haptic={null} key={name} onPress={()=>chooseCategory(name)} style={[s.categoryPickerRow,index>0&&s.breakdownRowBorder]}><View style={s.icon}><NativeIcon name={categoryIconName(name,'expense')} size={18} color="#0074FC"/></View><View style={{flex:1}}><Text style={s.rowTitle}>{categoryLabel(name,lang)}</Text><Text style={s.meta}>{spent?m(spent)+' this month':'No spend this month'}</Text></View><NativeIcon name="chevron-right" size={18} color={COLORS.muted}/></HapticPressable>;})}</View>
      <Pressable style={s.secondary} onPress={()=>setCategoryOpen(true)}><Text style={s.secondaryText}>Create custom category</Text></Pressable>
    </View>
  </ScrollView>;

  if(view==='categoryEditor')return <ScrollView contentInsetAdjustmentBehavior="automatic" showsVerticalScrollIndicator={false} contentContainerStyle={s.scroll}>
    <Header title="Budget by Category" onBack={()=>setView('categorySelect')}/>
    <FinanceCard title={categoryLabel(categoryBudgetCategory,lang)} action="">
      <Text style={s.meta}>Budget for {monthLabel(currentMonth)} · applies to future months until changed.</Text>
      <Text style={s.label}>Category budget</Text><View style={s.inputRow}><Text style={s.prefix}>{lang==='ne'?'रु':'NPR'}</Text><TextInput value={categoryBudgetDraft} onChangeText={setCategoryBudgetDraft} keyboardType="decimal-pad" placeholder="5000" placeholderTextColor={COLORS.muted} style={s.input}/></View>
      <View style={s.budgetStatRow}><View><Text style={s.meta}>Spent this month</Text><Text style={s.rowTitle}>{m(breakdown.find(item=>item.category===categoryBudgetCategory)?.amount||0)}</Text></View><View><Text style={s.meta}>Current limit</Text><Text style={s.rowTitle}>{m(settings.categoryBudgets[categoryBudgetCategory]||0)}</Text></View></View>
      <Pressable style={s.primary} onPress={saveSelectedCategory}><Text style={s.primaryText}>Save</Text></Pressable>
    </FinanceCard>
  </ScrollView>;

  if(view==='detail'){
    const categoryTransactions=transactions.filter(item=>item.type==='expense'&&item.category===detailCategory&&String(item.date||'').slice(0,7)===currentMonth);
    const amount=categoryTransactions.reduce((total,item)=>total+(Number(item.amount)||0),0);
    return <ScrollView contentInsetAdjustmentBehavior="automatic" showsVerticalScrollIndicator={false} contentContainerStyle={s.scroll}>
      <Header title="Category Breakdown" onBack={()=>setView('breakdown')}/>
      <FinanceCard title={categoryLabel(detailCategory,lang)} action="">
        <View style={s.between}><View><Text style={s.meta}>{monthLabel(currentMonth)}</Text><Text style={s.metricValueLarge}>{m(amount)}</Text></View><View style={s.pill}><Text style={s.pillText}>{Math.round(expenseTotal?amount/expenseTotal*100:0)}%</Text></View></View>
        <Text style={s.meta}>of this month’s expenses</Text>
      </FinanceCard>
      <Section title="List Transactions"/>
      <View style={s.list}>{categoryTransactions.length?categoryTransactions.map((item,index)=><View key={item.id}><TransactionRow item={item} settings={settings} money={m} wallets={settings.wallets} customCategories={settings.customCategories} showActions={false}/>{index<categoryTransactions.length-1?<View style={s.rowDivider}/>:null}</View>):<Text style={s.emptyInline}>No transactions in this category.</Text>}</View>
      <Section title="Regular Costs"/>
      <View style={s.infoCallout}><Text style={s.rowTitle}>Recurring patterns</Text><Text style={s.meta}>Recurring transactions for this category are managed from Money setup.</Text><Pressable style={s.secondary} onPress={()=>setRecurringOpen(true)}><Text style={s.secondaryText}>Manage recurring transactions</Text></Pressable></View>
    </ScrollView>;
  }

  if(view==='management')return <ScrollView contentInsetAdjustmentBehavior="automatic" showsVerticalScrollIndicator={false} contentContainerStyle={s.scroll}>
    <Header title="Budget Management" onBack={()=>setView('breakdown')}/>
    <MonthStrip transactions={transactions} currentMonth={currentMonth}/>
    <FinanceCard title="Monthly Budget" action="">
      <View style={s.budgetManagementRows}>
        <Pressable style={s.budgetManagementRow} onPress={()=>setView('incomeEditor')}><View><Text style={s.meta}>Monthly income</Text><Text style={s.rowTitle}>{m(summary.income)}</Text></View><Text style={s.headerIconText}>›</Text></Pressable>
        <View style={s.cardDivider}/>
        <Pressable style={s.budgetManagementRow} onPress={()=>setView('budgetEditor')}><View><Text style={s.meta}>Monthly budget</Text><Text style={s.rowTitle}>{m(budget.limit)}</Text></View><Text style={s.headerIconText}>›</Text></Pressable>
        <View style={s.cardDivider}/>
        <View style={s.budgetManagementRow}><View><Text style={s.meta}>Potential savings</Text><Text style={[s.rowTitle,s.income]}>{m(potentialSavings)}</Text></View></View>
      </View>
    </FinanceCard>
    <Section title="Budget Allocation by Category" action="Add Category" onPress={()=>setView('categorySelect')}/>
    <View style={s.list}><BudgetRows categoryBudgets={categoryBudgets} m={m} settings={settings} onEdit={chooseCategory} onRemove={removeCategoryBudget}/>{!categoryBudgets.length?<Pressable style={[s.secondary,{margin:16}]} onPress={()=>setView('categorySelect')}><Text style={s.secondaryText}>Add Category</Text></Pressable>:null}</View>
    <Pressable style={s.primary} onPress={()=>setView('breakdown')}><Text style={s.primaryText}>Done</Text></Pressable>
    <Section title={t(lang,'moneySetup','Money setup')}/>
    <View style={s.setupGrid}><HapticPressable style={s.setupCard} onPress={()=>setWalletOpen(true)}><View style={s.setupIconSurface}><NativeIcon name="wallet" size={21} color="#0074FC"/></View><Text style={s.rowTitle}>{t(lang,'addWallet','Add wallet')}</Text><Text style={s.meta}>Cash, bank and wallets</Text></HapticPressable><HapticPressable style={s.setupCard} onPress={()=>setCategoryOpen(true)}><View style={s.setupIconSurface}><NativeIcon name="tag" size={21} color="#0074FC"/></View><Text style={s.rowTitle}>{t(lang,'addCategory','Add category')}</Text><Text style={s.meta}>Create a custom category</Text></HapticPressable><HapticPressable style={s.setupCard} onPress={()=>setRecurringOpen(true)}><View style={s.setupIconSurface}><NativeIcon name="repeat" size={21} color="#0074FC"/></View><Text style={s.rowTitle}>{t(lang,'recurring','Recurring')}</Text><Text style={s.meta}>Rent, salary and bills</Text></HapticPressable><HapticPressable style={s.setupCard} onPress={()=>setSettingsOpen(true)}><View style={s.setupIconSurface}><NativeIcon name="calendar" size={21} color="#0074FC"/></View><Text style={s.rowTitle}>{t(lang,'settings','Language & calendar')}</Text><Text style={s.meta}>{settings.dateSystem} · {settings.amountFormat}</Text></HapticPressable></View>
    {settings.recurringTransactions.length?<><Section title={t(lang,'recurring','Recurring transactions')} action={t(lang,'add','Add')} onPress={()=>setRecurringOpen(true)}/><View style={s.list}>{settings.recurringTransactions.map(rule=><View key={rule.id} style={s.manageRow}><View style={{flex:1}}><Text style={s.rowTitle}>{rule.note||categoryLabel(rule.category,lang)}</Text><Text style={s.meta}>{rule.frequency} · next {nextRecurringDate(rule,today)||'—'} · {settings.wallets.find(w=>w.id===rule.walletId)?.name||'Cash'}</Text></View><View style={s.manageRight}><Pressable onPress={()=>toggleRecurring(rule.id)}><Text style={rule.active?s.action:s.meta}>{rule.active?t(lang,'active','Active'):t(lang,'paused','Paused')}</Text></Pressable><Pressable onPress={()=>deleteRecurring(rule.id)}><Text style={s.delete}>{t(lang,'delete','Delete')}</Text></Pressable></View></View>)}</View></>:null}
    {(settings.customCategories.expense.length||settings.customCategories.income.length)?<><Section title={lang==='ne'?'आफ्नै श्रेणीहरू':'Custom categories'}/><View style={s.list}>{['expense','income'].flatMap(type=>(settings.customCategories[type]||[]).map(item=><View key={item.id} style={s.manageRow}><Text style={s.rowTitle}>{item.emoji||'✨'} {item.name}</Text><View style={s.manageRight}><Text style={s.meta}>{type}</Text><Pressable onPress={()=>removeCategory(type,item.id,item.name)}><Text style={s.delete}>{t(lang,'remove','Remove')}</Text></Pressable></View></View>))}</View></>:null}
  </ScrollView>;

  const activeItems=breakdownTab==='income'?incomeBreakdown:breakdown;
  const activeTotal=breakdownTab==='income'?incomeTotal:expenseTotal;
  const previewTransactions=transactions.filter(item=>String(item.date||'').slice(0,7)===currentMonth&&(breakdownTab==='budget'||item.type===breakdownTab)).slice(0,5);
  return <ScrollView contentInsetAdjustmentBehavior="automatic" showsVerticalScrollIndicator={false} contentContainerStyle={s.scroll}>
    <Header title="Breakdown & budget" right={<HapticPressable style={s.headerIconButton} onPress={()=>setView('management')} accessibilityRole="button" accessibilityLabel="Budget settings"><NativeIcon name="settings" size={21} color={COLORS.text}/></HapticPressable>}/>
    <MonthStrip transactions={transactions} currentMonth={currentMonth}/>
    <CashflowCard summary={summary} m={m}/>
    <View style={{height:20}}/>
    <FinanceCard title="Category Breakdown">
      <BreakdownTabs value={breakdownTab} onChange={setBreakdownTab}/>
      {breakdownTab==='budget'
        ? <><View style={s.between}><View><Text style={s.meta}>Spent</Text><Text style={s.cardTitle}>{m(budget.spent)}</Text></View><View><Text style={s.meta}>Monthly budget</Text><Text style={s.cardTitle}>{m(budget.limit)}</Text></View><Text style={s.percent}>{Math.round(budget.progress*100)}%</Text></View><Progress value={budget.progress} tone={budget.overBy>0?'danger':'primary'}/><BudgetRows categoryBudgets={categoryBudgets} m={m} settings={settings} onEdit={chooseCategory}/><Pressable style={s.secondary} onPress={()=>setView('management')}><Text style={s.secondaryText}>Manage Categories</Text></Pressable></>
        : <CategoryRows items={activeItems} total={activeTotal} type={breakdownTab} m={m} settings={settings} onSelect={breakdownTab==='expense'?(category)=>{setDetailCategory(category);setView('detail');}:undefined}/>}
    </FinanceCard>
    <Section title="List Transactions" action="See all" onPress={()=>setTab('activity')}/>
    <View style={s.list}>{previewTransactions.length?previewTransactions.map((item,index)=><View key={item.id}><TransactionRow item={item} settings={settings} money={m} wallets={settings.wallets} customCategories={settings.customCategories} showActions={false}/>{index<previewTransactions.length-1?<View style={s.rowDivider}/>:null}</View>):<Text style={s.emptyInline}>No transactions for this view yet.</Text>}</View>
  </ScrollView>;
}
