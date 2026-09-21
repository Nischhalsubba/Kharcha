import React from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { COLORS } from '../constants';
import NativeIcon, { categoryIconName } from './NativeIcon';
import HapticPressable from './HapticPressable';
import { categoryLabel, t } from '../i18n';
const { transactionDateLabel } = require('../domain/nepal');

function Field({label,value}){return <View style={styles.field}><Text style={styles.label}>{label}</Text><Text style={styles.value}>{value||'—'}</Text></View>;}

export default function TransactionDetailsModal({visible,item,settings={},wallets=[],money,onClose,onEdit,onDelete}) {
  if(!item)return null;
  const lang=settings.language||'en';
  const transfer=item.type==='transfer';
  const expense=item.type==='expense';
  const linked=Boolean(item.obligationPayment||item.udharoPayment||item.savingsGoalMovement||transfer);
  const wallet=wallets.find(entry=>entry.id===(transfer?(item.fromWalletId||item.walletId):item.walletId));
  const toWallet=transfer?wallets.find(entry=>entry.id===item.toWalletId):null;
  let date={primary:item.date,secondary:''};try{date=transactionDateLabel(item.date,settings);}catch{}
  const title=item.note||(transfer?t(lang,'transfer','Transfer'):categoryLabel(item.category,lang));
  return <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
    <Pressable style={styles.backdrop} onPress={onClose}/>
    <View style={styles.sheet}>
      <View style={styles.handle}/>
      <View style={styles.header}><View style={[styles.icon,expense?styles.expense:transfer?styles.transfer:styles.income]}><NativeIcon name={transfer?'transfer':categoryIconName(item.category,item.type)} size={20} color={transfer?COLORS.accent:expense?COLORS.danger:COLORS.income}/></View><View style={{flex:1}}><Text style={styles.title}>{title}</Text><Text style={styles.meta}>{categoryLabel(item.category,lang)}</Text></View></View>
      <Text style={[styles.amount,expense&&styles.amountExpense,!expense&&!transfer&&styles.amountIncome]}>{transfer?'':expense?'−':'+'}{money(item.amount)}</Text>
      <View style={styles.card}>
        <Field label={t(lang,'date','Date')} value={date.secondary?`${date.primary} · ${date.secondary}`:date.primary}/>
        <View style={styles.divider}/>
        <Field label={t(lang,'wallet','Wallet')} value={transfer?`${wallet?.name||'Wallet'} → ${toWallet?.name||'Wallet'}`:(wallet?.name||'Cash')}/>
        <View style={styles.divider}/>
        <Field label={t(lang,'type','Type')} value={transfer?t(lang,'transfer','Transfer'):item.type}/>
        {item.paymentMethod?<><View style={styles.divider}/><Field label={t(lang,'paymentMethod','Payment method')} value={item.paymentMethod}/></>:null}
        {item.note?<><View style={styles.divider}/><Field label={t(lang,'note','Note')} value={item.note}/></>:null}
      </View>
      <View style={styles.actions}>{!linked?<HapticPressable style={styles.primary} onPress={()=>onEdit(item)} accessibilityRole="button"><Text style={styles.primaryText}>{t(lang,'edit','Edit')}</Text></HapticPressable>:null}<HapticPressable haptic={null} style={styles.dangerButton} onPress={()=>onDelete(item.id)} accessibilityRole="button"><Text style={styles.dangerText}>{t(lang,'delete','Delete')}</Text></HapticPressable></View>
    </View>
  </Modal>;
}
const styles=StyleSheet.create({
  backdrop:{...StyleSheet.absoluteFillObject,backgroundColor:'rgba(38,39,48,0.42)'},
  sheet:{position:'absolute',left:0,right:0,bottom:0,backgroundColor:COLORS.bg,borderTopLeftRadius:20,borderTopRightRadius:20,padding:20,paddingBottom:28},
  handle:{width:36,height:4,borderRadius:99,backgroundColor:COLORS.borderStrong,alignSelf:'center',marginBottom:20},
  header:{flexDirection:'row',alignItems:'center',gap:12},icon:{width:40,height:40,borderRadius:20,alignItems:'center',justifyContent:'center'},expense:{backgroundColor:'#FFF0F0'},income:{backgroundColor:'#DDF8EF'},transfer:{backgroundColor:COLORS.accentSoft},iconText:{fontSize:18},
  title:{color:COLORS.text,fontSize:16,lineHeight:24,fontWeight:'600'},meta:{color:COLORS.muted,fontSize:12,lineHeight:16},
  amount:{color:COLORS.text,fontSize:28,lineHeight:38,fontWeight:'600',letterSpacing:-0.7,marginTop:20,marginBottom:16,fontVariant:['tabular-nums']},amountExpense:{color:COLORS.danger},amountIncome:{color:COLORS.income},
  card:{backgroundColor:COLORS.surface,borderRadius:12,paddingHorizontal:16},field:{paddingVertical:12},label:{color:COLORS.muted,fontSize:12,lineHeight:16},value:{color:COLORS.text,fontSize:14,lineHeight:21,fontWeight:'600',marginTop:3},divider:{height:1,backgroundColor:COLORS.border},
  actions:{gap:10,marginTop:18},primary:{height:48,borderRadius:10,backgroundColor:COLORS.nav,alignItems:'center',justifyContent:'center'},primaryText:{color:'#fff',fontSize:14,fontWeight:'600'},dangerButton:{height:48,borderRadius:10,borderWidth:1,borderColor:'#FFDADA',backgroundColor:'#FFF7F7',alignItems:'center',justifyContent:'center'},dangerText:{color:COLORS.danger,fontSize:14,fontWeight:'600'},
});
