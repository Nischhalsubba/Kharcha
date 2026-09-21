import React, { useEffect, useState } from 'react';
import { Alert, Modal, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { COLORS } from '../constants';
import { t } from '../i18n';

function currentMonthKey() {
  const d=new Date();
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`;
}
function Choice({label,active,onPress}) {
  return <Pressable onPress={onPress} style={[s.choice,active&&s.choiceActive]}><Text style={[s.choiceText,active&&s.choiceTextActive]}>{label}</Text></Pressable>;
}

export default function CsvExportModal({visible,onClose,onExport,busy=false,language='en'}) {
  const [scope,setScope]=useState('month');
  const [startDate,setStartDate]=useState('');
  const [endDate,setEndDate]=useState('');

  useEffect(()=>{if(visible){setScope('month');setStartDate('');setEndDate('');}},[visible]);

  function submit(){
    if(scope==='range'){
      if(!/^\d{4}-\d{2}-\d{2}$/.test(startDate)||!/^\d{4}-\d{2}-\d{2}$/.test(endDate)||startDate>endDate){
        return Alert.alert('Check date range','Use valid AD dates in YYYY-MM-DD format.');
      }
      return onExport({scope,startDate,endDate});
    }
    if(scope==='month') return onExport({scope,monthKey:currentMonthKey()});
    return onExport({scope:'all'});
  }

  return <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
    <Pressable style={s.backdrop} onPress={busy?undefined:onClose}/>
    <View style={s.sheet}>
      <Text style={s.title}>{t(language,'exportTransactions','Export transactions')}</Text>
      <Text style={s.muted}>{t(language,'exportTransactionsHint','Create an Excel-compatible CSV with AD + BS dates and your Kharcha money details.')}</Text>

      <Text style={s.label}>{t(language,'exportRange','Export range')}</Text>
      <View style={s.row}>
        <Choice label={t(language,'thisMonth','This month')} active={scope==='month'} onPress={()=>setScope('month')}/>
        <Choice label={t(language,'all','All')} active={scope==='all'} onPress={()=>setScope('all')}/>
        <Choice label={t(language,'custom','Custom')} active={scope==='range'} onPress={()=>setScope('range')}/>
      </View>

      {scope==='range'?<View style={s.range}>
        <View style={s.field}><Text style={s.label}>{t(language,'fromDate','From')} (AD)</Text><TextInput value={startDate} onChangeText={setStartDate} placeholder="YYYY-MM-DD" placeholderTextColor={COLORS.muted} style={s.input}/></View>
        <View style={s.field}><Text style={s.label}>{t(language,'toDate','To')} (AD)</Text><TextInput value={endDate} onChangeText={setEndDate} placeholder="YYYY-MM-DD" placeholderTextColor={COLORS.muted} style={s.input}/></View>
      </View>:null}

      <View style={s.info}><Text style={s.infoText}>{t(language,'csvExcelNote','Includes wallet, payment method, event, household member, remittance, Udhaaro, bill/EMI and savings links. UTF-8 keeps Nepali text readable in Excel.')}</Text></View>
      <Pressable style={[s.primary,busy&&s.disabled]} disabled={busy} onPress={submit}><Text style={s.primaryText}>{busy?t(language,'working','Working…'):t(language,'exportCsv','Export CSV')}</Text></Pressable>
      <Pressable style={s.close} disabled={busy} onPress={onClose}><Text style={s.closeText}>{t(language,'close','Close')}</Text></Pressable>
    </View>
  </Modal>;
}

const s=StyleSheet.create({
  backdrop:{...StyleSheet.absoluteFillObject,backgroundColor:'rgba(0,0,0,.6)'},sheet:{position:'absolute',left:0,right:0,bottom:0,backgroundColor:COLORS.surface,borderTopLeftRadius:20,borderTopRightRadius:20,borderWidth:1,borderColor:COLORS.border,padding:20,paddingBottom:28},
  title:{color:COLORS.text,fontSize:22,fontWeight:'600'},muted:{color:COLORS.muted,fontSize:13,lineHeight:19,marginTop:4},label:{color:COLORS.text,fontSize:12,fontWeight:'600',marginTop:14,marginBottom:7},
  row:{flexDirection:'row',gap:8},choice:{flex:1,minHeight:44,borderRadius:12,borderWidth:1,borderColor:COLORS.border,backgroundColor:COLORS.surface,alignItems:'center',justifyContent:'center',paddingHorizontal:8},choiceActive:{borderColor:COLORS.accent,backgroundColor:COLORS.accentSoft},choiceText:{color:COLORS.muted,fontSize:11,fontWeight:'600',textAlign:'center'},choiceTextActive:{color:COLORS.text},
  range:{flexDirection:'row',gap:10},field:{flex:1},input:{height:48,borderRadius:10,borderWidth:1,borderColor:COLORS.border,backgroundColor:COLORS.surface2,color:COLORS.text,paddingHorizontal:12},info:{backgroundColor:COLORS.surface2,borderRadius:10,padding:12,marginTop:16},infoText:{color:COLORS.muted,fontSize:11,lineHeight:17},
  primary:{height:48,borderRadius:10,marginTop:18,backgroundColor:COLORS.accent,alignItems:'center',justifyContent:'center'},primaryText:{color:COLORS.onAccent,fontSize:15,fontWeight:'600'},close:{height:44,alignItems:'center',justifyContent:'center',marginTop:6},closeText:{color:COLORS.muted,fontWeight:'600'},disabled:{opacity:.55},
});
