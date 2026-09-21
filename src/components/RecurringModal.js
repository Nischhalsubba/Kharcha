import React, { useEffect, useMemo, useState } from 'react';
import { Alert, Modal, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { COLORS, categoryPairs } from '../constants';
import { categoryLabel, t } from '../i18n';
const { isValidIsoDate, normalizeAmount } = require('../domain/finance');
const { inputDateToAd, transactionDateInput } = require('../domain/nepal');
function pad2(v){return String(v).padStart(2,'0');}
function todayIso(){const d=new Date();return `${d.getFullYear()}-${pad2(d.getMonth()+1)}-${pad2(d.getDate())}`;}

export default function RecurringModal({visible,onClose,onSave,wallets=[],customCategories,settings={}}){
  const lang=settings.language||'en';
  const [type,setType]=useState('expense'),[amount,setAmount]=useState(''),[category,setCategory]=useState('Food'),[walletId,setWalletId]=useState('cash'),[frequency,setFrequency]=useState('monthly'),[startDate,setStartDate]=useState(todayIso()),[note,setNote]=useState('');
  useEffect(()=>{if(visible){setType('expense');setAmount('');setCategory('Food');setWalletId(wallets[0]?.id||'cash');setFrequency('monthly');try{setStartDate(transactionDateInput(todayIso(),settings));}catch{setStartDate(todayIso());}setNote('');}},[visible,wallets,settings]);
  const categories=useMemo(()=>categoryPairs(type,customCategories),[type,customCategories]);
  function switchType(next){setType(next);setCategory(next==='expense'?'Food':'Salary');}
  function submit(){const value=normalizeAmount(amount);if(!value)return Alert.alert('Check amount','Enter a number greater than zero.');let ad;try{ad=inputDateToAd(startDate,settings);}catch{ad=null;}if(!ad||!isValidIsoDate(ad))return Alert.alert('Check start date',settings.dateSystem==='BS'?'Enter a valid BS date.':'Use YYYY-MM-DD.');onSave({id:`recurring-${Date.now()}`,type,amount:value,category,note:note.trim(),walletId,frequency,startDate:ad,active:true});}
  return <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}><Pressable style={s.backdrop} onPress={onClose}/><View style={s.sheet}><Text style={s.title}>{t(lang,'recurring','Recurring transaction')}</Text><Text style={s.muted}>{lang==='ne'?'भाडा, तलब र बिल जस्ता नियमित कारोबार स्वचालित गर्नुहोस्।':'Kharcha will add due entries automatically when the app opens.'}</Text><View style={s.segmented}>{['expense','income'].map(key=><Pressable key={key} onPress={()=>switchType(key)} style={[s.segment,type===key&&s.segmentActive]}><Text style={[s.segmentText,type===key&&s.segmentTextActive]}>{key==='expense'?t(lang,'expense','Expense'):t(lang,'income','Income')}</Text></Pressable>)}</View><Text style={s.label}>{t(lang,'amount','Amount')}</Text><TextInput value={amount} onChangeText={setAmount} keyboardType="decimal-pad" placeholder="0" placeholderTextColor={COLORS.muted} style={s.input}/><Text style={s.label}>{t(lang,'category','Category')}</Text><ScrollView horizontal showsHorizontalScrollIndicator={false}>{categories.map(([name,emoji])=><Pressable key={name} onPress={()=>setCategory(name)} style={[s.chip,category===name&&s.selected]}><Text>{emoji}</Text><Text style={s.chipText}>{categoryLabel(name,lang)}</Text></Pressable>)}</ScrollView><Text style={s.label}>{t(lang,'wallet','Wallet')}</Text><ScrollView horizontal showsHorizontalScrollIndicator={false}>{wallets.map(wallet=><Pressable key={wallet.id} onPress={()=>setWalletId(wallet.id)} style={[s.chip,walletId===wallet.id&&s.selected]}><Text>{wallet.icon||'👛'}</Text><Text style={s.chipText}>{wallet.name}</Text></Pressable>)}</ScrollView><Text style={s.label}>{lang==='ne'?'दोहोरिने':'Repeat'}</Text><View style={s.segmentedSmall}>{['weekly','monthly'].map(key=><Pressable key={key} onPress={()=>setFrequency(key)} style={[s.segment,frequency===key&&s.segmentActive]}><Text style={[s.segmentText,frequency===key&&s.segmentTextActive]}>{key==='weekly'?(lang==='ne'?'साप्ताहिक':'Weekly'):(lang==='ne'?'मासिक':'Monthly')}</Text></Pressable>)}</View><View style={s.two}><View style={s.flex}><Text style={s.label}>{lang==='ne'?'सुरु मिति':'Start date'} {settings.dateSystem==='BS'?'(BS)':'(AD)'}</Text><TextInput value={startDate} onChangeText={setStartDate} placeholder="YYYY-MM-DD" placeholderTextColor={COLORS.muted} style={s.input}/></View><View style={s.flex}><Text style={s.label}>{t(lang,'note','Note')}</Text><TextInput value={note} onChangeText={setNote} placeholder={lang==='ne'?'भाडा, तलब…':'Rent, salary…'} placeholderTextColor={COLORS.muted} style={s.input}/></View></View><Pressable style={s.primary} onPress={submit}><Text style={s.primaryText}>{t(lang,'save','Save')}</Text></Pressable></View></Modal>;
}
const s=StyleSheet.create({
  backdrop:{...StyleSheet.absoluteFillObject,backgroundColor:'rgba(38,39,48,.42)'},
  sheet:{position:'absolute',left:0,right:0,bottom:0,maxHeight:'94%',backgroundColor:COLORS.bg,borderTopLeftRadius:20,borderTopRightRadius:20,padding:20,paddingBottom:28},
  title:{color:COLORS.text,fontSize:20,lineHeight:30,fontWeight:'600',letterSpacing:-0.4},
  muted:{color:COLORS.muted,fontSize:12,lineHeight:16,marginTop:4},
  segmented:{flexDirection:'row',backgroundColor:COLORS.surface2,padding:3,borderRadius:99,marginTop:18},
  segmentedSmall:{flexDirection:'row',backgroundColor:COLORS.surface2,padding:3,borderRadius:99},
  segment:{flex:1,height:44,alignItems:'center',justifyContent:'center',borderRadius:99},
  segmentActive:{backgroundColor:COLORS.surface},
  segmentText:{color:COLORS.muted,fontSize:12,fontWeight:'500'},
  segmentTextActive:{color:COLORS.text,fontWeight:'600'},
  label:{color:COLORS.mutedStrong,fontSize:12,lineHeight:16,fontWeight:'600',marginTop:14,marginBottom:7},
  input:{height:48,borderRadius:10,borderWidth:1,borderColor:COLORS.borderStrong,backgroundColor:COLORS.surface,color:COLORS.text,paddingHorizontal:12,fontSize:14},
  chip:{height:44,paddingHorizontal:12,borderRadius:99,borderWidth:1,borderColor:COLORS.border,backgroundColor:COLORS.surface,flexDirection:'row',gap:6,alignItems:'center',marginRight:8},
  selected:{borderColor:COLORS.accent,backgroundColor:COLORS.accentSoft},
  chipText:{color:COLORS.text,fontSize:12,fontWeight:'500'},
  two:{flexDirection:'row',gap:10},flex:{flex:1},
  primary:{height:48,borderRadius:10,marginTop:20,backgroundColor:COLORS.nav,alignItems:'center',justifyContent:'center'},
  primaryText:{color:'#FFFFFF',fontSize:14,lineHeight:21,fontWeight:'600'},
});
