import React, { useEffect, useState } from 'react';
import { Modal, Pressable, StyleSheet, Switch, Text, View } from 'react-native';
import { COLORS } from '../constants';
import { t } from '../i18n';
const { normalizeReminderSettings } = require('../domain/reminders');

function ToggleRow({label,value,onChange}) {
  return <View style={s.row}><Text style={s.rowText}>{label}</Text><Switch value={value} onValueChange={onChange} trackColor={{false:COLORS.border,true:COLORS.accentSoft}} thumbColor={value?COLORS.accent:'#fff'}/></View>;
}

export default function ReminderSettingsModal({visible,onClose,onSave,settings={},permissionGranted=false}) {
  const lang=settings.language||'en';
  const [draft,setDraft]=useState(()=>normalizeReminderSettings(settings.reminders));
  useEffect(()=>{if(visible)setDraft(normalizeReminderSettings(settings.reminders));},[visible,settings.reminders]);

  return <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
    <Pressable style={s.backdrop} onPress={onClose}/>
    <View style={s.sheet}>
      <Text style={s.title}>{t(lang,'reminders','Reminders')}</Text>
      <Text style={s.muted}>{lang==='ne'?'बिल, उधारो र बचत लक्ष्यको मिति नजिकिँदा उपकरणमै सूचना पाउनुहोस्।':'Get local device reminders when bills, Udhaaro and savings targets are approaching.'}</Text>
      <View style={s.permission}><Text style={s.meta}>{t(lang,'notificationPermission','Notification permission')}</Text><Text style={[s.status,permissionGranted&&s.ok]}>{permissionGranted?t(lang,'allowed','Allowed'):t(lang,'notAllowed','Not allowed')}</Text></View>
      <ToggleRow label={t(lang,'enableReminders','Enable reminders')} value={draft.enabled} onChange={(enabled)=>setDraft({...draft,enabled})}/>
      <ToggleRow label={t(lang,'billReminders','Bills / EMI / loans')} value={draft.bills} onChange={(bills)=>setDraft({...draft,bills})}/>
      <ToggleRow label={t(lang,'udharoReminders','Udhaaro due dates')} value={draft.udharo} onChange={(udharo)=>setDraft({...draft,udharo})}/>
      <ToggleRow label={t(lang,'savingsReminders','Savings target dates')} value={draft.savings} onChange={(savings)=>setDraft({...draft,savings})}/>
      <Text style={s.label}>{t(lang,'remindBefore','Remind before')}</Text>
      <View style={s.chips}>{[0,1,2,3,7].map((days)=><Pressable key={days} onPress={()=>setDraft({...draft,leadDays:days})} style={[s.chip,draft.leadDays===days&&s.chipActive]}><Text style={[s.chipText,draft.leadDays===days&&s.chipTextActive]}>{days===0?t(lang,'dueDayOnly','Due day only'):`${days}d`}</Text></Pressable>)}</View>
      <Text style={s.note}>{t(lang,'localReminderPrivacy','Reminders are scheduled locally on this device. No financial data is sent to a notification server.')}</Text>
      <Pressable style={s.primary} onPress={()=>onSave(draft)}><Text style={s.primaryText}>{t(lang,'save','Save')}</Text></Pressable>
    </View>
  </Modal>;
}
const s=StyleSheet.create({
  backdrop:{...StyleSheet.absoluteFillObject,backgroundColor:'rgba(38,39,48,.42)'},sheet:{position:'absolute',left:0,right:0,bottom:0,backgroundColor:COLORS.surface,borderTopLeftRadius:20,borderTopRightRadius:20,borderWidth:1,borderColor:COLORS.border,padding:20,paddingBottom:28},
  title:{color:COLORS.text,fontSize:22,fontWeight:'600'},muted:{color:COLORS.muted,fontSize:13,lineHeight:19,marginTop:4,marginBottom:12},
  permission:{flexDirection:'row',justifyContent:'space-between',alignItems:'center',paddingVertical:10,borderBottomWidth:1,borderBottomColor:COLORS.border},meta:{color:COLORS.muted,fontSize:12},status:{color:COLORS.danger,fontSize:12,fontWeight:'600'},ok:{color:COLORS.success},
  row:{minHeight:48,flexDirection:'row',alignItems:'center',justifyContent:'space-between',borderBottomWidth:1,borderBottomColor:COLORS.border},rowText:{color:COLORS.text,fontSize:14,fontWeight:'600'},
  label:{color:COLORS.text,fontSize:12,fontWeight:'600',marginTop:16,marginBottom:8},chips:{flexDirection:'row',flexWrap:'wrap',gap:8},chip:{minHeight:38,paddingHorizontal:12,borderRadius:12,borderWidth:1,borderColor:COLORS.border,alignItems:'center',justifyContent:'center'},chipActive:{borderColor:COLORS.accent,backgroundColor:COLORS.accentSoft},chipText:{color:COLORS.muted,fontSize:12,fontWeight:'600'},chipTextActive:{color:COLORS.text},
  note:{color:COLORS.muted,fontSize:11,lineHeight:17,marginTop:14},primary:{height:48,borderRadius:10,marginTop:18,backgroundColor:COLORS.accent,alignItems:'center',justifyContent:'center'},primaryText:{color:COLORS.onAccent,fontSize:15,fontWeight:'600'},
});
