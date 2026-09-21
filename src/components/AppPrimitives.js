import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { categoryLabel, t } from '../i18n';
import s from '../appStyles';
import HapticPressable from './HapticPressable';
import NativeIcon, { categoryIconName } from './NativeIcon';
const { transactionDateLabel } = require('../domain/nepal');

export function Progress({ value, tone='primary' }) {
  const background=tone==='danger'?{backgroundColor:'#F26969'}:tone==='success'?{backgroundColor:'#40C79A'}:null;
  return <View style={s.track}><View style={[s.fill,background,{width:`${Math.max(0,Math.min(value,1))*100}%`}]} /></View>;
}

export function Section({ title, action, onPress }) {
  return <View style={s.sectionHead}><Text style={s.sectionTitle}>{title}</Text>{action?<HapticPressable style={s.sectionAction} onPress={onPress} hitSlop={6} accessibilityRole="button"><Text style={s.action}>{action}</Text></HapticPressable>:null}</View>;
}

export function Chip({ label, active, onPress }) {
  return <HapticPressable onPress={onPress} style={[s.filterChip,active&&s.filterChipActive]} accessibilityRole="button" accessibilityState={{selected:active}} hitSlop={4}><Text style={[s.filterChipText,active&&s.filterChipTextActive]}>{label}</Text></HapticPressable>;
}

export function FigmaReferenceLabel({ children }) {
  return <View style={s.referenceLabel}><View style={s.referenceLabelBlock}><Text style={s.referenceLabelText}>{children}</Text></View><View style={s.referenceLabelLine}/></View>;
}

export function FinanceCard({ title, action=null, children }) {
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
  const iconColor=transfer?'#0074FC':expense?'#E45757':'#239B78';
  return <View style={s.row}>
    <View style={[s.icon,iconStyle]}><NativeIcon name={transfer?'transfer':categoryIconName(item.category,item.type)} size={18} color={iconColor}/></View>
    <HapticPressable haptic={null} style={s.rowCopy} onPress={pressHandler} disabled={!pressHandler} accessibilityRole={pressHandler?'button':undefined} accessibilityLabel={pressHandler?`View ${title}`:undefined}>
      <Text style={s.rowTitle} numberOfLines={1}>{title}</Text><Text style={s.meta} numberOfLines={1}>{meta}</Text>
    </HapticPressable>
    <View style={s.rowRight}><Text selectable style={[s.amount,transfer?null:expense?s.danger:s.income]}>{transfer?'':expense?'−':'+'}{money(item.amount)}</Text>
      {showActions?<View style={s.rowActions}>{!linkedMovement&&onEdit?<Pressable onPress={()=>onEdit(item)} hitSlop={8}><Text style={s.edit}>{t(settings.language,'edit','Edit')}</Text></Pressable>:null}{onDelete?<Pressable onPress={()=>onDelete(item.id)} hitSlop={8}><Text style={s.delete}>{t(settings.language,'delete','Delete')}</Text></Pressable>:null}</View>:null}
    </View>
  </View>;
}

export function Empty({ onAdd, filtered=false, language='en' }) {
  return <View style={s.empty}><View style={s.emptyIcon}><NativeIcon name={filtered?'search':'plus'} size={24} color={COLORS_FOR_EMPTY}/></View><Text style={s.emptyTitle}>{filtered?t(language,'noMatching','No matching transactions'):t(language,'nothingTracked','Nothing tracked yet')}</Text><Text style={s.emptyCopy}>{filtered?(language==='ne'?'फिल्टर हटाउनुहोस् वा खोज बदल्नुहोस्।':'Try clearing a filter or changing your search.'):(language==='ne'?'पहिलो खर्च वा आम्दानी थप्नुहोस्।':'Add your first expense or income and Kharcha will start building the picture for you.')}</Text>{!filtered?<HapticPressable haptic="impact" style={s.secondary} onPress={onAdd}><Text style={s.secondaryText}>{t(language,'addFirst','Add first transaction')}</Text></HapticPressable>:null}</View>;
}

const COLORS_FOR_EMPTY='#5A5D72';
