import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { categoryIcon } from '../constants';
import { categoryLabel, t } from '../i18n';
import s from '../appStyles';
const { transactionDateLabel } = require('../domain/nepal');

export function Progress({ value, tone='primary' }) {
  const background=tone==='danger'?{backgroundColor:'#F26969'}:tone==='success'?{backgroundColor:'#40C79A'}:null;
  return <View style={s.track}><View style={[s.fill,background,{width:`${Math.max(0,Math.min(value,1))*100}%`}]} /></View>;
}

export function Section({ title, action, onPress }) {
  return <View style={s.sectionHead}><Text style={s.sectionTitle}>{title}</Text>{action?<Pressable style={s.sectionAction} onPress={onPress} hitSlop={6} accessibilityRole="button"><Text style={s.action}>{action}</Text></Pressable>:null}</View>;
}

export function Chip({ label, active, onPress }) {
  return <Pressable onPress={onPress} style={[s.filterChip,active&&s.filterChipActive]} accessibilityRole="button" accessibilityState={{selected:active}} hitSlop={4}><Text style={[s.filterChipText,active&&s.filterChipTextActive]}>{label}</Text></Pressable>;
}

export function FigmaReferenceLabel({ children }) {
  return <View style={s.referenceLabel}><View style={s.referenceLabelBlock}><Text style={s.referenceLabelText}>{children}</Text></View><View style={s.referenceLabelLine}/></View>;
}

export function FinanceCard({ title, action='•••', children }) {
  return <View style={s.financeCard}>
    <View style={s.financeCardHeader}><Text style={s.cardHeaderTitle}>{title}</Text>{action?<Text style={s.cardMenu}>{action}</Text>:null}</View>
    <View style={s.cardDivider}/>
    <View style={s.financeCardBody}>{children}</View>
  </View>;
}

export function TransactionRow({ item, settings, money, onDelete, onEdit, onPress, wallets, customCategories, showActions=true }) {
  const transfer=item.type==='transfer';
  const expense=item.type==='expense';
  const linkedMovement=Boolean(item.obligationPayment||item.udharoPayment||item.savingsGoalMovement||transfer);
  const wallet=wallets.find(x=>x.id===(transfer?(item.fromWalletId||item.walletId):item.walletId));
  const toWallet=transfer?wallets.find(x=>x.id===item.toWalletId):null;
  let date={primary:item.date,secondary:''};
  try{date=transactionDateLabel(item.date,settings);}catch{}
  const title=item.note||(transfer?t(settings.language,'transfer','Transfer'):categoryLabel(item.category,settings.language));
  const meta=transfer
    ? `${wallet?.name||'Wallet'} → ${toWallet?.name||'Wallet'} · ${date.primary}${date.secondary?` · ${date.secondary}`:''}`
    : `${date.primary}${date.secondary?` · ${date.secondary}`:''} · ${categoryLabel(item.category,settings.language)}`;
  const pressHandler=onPress?()=>onPress(item):(!linkedMovement&&onEdit?()=>onEdit(item):undefined);
  const iconStyle=transfer?s.iconTransfer:expense?s.iconExpense:s.iconIncome;
  return <View style={s.row}>
    <View style={[s.icon,iconStyle]}><Text style={s.iconText}>{transfer?'⇄':categoryIcon(item.type,item.category,customCategories)}</Text></View>
    <Pressable style={s.rowCopy} onPress={pressHandler} disabled={!pressHandler} accessibilityRole={pressHandler?'button':undefined} accessibilityLabel={pressHandler?`View ${title}`:undefined}>
      <Text style={s.rowTitle} numberOfLines={1}>{title}</Text><Text style={s.meta} numberOfLines={1}>{meta}</Text>
    </Pressable>
    <View style={s.rowRight}><Text style={[s.amount,transfer?null:expense?s.danger:s.income]}>{transfer?'':expense?'−':'+'}{money(item.amount)}</Text>
      {showActions?<View style={s.rowActions}>{!linkedMovement&&onEdit?<Pressable onPress={()=>onEdit(item)} hitSlop={8}><Text style={s.edit}>{t(settings.language,'edit','Edit')}</Text></Pressable>:null}{onDelete?<Pressable onPress={()=>onDelete(item.id)} hitSlop={8}><Text style={s.delete}>{t(settings.language,'delete','Delete')}</Text></Pressable>:null}</View>:null}
    </View>
  </View>;
}

export function Empty({ onAdd, filtered=false, language='en' }) {
  return <View style={s.empty}><Text style={s.emptyEmoji}>{filtered?'⌕':'＋'}</Text><Text style={s.emptyTitle}>{filtered?t(language,'noMatching','No matching transactions'):t(language,'nothingTracked','Nothing tracked yet')}</Text><Text style={s.emptyCopy}>{filtered?(language==='ne'?'फिल्टर हटाउनुहोस् वा खोज बदल्नुहोस्।':'Try clearing a filter or changing your search.'):(language==='ne'?'पहिलो खर्च वा आम्दानी थप्नुहोस्।':'Add your first expense or income and Kharcha will start building the picture for you.')}</Text>{!filtered?<Pressable style={s.secondary} onPress={onAdd}><Text style={s.secondaryText}>{t(language,'addFirst','Add first transaction')}</Text></Pressable>:null}</View>;
}

export function Tab({ active, icon, label, onPress }) {
  return <Pressable style={[s.tab,active&&s.tabActive]} onPress={onPress} accessibilityRole="tab" accessibilityState={{selected:active}}><Text style={[s.tabIcon,active&&s.active]}>{icon}</Text><Text style={[s.tabLabel,active&&s.active]}>{label}</Text></Pressable>;
}
