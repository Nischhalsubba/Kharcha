import React, { useEffect, useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { COLORS } from '../constants';

function monthNow(){const d=new Date();return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`;}

export default function DataManagementModal({visible,onClose,onImport,onClearMonth,onDeleteAll,onRestoreSnapshot,busy=false,snapshotInfo}) {
  const [month,setMonth]=useState(monthNow());
  const [confirm,setConfirm]=useState('');
  useEffect(()=>{if(visible){setMonth(monthNow());setConfirm('');}},[visible]);
  const snapshotLabel=snapshotInfo?('Saved '+new Date(snapshotInfo.createdAt).toLocaleString()+' · '+snapshotInfo.transactionCount+' transactions'):'No safety snapshot available.';
  return <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
    <Pressable style={s.backdrop} onPress={busy?undefined:onClose}/>
    <ScrollView style={s.sheet} contentContainerStyle={s.body} keyboardShouldPersistTaps="handled">
      <Text style={s.title}>Data management</Text>
      <Text style={s.muted}>Import Kharcha CSV files and perform destructive actions with an automatic safety snapshot.</Text>

      <View style={s.card}><Text style={s.icon}>↥</Text><View style={s.copy}><Text style={s.cardTitle}>Import Kharcha CSV</Text><Text style={s.meta}>Preview duplicates, invalid rows and warnings before anything is added.</Text></View></View>
      <Pressable style={s.secondary} disabled={busy} onPress={onImport}><Text style={s.secondaryText}>Choose CSV to import</Text></Pressable>

      <View style={s.card}><Text style={s.icon}>◫</Text><View style={s.copy}><Text style={s.cardTitle}>Clear one month</Text><Text style={s.meta}>Deletes that month's transactions, prevents recurring items from regenerating, and reconciles linked Udhaaro.</Text></View></View>
      <TextInput value={month} onChangeText={setMonth} placeholder="YYYY-MM" placeholderTextColor={COLORS.muted} style={s.input}/>
      <Pressable style={s.secondary} disabled={busy} onPress={()=>onClearMonth(month)}><Text style={s.secondaryText}>{'Clear '+month}</Text></Pressable>

      <View style={s.card}><Text style={s.icon}>↶</Text><View style={s.copy}><Text style={s.cardTitle}>Restore last safety snapshot</Text><Text style={s.meta}>{snapshotLabel}</Text></View></View>
      <Pressable style={[s.secondary,!snapshotInfo&&s.disabled]} disabled={busy||!snapshotInfo} onPress={onRestoreSnapshot}><Text style={s.secondaryText}>Restore safety snapshot</Text></Pressable>

      <View style={[s.card,s.dangerCard]}><Text style={s.icon}>!</Text><View style={s.copy}><Text style={s.dangerTitle}>Delete all Kharcha data</Text><Text style={s.meta}>A recovery snapshot is saved first. Type DELETE below to enable this action.</Text></View></View>
      <TextInput value={confirm} onChangeText={setConfirm} autoCapitalize="characters" placeholder="Type DELETE" placeholderTextColor={COLORS.muted} style={s.input}/>
      <Pressable style={[s.dangerButton,confirm!=='DELETE'&&s.disabled]} disabled={busy||confirm!=='DELETE'} onPress={onDeleteAll}><Text style={s.dangerButtonText}>Delete all data</Text></Pressable>

      <Pressable style={s.close} disabled={busy} onPress={onClose}><Text style={s.closeText}>Close</Text></Pressable>
    </ScrollView>
  </Modal>;
}

const s=StyleSheet.create({
  backdrop:{...StyleSheet.absoluteFillObject,backgroundColor:'rgba(38,39,48,.42)'},
  sheet:{position:'absolute',left:0,right:0,bottom:0,maxHeight:'94%',backgroundColor:COLORS.surface,borderTopLeftRadius:20,borderTopRightRadius:20,borderWidth:1,borderColor:COLORS.border},
  body:{padding:20,paddingBottom:30},title:{color:COLORS.text,fontSize:22,fontWeight:'600'},muted:{color:COLORS.muted,fontSize:13,lineHeight:19,marginTop:4},
  card:{flexDirection:'row',gap:12,alignItems:'center',backgroundColor:COLORS.surface2,borderRadius:12,padding:14,marginTop:16},dangerCard:{borderWidth:1,borderColor:'#F3B7B7'},icon:{fontSize:22,color:COLORS.text},copy:{flex:1},cardTitle:{color:COLORS.text,fontSize:14,fontWeight:'600'},dangerTitle:{color:COLORS.danger,fontSize:14,fontWeight:'600'},meta:{color:COLORS.muted,fontSize:12,lineHeight:17,marginTop:3},
  input:{height:48,borderRadius:10,borderWidth:1,borderColor:COLORS.border,backgroundColor:COLORS.surface2,color:COLORS.text,paddingHorizontal:12,marginTop:10},
  secondary:{height:48,borderRadius:10,borderWidth:1,borderColor:COLORS.border,backgroundColor:COLORS.surface,alignItems:'center',justifyContent:'center',marginTop:10},secondaryText:{color:COLORS.text,fontWeight:'600'},
  dangerButton:{height:50,borderRadius:10,backgroundColor:COLORS.danger,alignItems:'center',justifyContent:'center',marginTop:10},dangerButtonText:{color:'#FFFFFF',fontWeight:'600'},
  close:{height:44,alignItems:'center',justifyContent:'center',marginTop:8},closeText:{color:COLORS.muted,fontWeight:'600'},disabled:{opacity:.45},
});
