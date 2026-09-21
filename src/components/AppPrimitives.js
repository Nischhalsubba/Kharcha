import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { categoryIcon } from '../constants';
import { categoryLabel, t } from '../i18n';
import s from '../appStyles';
const { transactionDateLabel } = require('../domain/nepal');

export function Progress({ value }) {
  return <View style={s.track}><View style={[s.fill,{width:`${Math.max(0,Math.min(value,1))*100}%`}]} /></View>;
}

export function Section({ title, action, onPress }) {
  return <View style={s.sectionHead}><Text style={s.sectionTitle}>{title}</Text>{action?<Pressable onPress={onPress} hitSlop={10}><Text style={s.action}>{action}</Text></Pressable>:null}</View>;
}

export function Chip({ label, active, onPress }) {
  return <Pressable onPress={onPress} style={[s.filterChip,active&&s.filterChipActive]} accessibilityRole="button" accessibilityState={{selected:active}}><Text style={[s.filterChipText,active&&s.filterChipTextActive]}>{label}</Text></Pressable>;
}

export function TransactionRow({ item, settings, money, onDelete, onEdit, wallets, customCategories }) {
  const expense=item.type==='expense';
  const wallet=wallets.find(x=>x.id===item.walletId);
  let date={primary:item.date,secondary:''};
  try{date=transactionDateLabel(item.date,settings);}catch{}
  return <View style={s.row}><View style={s.icon}><Text style={s.iconText}>{categoryIcon(item.type,item.category,customCategories)}</Text></View><Pressable style={s.rowCopy} onPress={()=>onEdit(item)} accessibilityRole="button" accessibilityLabel={`Edit ${item.note||item.category}`}><Text style={s.rowTitle}>{item.note||categoryLabel(item.category,settings.language)}</Text><Text style={s.meta}>{categoryLabel(item.category,settings.language)} · {wallet?.name||'Cash'} · {date.primary}{date.secondary?` · ${date.secondary}`:''}{item.recurringId?' · recurring':''}{item.remittance?' · remittance':''}</Text></Pressable><View style={s.rowRight}><Text style={[s.amount,expense?s.danger:s.income]}>{expense?'−':'+'}{money(item.amount)}</Text><View style={s.rowActions}><Pressable onPress={()=>onEdit(item)} hitSlop={8}><Text style={s.edit}>{t(settings.language,'edit','Edit')}</Text></Pressable><Pressable onPress={()=>onDelete(item.id)} hitSlop={8}><Text style={s.delete}>{t(settings.language,'delete','Delete')}</Text></Pressable></View></View></View>;
}

export function Empty({ onAdd, filtered=false, language='en' }) {
  return <View style={s.empty}><Text style={s.emptyEmoji}>{filtered?'🔎':'🧾'}</Text><Text style={s.emptyTitle}>{filtered?t(language,'noMatching','No matching transactions'):t(language,'nothingTracked','Nothing tracked yet')}</Text><Text style={s.emptyCopy}>{filtered?(language==='ne'?'फिल्टर हटाउनुहोस् वा खोज बदल्नुहोस्।':'Try clearing a filter or changing your search.'):(language==='ne'?'पहिलो खर्च वा आम्दानी थप्नुहोस्।':'Add your first expense or income and Kharcha will start building the picture for you.')}</Text>{!filtered?<Pressable style={s.secondary} onPress={onAdd}><Text style={s.secondaryText}>{t(language,'addFirst','Add first transaction')}</Text></Pressable>:null}</View>;
}

export function Tab({ active, icon, label, onPress }) {
  return <Pressable style={s.tab} onPress={onPress} accessibilityRole="tab" accessibilityState={{selected:active}}><Text style={[s.tabIcon,active&&s.active]}>{icon}</Text><Text style={[s.tabLabel,active&&s.active]}>{label}</Text></Pressable>;
}
