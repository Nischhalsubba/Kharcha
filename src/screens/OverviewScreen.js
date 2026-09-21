import React from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { t } from '../i18n';
import s from '../appStyles';
import { Empty, Progress, Section, TransactionRow } from '../components/AppPrimitives';

export default function OverviewScreen({ lang, summary, m, wallets, settings, setWalletOpen, onTransfer, budget, transactions, setTab, remove, openEdit, openAdd }) {
  return <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scroll}>
    <View style={s.hero}>
      <Text style={s.meta}>{t(lang,'thisMonthNet','This month net')}</Text>
      <Text style={s.heroValue}>{m(summary.balance)}</Text>
      <View style={s.metrics}>
        <View style={s.metric}>
          <Text style={s.meta}>{t(lang,'income','Income')}</Text>
          <Text style={[s.metricValue,s.income]}>{m(summary.income)}</Text>
        </View>
        <View style={s.divider}/>
        <View style={s.metric}>
          <Text style={s.meta}>{t(lang,'spent','Spent')}</Text>
          <Text style={[s.metricValue,s.danger]}>{m(summary.expense)}</Text>
        </View>
      </View>
    </View>

    <View style={s.card}>
      <View style={s.between}>
        <View>
          <Text style={s.kicker}>{t(lang,'monthlyBudget','MONTHLY BUDGET').toUpperCase()}</Text>
          <Text style={s.cardTitle}>{m(budget.remaining)} {t(lang,'left','left')}</Text>
        </View>
        <Text style={s.percent}>{Math.round(budget.progress*100)}%</Text>
      </View>
      <Progress value={budget.progress}/>
      <View style={s.between}>
        <Text style={s.meta}>{m(budget.spent)} {t(lang,'spent','spent').toLowerCase()}</Text>
        <Text style={s.meta}>{m(budget.limit)} {t(lang,'limit','limit').toLowerCase()}</Text>
      </View>
      {budget.overBy>0?<Text style={[s.danger,{marginTop:8}]}>+{m(budget.overBy)}</Text>:null}
    </View>

    <Section title={t(lang,'wallets','Wallets')} action={t(lang,'addWallet','Add wallet')} onPress={()=>setWalletOpen(true)}/>
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.walletRow}>
      {wallets.map(wallet=>{
        const meta=settings.wallets.find(item=>item.id===wallet.id);
        return <View key={wallet.id} style={s.walletCard}>
          <Text style={s.walletIcon}>{meta?.icon||'👛'}</Text>
          <Text style={s.walletName}>{wallet.name}</Text>
          <Text style={s.walletBalance}>{m(wallet.balance)}</Text>
        </View>;
      })}
    </ScrollView>
    {wallets.length>1?<Pressable style={s.secondary} onPress={onTransfer} accessibilityRole="button" accessibilityLabel={t(lang,'transferFunds','Transfer between wallets')}><Text style={s.secondaryText}>⇄ {t(lang,'transferFunds','Transfer between wallets')}</Text></Pressable>:null}

    <Section title={t(lang,'recentActivity','Recent activity')} action={transactions.length?t(lang,'seeAll','See all'):null} onPress={()=>setTab('activity')}/>
    {transactions.length?
      <View style={s.list}>
        {transactions.slice(0,5).map((item,i)=><View key={item.id}>
          <TransactionRow item={item} settings={settings} money={m} onDelete={remove} onEdit={openEdit} wallets={settings.wallets} customCategories={settings.customCategories}/>
          {i<Math.min(transactions.length,5)-1?<View style={s.rowDivider}/>:null}
        </View>)}
      </View>
      :<Empty onAdd={()=>openAdd()} language={lang}/>}
  </ScrollView>;
}
