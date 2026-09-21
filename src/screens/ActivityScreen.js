import React, { useMemo } from 'react';
import { ScrollView, Text, TextInput, View } from 'react-native';
import { COLORS } from '../constants';
import { categoryLabel, t } from '../i18n';
import s from '../appStyles';
import { Chip, Empty, TransactionRow } from '../components/AppPrimitives';

function groupByDate(items){
  const groups=[];
  for(const item of items){
    const key=item.date||'Unknown';
    let group=groups.find(entry=>entry.key===key);
    if(!group){group={key,items:[]};groups.push(group);}
    group.items.push(item);
  }
  return groups;
}

export default function ActivityScreen({ lang, query, setQuery, filterType, setFilterType, filterWallet, setFilterWallet, filterCategory, setFilterCategory, filterPeriod, setFilterPeriod, clearFilters, settings, activityCategories, filteredTransactions, transactions, remove, openEdit, openDetails, openAdd, m }) {
  const groups=useMemo(()=>groupByDate(filteredTransactions),[filteredTransactions]);
  const filtersActive=query||filterType!=='all'||filterWallet!=='all'||filterCategory!=='all'||filterPeriod!=='all';
  return <ScrollView contentInsetAdjustmentBehavior="automatic" showsVerticalScrollIndicator={false} contentContainerStyle={[s.scroll,{paddingTop:0}]}>
    <View style={s.screenTitleRow}><Text style={s.screenTitle}>{t(lang,'transactionRecord','Transaction record')}</Text>{filtersActive?<Text onPress={clearFilters} style={s.action}>{t(lang,'clear','Clear')}</Text>:<View style={s.pill}><Text style={s.pillText}>{t(lang,'newest','Newest')}</Text><Text style={s.pillChevron}>⌄</Text></View>}</View>
    <TextInput value={query} onChangeText={setQuery} placeholder={t(lang,'searchPlaceholder','Search note, category, amount…')} placeholderTextColor={COLORS.muted} style={s.search}/>
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.filters}><Chip label={t(lang,'all','All')} active={filterType==='all'} onPress={()=>{setFilterType('all');setFilterCategory('all');}}/><Chip label={t(lang,'expense','Expense')} active={filterType==='expense'} onPress={()=>{setFilterType('expense');setFilterCategory('all');}}/><Chip label={t(lang,'income','Income')} active={filterType==='income'} onPress={()=>{setFilterType('income');setFilterCategory('all');}}/><Chip label={t(lang,'transfer','Transfer')} active={filterType==='transfer'} onPress={()=>{setFilterType('transfer');setFilterCategory('all');}}/><Chip label={t(lang,'thisMonth','This month')} active={filterPeriod==='month'} onPress={()=>setFilterPeriod(filterPeriod==='month'?'all':'month')}/></ScrollView>
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.filters}><Chip label={t(lang,'allWallets','All wallets')} active={filterWallet==='all'} onPress={()=>setFilterWallet('all')}/>{settings.wallets.map(wallet=><Chip key={wallet.id} label={wallet.name} active={filterWallet===wallet.id} onPress={()=>setFilterWallet(wallet.id)}/>)}</ScrollView>
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.filters}><Chip label={t(lang,'allCategories','All categories')} active={filterCategory==='all'} onPress={()=>setFilterCategory('all')}/>{activityCategories.map(name=><Chip key={name} label={categoryLabel(name,lang)} active={filterCategory===name} onPress={()=>setFilterCategory(name)}/>)}</ScrollView>
    {groups.length?<View style={s.groupedList}>{groups.map(group=><View key={group.key} style={s.dateGroup}><Text style={s.dateGroupLabel}>{group.key}</Text>{group.items.map((item,index)=><View key={item.id}><TransactionRow item={item} settings={settings} money={m} onDelete={remove} onEdit={openEdit} onPress={openDetails} wallets={settings.wallets} customCategories={settings.customCategories} showActions={false}/>{index<group.items.length-1?<View style={s.rowDivider}/>:null}</View>)}</View>)}</View>:<Empty onAdd={()=>openAdd()} filtered={transactions.length>0} language={lang}/>}
  </ScrollView>;
}
