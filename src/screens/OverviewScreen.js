import React, { useMemo } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { t } from '../i18n';
import s from '../appStyles';
import { Empty, FinanceCard, Progress, Section, TransactionRow } from '../components/AppPrimitives';
import NativeIcon, { walletIconName } from '../components/NativeIcon';
import HapticPressable from '../components/HapticPressable';

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
function seriesFor(transactions,currentMonth){
  const months=Array.from({length:6},(_,index)=>shiftMonth(currentMonth,index-5));
  return months.map(key=>({
    key,label:monthLabel(key),
    amount:transactions.filter(item=>item.type==='expense'&&!item.savingsGoalMovement&&String(item.date||'').slice(0,7)===key).reduce((sum,item)=>sum+(Number(item.amount)||0),0),
  }));
}

export default function OverviewScreen({ lang, summary, m, wallets, settings, setWalletOpen, onTransfer, budget, transactions, currentMonth, setTab, remove, openEdit, openDetails, openAdd }) {
  const series=useMemo(()=>seriesFor(transactions,currentMonth),[transactions,currentMonth]);
  const max=Math.max(...series.map(item=>item.amount),budget.limit||0,1);
  const previous=series.at(-2)?.amount||0;
  const delta=previous?Math.round(((summary.expense-previous)/previous)*100):null;
  return <ScrollView contentInsetAdjustmentBehavior="automatic" showsVerticalScrollIndicator={false} contentContainerStyle={s.scroll}>
    <View style={s.screenTitleRow}><Text style={s.screenTitle}>{t(lang,'overview','Overview')}</Text><View style={s.pill}><Text style={s.pillText}>{monthLabel(currentMonth)}</Text><Text style={s.pillChevron}>⌄</Text></View></View>

    <FinanceCard title={t(lang,'totalExpenses','Total expenses')}>
      <View style={s.between}>
        <View><Text style={s.kicker}>{t(lang,'expenses','Expenses')}</Text><Text style={s.metricValueLarge}>{m(summary.expense)}</Text></View>
        <View style={s.compareBlock}><Text style={s.kicker}>{t(lang,'compareWith','Compare with')}</Text><View style={s.pill}><Text style={s.pillText}>{monthLabel(series.at(-2)?.key)||'—'}</Text><Text style={s.pillChevron}>⌄</Text></View></View>
      </View>
      <View style={s.chart}>
        <View style={s.chartBudgetLine}/>
        {series.map(item=><View key={item.key} style={s.chartColumn}><View style={s.chartTrack}><View style={[s.chartBar,{height:`${Math.max(4,(item.amount/max)*72)}%`,backgroundColor:item.key===currentMonth?'#F26969':'#FFDADA'}]}/></View><Text style={s.chartLabel}>{item.label}</Text></View>)}
      </View>
      <View style={s.between}><Text style={s.meta}>{delta==null?t(lang,'noComparison','No prior-month comparison'):delta===0?t(lang,'sameAsLastMonth','Same as last month'):`${Math.abs(delta)}% ${delta>0?t(lang,'higher','higher'):t(lang,'lower','lower')} ${t(lang,'thanLastMonth','than last month')}`}</Text><Text style={[s.meta,{color:'#F26969'}]}>{t(lang,'budget','Budget')} {m(budget.limit)}</Text></View>
    </FinanceCard>

    <View style={{height:16}}/>
    <FinanceCard title={t(lang,'monthlyBudget','Monthly budget')} action="">
      <View style={s.between}><View><Text style={s.kicker}>{t(lang,'remaining','Remaining')}</Text><Text style={s.cardTitle}>{m(budget.remaining)}</Text></View><Text style={s.percent}>{Math.round(budget.progress*100)}%</Text></View>
      <Progress value={budget.progress} tone={budget.overBy>0?'danger':'primary'}/>
      <View style={s.between}><Text style={s.meta}>{m(budget.spent)} {t(lang,'spent','spent').toLowerCase()}</Text><Text style={s.meta}>{m(budget.limit)} {t(lang,'limit','limit').toLowerCase()}</Text></View>
    </FinanceCard>

    <Section title={t(lang,'paymentRecord','Payment record')} action={transactions.length?t(lang,'seeAll','See all'):null} onPress={()=>setTab('activity')}/>
    {transactions.length?<View style={s.list}>{transactions.slice(0,5).map((item,index)=><View key={item.id}><TransactionRow item={item} settings={settings} money={m} onDelete={remove} onEdit={openEdit} onPress={openDetails} wallets={settings.wallets} customCategories={settings.customCategories} showActions={false}/>{index<Math.min(transactions.length,5)-1?<View style={s.rowDivider}/>:null}</View>)}</View>:<Empty onAdd={()=>openAdd()} language={lang}/>}

    <Section title={t(lang,'wallets','Wallets')} action={t(lang,'addWallet','Add wallet')} onPress={()=>setWalletOpen(true)}/>
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.walletRow}>{wallets.map(wallet=>{const meta=settings.wallets.find(item=>item.id===wallet.id);return <View key={wallet.id} style={s.walletCard}><View style={s.walletIconSurface}><NativeIcon name={walletIconName(meta||wallet)} size={20} color="#0074FC"/></View><Text style={s.walletName}>{wallet.name}</Text><Text selectable style={s.walletBalance}>{m(wallet.balance)}</Text></View>;})}</ScrollView>
    {wallets.length>1?<HapticPressable style={s.secondary} onPress={onTransfer} accessibilityRole="button"><View style={s.buttonContent}><NativeIcon name="transfer" size={18} color="#111827"/><Text style={s.secondaryText}>{t(lang,'transferFunds','Transfer between wallets')}</Text></View></HapticPressable>:null}
  </ScrollView>;
}
