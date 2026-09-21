import React, { useMemo } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { COLORS } from '../constants';
import NativeIcon, { categoryIconName } from './NativeIcon';
import HapticPressable from './HapticPressable';
import { categoryLabel, t } from '../i18n';
const { nextRecurringDate } = require('../domain/phaseOne');
const { transactionDateLabel } = require('../domain/nepal');

function dueLabel(rule,settings,today){
  const next=nextRecurringDate(rule,today);
  if(!next)return rule.active===false?'Paused':'—';
  try{
    const label=transactionDateLabel(next,settings);
    return label.secondary?`${label.primary} · ${label.secondary}`:label.primary;
  }catch{return next;}
}
function RuleRow({rule,settings,money,today,onToggle,onDelete}){
  const lang=settings.language||'en';
  return <View style={s.row}>
    <View style={[s.icon,rule.type==='income'?s.iconIncome:s.iconExpense]}><NativeIcon name={categoryIconName(rule.category,rule.type)} size={18} color={rule.type==='income'?COLORS.income:COLORS.danger}/></View>
    <View style={s.copy}><Text style={s.titleText}>{rule.note||categoryLabel(rule.category,lang)}</Text><Text style={s.meta}>{rule.active===false?t(lang,'paused','Paused'):`${t(lang,'due','Due')} ${dueLabel(rule,settings,today)}`} · {settings.wallets.find(item=>item.id===rule.walletId)?.name||'Cash'}</Text></View>
    <View style={s.right}><Text style={s.amount}>{money(rule.amount)}</Text><View style={s.actions}><Pressable onPress={()=>onToggle(rule.id)} hitSlop={8}><Text style={rule.active===false?s.resume:s.pause}>{rule.active===false?t(lang,'active','Activate'):t(lang,'paused','Pause')}</Text></Pressable><Pressable onPress={()=>onDelete(rule.id)} hitSlop={8}><Text style={s.delete}>{t(lang,'delete','Delete')}</Text></Pressable></View></View>
  </View>;
}
function Group({title,rules,settings,money,today,onToggle,onDelete}){
  if(!rules.length)return null;
  return <View style={s.group}><Text style={s.groupTitle}>{title}</Text>{rules.map((rule,index)=><View key={rule.id}><RuleRow rule={rule} settings={settings} money={money} today={today} onToggle={onToggle} onDelete={onDelete}/>{index<rules.length-1?<View style={s.divider}/>:null}</View>)}</View>;
}

export default function RecurringManagerModal({visible,onClose,onAdd,rules=[],settings={},money,today,onToggle,onDelete}){
  const active=useMemo(()=>rules.filter(rule=>rule.active!==false),[rules]);
  const weekly=active.filter(rule=>rule.frequency==='weekly');
  const monthly=active.filter(rule=>rule.frequency==='monthly');
  const other=active.filter(rule=>!['weekly','monthly'].includes(rule.frequency));
  const inactive=rules.filter(rule=>rule.active===false);
  const lang=settings.language||'en';
  return <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
    <View style={s.page}>
      <View style={s.header}><HapticPressable haptic={null} style={s.headerButton} onPress={onClose} accessibilityRole="button" accessibilityLabel="Back"><NativeIcon name="chevron-left" size={22} color={COLORS.text}/></HapticPressable><Text style={s.pageTitle}>{t(lang,'recurring','Repeated transaction')}</Text><HapticPressable style={s.addButton} onPress={onAdd} accessibilityRole="button"><Text style={s.addText}>{t(lang,'add','Add')}</Text></HapticPressable></View>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scroll}>
        <Group title={lang==='ne'?'साप्ताहिक':'Weekly'} rules={weekly} settings={settings} money={money} today={today} onToggle={onToggle} onDelete={onDelete}/>
        <Group title={lang==='ne'?'मासिक':'Monthly'} rules={monthly} settings={settings} money={money} today={today} onToggle={onToggle} onDelete={onDelete}/>
        <Group title={lang==='ne'?'अन्य':'Other'} rules={other} settings={settings} money={money} today={today} onToggle={onToggle} onDelete={onDelete}/>
        <Group title={lang==='ne'?'निष्क्रिय':'Inactive'} rules={inactive} settings={settings} money={money} today={today} onToggle={onToggle} onDelete={onDelete}/>
        {!rules.length?<View style={s.empty}><Text style={s.emptyTitle}>{t(lang,'noRecurring','No recurring transactions yet.')}</Text><Text style={s.meta}>Create rent, salary, subscription or bill rules and Kharcha will materialize them locally.</Text><HapticPressable haptic="impact" style={s.primary} onPress={onAdd}><Text style={s.primaryText}>{t(lang,'add','Add recurring transaction')}</Text></HapticPressable></View>:null}
      </ScrollView>
    </View>
  </Modal>;
}
const s=StyleSheet.create({
  page:{flex:1,backgroundColor:COLORS.bg},
  header:{minHeight:64,paddingHorizontal:20,flexDirection:'row',alignItems:'center',justifyContent:'space-between'},
  headerButton:{width:44,height:44,alignItems:'center',justifyContent:'center'},headerIcon:{color:COLORS.text,fontSize:28,fontWeight:'500'},
  pageTitle:{color:COLORS.text,fontSize:20,lineHeight:30,fontWeight:'600',letterSpacing:-0.4},
  addButton:{minWidth:44,minHeight:44,alignItems:'flex-end',justifyContent:'center'},addText:{color:COLORS.accent,fontSize:14,fontWeight:'600'},
  scroll:{paddingHorizontal:20,paddingBottom:40,gap:20},
  group:{backgroundColor:COLORS.surface,borderRadius:12,paddingTop:12,overflow:'hidden',borderWidth:1,borderColor:COLORS.border},
  groupTitle:{color:COLORS.muted,fontSize:12,lineHeight:16,paddingHorizontal:20,paddingBottom:8},
  row:{minHeight:68,paddingHorizontal:16,paddingVertical:10,flexDirection:'row',alignItems:'center'},
  icon:{width:32,height:32,borderRadius:16,alignItems:'center',justifyContent:'center',marginRight:12,borderWidth:1,borderColor:'rgba(255,255,255,0.8)'},
  iconExpense:{backgroundColor:'#FFF0F0'},iconIncome:{backgroundColor:'#DDF8EF'},iconText:{fontSize:16},
  copy:{flex:1},titleText:{color:COLORS.text,fontSize:14,lineHeight:21,fontWeight:'600',letterSpacing:-0.28},meta:{color:COLORS.muted,fontSize:12,lineHeight:16,marginTop:2},
  right:{alignItems:'flex-end',marginLeft:10},amount:{color:COLORS.mutedStrong,fontSize:14,lineHeight:21,fontWeight:'600',fontVariant:['tabular-nums']},actions:{flexDirection:'row',gap:10,marginTop:4},
  pause:{color:COLORS.muted,fontSize:10,fontWeight:'600'},resume:{color:COLORS.accent,fontSize:10,fontWeight:'600'},delete:{color:COLORS.danger,fontSize:10,fontWeight:'600'},
  divider:{height:1,backgroundColor:COLORS.border,marginLeft:60},
  empty:{backgroundColor:COLORS.surface,borderRadius:12,padding:20,borderWidth:1,borderColor:COLORS.border},emptyTitle:{color:COLORS.text,fontSize:16,lineHeight:24,fontWeight:'600'},
  primary:{minHeight:48,borderRadius:10,backgroundColor:COLORS.nav,alignItems:'center',justifyContent:'center',marginTop:18},primaryText:{color:'#fff',fontSize:14,fontWeight:'600'},
});
