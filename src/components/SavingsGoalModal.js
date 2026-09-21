import React, { useEffect, useState } from 'react';
import { Alert, Modal, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { COLORS } from '../constants';
import { t } from '../i18n';
const { normalizeAmount, isValidIsoDate } = require('../domain/finance');
const { inputDateToAd, transactionDateInput } = require('../domain/nepal');

function pad2(value){return String(value).padStart(2,'0');}
function todayIso(){const d=new Date();return `${d.getFullYear()}-${pad2(d.getMonth()+1)}-${pad2(d.getDate())}`;}

export default function SavingsGoalModal({visible,onClose,onSaveGoal,onMove,movementTarget,settings={},wallets=[]}) {
  const lang=settings.language||'en';
  const moving=Boolean(movementTarget?.goal);
  const [name,setName]=useState('');
  const [amount,setAmount]=useState('');
  const [targetDate,setTargetDate]=useState('');
  const [date,setDate]=useState(todayIso());
  const [walletId,setWalletId]=useState('cash');

  useEffect(()=>{
    if(!visible)return;
    setName('');setTargetDate('');setWalletId(wallets[0]?.id||'cash');
    if(moving){
      const available=movementTarget.direction==='withdrawal'?movementTarget.status.saved:movementTarget.status.remaining;
      setAmount(String(available||''));
    } else setAmount('');
    try{setDate(transactionDateInput(todayIso(),settings));}catch{setDate(todayIso());}
  },[visible,moving,movementTarget,settings,wallets]);

  function convert(value){try{return inputDateToAd(value,settings);}catch{return null;}}

  function submit(){
    const value=normalizeAmount(amount);
    if(!value)return Alert.alert('Check amount','Enter an amount greater than zero.');
    if(moving){
      const ad=convert(date);
      if(!ad||!isValidIsoDate(ad))return Alert.alert('Check date','Enter a valid date.');
      if(!walletId)return Alert.alert('Choose wallet','Select the wallet used for this movement.');
      return onMove(movementTarget.goal.id,value,ad,walletId,movementTarget.direction);
    }
    if(!name.trim())return Alert.alert('Name required','Enter a savings goal name.');
    let canonicalTarget='';
    if(targetDate){
      canonicalTarget=convert(targetDate);
      if(!canonicalTarget||!isValidIsoDate(canonicalTarget))return Alert.alert('Check target date','Enter a valid target date or leave it blank.');
    }
    onSaveGoal({id:`goal-${Date.now()}`,name:name.trim(),targetAmount:value,targetDate:canonicalTarget,active:true,createdAt:new Date().toISOString()});
  }

  const direction=movementTarget?.direction;
  return <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
    <Pressable style={s.backdrop} onPress={onClose}/><View style={s.sheet}>
      <Text style={s.title}>{moving?(direction==='withdrawal'?t(lang,'withdraw','Withdraw'):t(lang,'deposit','Add savings')):t(lang,'addGoal','Add savings goal')}</Text>
      <Text style={s.muted}>{moving?movementTarget?.goal?.name:(lang==='ne'?'आपतकालीन कोष, यात्रा वा ठूलो खरिदका लागि लक्ष्य बनाउनुहोस्।':'Create a target for an emergency fund, travel, or a larger purchase.')}</Text>
      {!moving&&<><Text style={s.label}>{lang==='ne'?'लक्ष्य नाम':'Goal name'}</Text><TextInput value={name} onChangeText={setName} placeholder="Emergency fund" placeholderTextColor={COLORS.muted} style={s.input}/></>}
      <Text style={s.label}>{moving?t(lang,'amount','Amount'):t(lang,'targetAmount','Target amount')}</Text><TextInput value={amount} onChangeText={setAmount} keyboardType="decimal-pad" placeholder="0" placeholderTextColor={COLORS.muted} style={s.input}/>
      {!moving?<><Text style={s.label}>{t(lang,'targetDate','Target date')} {settings.dateSystem==='BS'?'(BS)':'(AD)'}</Text><TextInput value={targetDate} onChangeText={setTargetDate} placeholder="Optional" placeholderTextColor={COLORS.muted} style={s.input}/></>:<>
        <Text style={s.label}>{t(lang,'chooseWallet','Choose wallet')}</Text><ScrollView horizontal showsHorizontalScrollIndicator={false}>{wallets.map(wallet=><Pressable key={wallet.id} onPress={()=>setWalletId(wallet.id)} style={[s.wallet,walletId===wallet.id&&s.walletActive]}><Text style={s.walletText}>{wallet.icon||'👛'} {wallet.name}</Text></Pressable>)}</ScrollView>
        <Text style={s.label}>{t(lang,'date','Date')} {settings.dateSystem==='BS'?'(BS)':'(AD)'}</Text><TextInput value={date} onChangeText={setDate} placeholder="YYYY-MM-DD" placeholderTextColor={COLORS.muted} style={s.input}/>
      </>}
      <Pressable style={s.primary} onPress={submit}><Text style={s.primaryText}>{moving?(direction==='withdrawal'?t(lang,'withdraw','Withdraw'):t(lang,'deposit','Add savings')):t(lang,'save','Save')}</Text></Pressable>
    </View>
  </Modal>;
}

const s=StyleSheet.create({
  backdrop:{...StyleSheet.absoluteFillObject,backgroundColor:'rgba(0,0,0,.58)'},sheet:{position:'absolute',left:0,right:0,bottom:0,backgroundColor:'#10161E',borderTopLeftRadius:28,borderTopRightRadius:28,borderWidth:1,borderColor:COLORS.border,padding:20,paddingBottom:28},
  title:{color:COLORS.text,fontSize:22,fontWeight:'900'},muted:{color:COLORS.muted,fontSize:13,lineHeight:19,marginTop:4},label:{color:COLORS.text,fontSize:12,fontWeight:'700',marginTop:14,marginBottom:7},
  input:{height:48,borderRadius:14,borderWidth:1,borderColor:COLORS.border,backgroundColor:COLORS.surface2,color:COLORS.text,paddingHorizontal:12},
  wallet:{height:40,paddingHorizontal:12,borderRadius:12,borderWidth:1,borderColor:COLORS.border,backgroundColor:COLORS.surface,alignItems:'center',justifyContent:'center',marginRight:8},walletActive:{borderColor:COLORS.accent,backgroundColor:COLORS.accentSoft},walletText:{color:COLORS.text,fontSize:12,fontWeight:'700'},
  primary:{height:52,borderRadius:15,marginTop:20,backgroundColor:COLORS.accent,alignItems:'center',justifyContent:'center'},primaryText:{color:'#07130F',fontSize:15,fontWeight:'900'},
});
