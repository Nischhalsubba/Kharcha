import React, { useEffect, useMemo, useState } from 'react';
import { Alert, Modal, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { COLORS } from '../constants';
import NativeIcon, { walletIconName } from './NativeIcon';
import HapticPressable from './HapticPressable';
import { t } from '../i18n';
const { normalizeAmount, isValidIsoDate } = require('../domain/finance');
const { inputDateToAd, transactionDateInput } = require('../domain/nepal');

function pad2(value){return String(value).padStart(2,'0');}
function todayIso(){const d=new Date();return `${d.getFullYear()}-${pad2(d.getMonth()+1)}-${pad2(d.getDate())}`;}

export default function TransferModal({visible,onClose,onSave,wallets=[],settings={}}) {
  const lang=settings.language||'en';
  const available=useMemo(()=>wallets.filter(Boolean),[wallets]);
  const [amount,setAmount]=useState('');
  const [fromWalletId,setFromWalletId]=useState('');
  const [toWalletId,setToWalletId]=useState('');
  const [note,setNote]=useState('');
  const [date,setDate]=useState(todayIso());

  useEffect(()=>{
    if(!visible)return;
    setAmount('');
    setNote('');
    setFromWalletId(available[0]?.id||'');
    setToWalletId(available[1]?.id||'');
    try{setDate(transactionDateInput(todayIso(),settings));}catch{setDate(todayIso());}
  },[visible,available,settings]);

  function submit(){
    const value=normalizeAmount(amount);
    if(!value)return Alert.alert('Check amount','Enter an amount greater than zero.');
    if(!fromWalletId||!toWalletId)return Alert.alert('Choose wallets','Select both source and destination wallets.');
    if(fromWalletId===toWalletId)return Alert.alert('Choose different wallets','Money must move to a different wallet.');
    let ad;try{ad=inputDateToAd(date,settings);}catch{ad=null;}
    if(!ad||!isValidIsoDate(ad))return Alert.alert('Check date',settings.dateSystem==='BS'?'Enter a valid BS date.':'Use YYYY-MM-DD.');
    onSave({
      id:`transfer-${Date.now()}`,
      type:'transfer',
      amount:value,
      category:'Transfer',
      note:note.trim()||'Wallet transfer',
      date:ad,
      walletId:fromWalletId,
      fromWalletId,
      toWalletId,
      paymentMethod:'transfer',
      createdAt:new Date().toISOString(),
    });
  }

  return <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
    <Pressable style={s.backdrop} onPress={onClose}/>
    <View style={s.sheet}>
      <Text style={s.title}>{t(lang,'transferFunds','Transfer between wallets')}</Text>
      <Text style={s.muted}>{lang==='ne'?'यो आम्दानी वा खर्च होइन—एउटा वालेटबाट अर्को वालेटमा रकम सारिन्छ।':'This moves existing money between wallets without counting it as income or spending.'}</Text>
      <Text style={s.label}>{t(lang,'fromWallet','From wallet')}</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>{available.map(wallet=><Pressable key={wallet.id} onPress={()=>{setFromWalletId(wallet.id);if(toWalletId===wallet.id)setToWalletId(available.find(item=>item.id!==wallet.id)?.id||'');}} style={[s.wallet,fromWalletId===wallet.id&&s.walletActive]}><View style={s.walletContent}><NativeIcon name={walletIconName(wallet)} size={17} color={COLORS.mutedStrong}/><Text style={s.walletText}>{wallet.name}</Text></View></Pressable>)}</ScrollView>
      <Text style={s.label}>{t(lang,'toWallet','To wallet')}</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>{available.filter(wallet=>wallet.id!==fromWalletId).map(wallet=><Pressable key={wallet.id} onPress={()=>setToWalletId(wallet.id)} style={[s.wallet,toWalletId===wallet.id&&s.walletActive]}><View style={s.walletContent}><NativeIcon name={walletIconName(wallet)} size={17} color={COLORS.mutedStrong}/><Text style={s.walletText}>{wallet.name}</Text></View></Pressable>)}</ScrollView>
      <Text style={s.label}>{t(lang,'amount','Amount')}</Text>
      <TextInput value={amount} onChangeText={setAmount} keyboardType="decimal-pad" placeholder="0" placeholderTextColor={COLORS.muted} style={s.input}/>
      <View style={s.two}><View style={s.flex}><Text style={s.label}>{t(lang,'date','Date')} {settings.dateSystem==='BS'?'(BS)':'(AD)'}</Text><TextInput value={date} onChangeText={setDate} placeholder="YYYY-MM-DD" placeholderTextColor={COLORS.muted} style={s.input}/></View><View style={s.flex}><Text style={s.label}>{t(lang,'note','Note')}</Text><TextInput value={note} onChangeText={setNote} placeholder={lang==='ne'?'जस्तै: बैंकमा जम्मा':'e.g. Cash to bank'} placeholderTextColor={COLORS.muted} style={s.input}/></View></View>
      <Pressable style={s.primary} onPress={submit}><Text style={s.primaryText}>{t(lang,'transfer','Transfer')}</Text></Pressable>
    </View>
  </Modal>;
}

const s=StyleSheet.create({
  backdrop:{...StyleSheet.absoluteFillObject,backgroundColor:'rgba(38,39,48,.42)'},
  sheet:{position:'absolute',left:0,right:0,bottom:0,backgroundColor:COLORS.surface,borderTopLeftRadius:20,borderTopRightRadius:20,borderWidth:1,borderColor:COLORS.border,padding:20,paddingBottom:28},
  title:{color:COLORS.text,fontSize:22,fontWeight:'600'},muted:{color:COLORS.muted,fontSize:13,lineHeight:19,marginTop:4},
  label:{color:COLORS.text,fontSize:12,fontWeight:'600',marginTop:14,marginBottom:7},
  wallet:{height:44,paddingHorizontal:12,borderRadius:10,borderWidth:1,borderColor:COLORS.border,backgroundColor:COLORS.surface,alignItems:'center',justifyContent:'center',marginRight:8},
  walletActive:{borderColor:COLORS.accent,backgroundColor:COLORS.accentSoft},walletContent:{flexDirection:'row',alignItems:'center',gap:7},walletText:{color:COLORS.text,fontSize:12,fontWeight:'600'},
  input:{height:48,borderRadius:10,borderWidth:1,borderColor:COLORS.border,backgroundColor:COLORS.surface2,color:COLORS.text,paddingHorizontal:12},
  two:{flexDirection:'row',gap:10},flex:{flex:1},
  primary:{height:48,borderRadius:10,marginTop:20,backgroundColor:COLORS.accent,alignItems:'center',justifyContent:'center'},primaryText:{color:COLORS.onAccent,fontSize:15,fontWeight:'600'},
});
