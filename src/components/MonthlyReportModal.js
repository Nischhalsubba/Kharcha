import React, { useEffect, useState } from 'react';
import { Alert, Modal, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { COLORS } from '../constants';
import { t } from '../i18n';

function currentMonthKey(){
  const d=new Date();
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`;
}

export default function MonthlyReportModal({visible,onClose,onGenerate,busy=false,language='en'}) {
  const [monthKey,setMonthKey]=useState(currentMonthKey());
  useEffect(()=>{if(visible)setMonthKey(currentMonthKey());},[visible]);

  function submit(){
    const match=/^(\d{4})-(\d{2})$/.exec(monthKey);
    const month=match?Number(match[2]):0;
    if(!match||month<1||month>12)return Alert.alert('Check month','Use YYYY-MM, for example 2026-09.');
    onGenerate(monthKey);
  }

  return <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
    <Pressable style={s.backdrop} onPress={busy?undefined:onClose}/>
    <View style={s.sheet}>
      <Text style={s.title}>{t(language,'monthlyReport','Monthly financial report')}</Text>
      <Text style={s.muted}>{t(language,'monthlyReportHint','Create a PDF summary of income, expenses, budget, Udhaaro, bills, savings and household spending.')}</Text>
      <Text style={s.label}>{t(language,'month','Month')} (AD)</Text>
      <TextInput value={monthKey} onChangeText={setMonthKey} placeholder="YYYY-MM" placeholderTextColor={COLORS.muted} style={s.input}/>
      <View style={s.info}><Text style={s.infoText}>{t(language,'pdfPrivacyNote','The PDF is generated on this device. Kharcha does not upload it; it only leaves the app if you choose a destination in the share sheet.')}</Text></View>
      <Pressable style={[s.primary,busy&&s.disabled]} disabled={busy} onPress={submit}><Text style={s.primaryText}>{busy?t(language,'working','Working…'):t(language,'generatePdf','Generate PDF')}</Text></Pressable>
      <Pressable style={s.close} disabled={busy} onPress={onClose}><Text style={s.closeText}>{t(language,'close','Close')}</Text></Pressable>
    </View>
  </Modal>;
}

const s=StyleSheet.create({
  backdrop:{...StyleSheet.absoluteFillObject,backgroundColor:'rgba(0,0,0,.6)'},sheet:{position:'absolute',left:0,right:0,bottom:0,backgroundColor:COLORS.surface,borderTopLeftRadius:28,borderTopRightRadius:28,borderWidth:1,borderColor:COLORS.border,padding:20,paddingBottom:28},
  title:{color:COLORS.text,fontSize:22,fontWeight:'900'},muted:{color:COLORS.muted,fontSize:13,lineHeight:19,marginTop:4},label:{color:COLORS.text,fontSize:12,fontWeight:'700',marginTop:16,marginBottom:7},
  input:{height:48,borderRadius:14,borderWidth:1,borderColor:COLORS.border,backgroundColor:COLORS.surface2,color:COLORS.text,paddingHorizontal:12},info:{backgroundColor:COLORS.surface2,borderRadius:14,padding:12,marginTop:16},infoText:{color:COLORS.muted,fontSize:11,lineHeight:17},
  primary:{height:52,borderRadius:15,marginTop:18,backgroundColor:COLORS.accent,alignItems:'center',justifyContent:'center'},primaryText:{color:COLORS.onAccent,fontSize:15,fontWeight:'900'},close:{height:44,alignItems:'center',justifyContent:'center',marginTop:6},closeText:{color:COLORS.muted,fontWeight:'700'},disabled:{opacity:.55},
});
