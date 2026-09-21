import React, { useEffect, useState } from 'react';
import { Alert, Modal, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { COLORS } from '../constants';
import { t } from '../i18n';
const { normalizeAmount, isValidIsoDate } = require('../domain/finance');
const { inputDateToAd, transactionDateInput } = require('../domain/nepal');

function pad2(value){return String(value).padStart(2,'0');}
function todayIso(){const d=new Date();return `${d.getFullYear()}-${pad2(d.getMonth()+1)}-${pad2(d.getDate())}`;}
function categoryFor(kind){if(kind==='emi')return 'EMI';if(kind==='loan')return 'Loan Repayment';return 'Bills';}

function Choice({label,active,onPress}) {
  return <Pressable onPress={onPress} style={[s.choice,active&&s.choiceActive]}><Text style={[s.choiceText,active&&s.choiceTextActive]}>{label}</Text></Pressable>;
}

export default function ObligationModal({visible,onClose,onSave,onPay,paymentTarget,settings={},wallets=[]}) {
  const lang=settings.language||'en';
  const paying=Boolean(paymentTarget?.obligation);
  const [kind,setKind]=useState('bill');
  const [name,setName]=useState('');
  const [amount,setAmount]=useState('');
  const [frequency,setFrequency]=useState('monthly');
  const [dueDay,setDueDay]=useState('1');
  const [dueDate,setDueDate]=useState('');
  const [paymentDate,setPaymentDate]=useState(todayIso());
  const [walletId,setWalletId]=useState('cash');

  useEffect(()=>{
    if(!visible)return;
    setKind('bill');setName('');setFrequency('monthly');setDueDay('1');setDueDate('');
    setWalletId(wallets[0]?.id||'cash');
    if(paying)setAmount(String(paymentTarget?.status?.remaining||''));
    else setAmount('');
    try{setPaymentDate(transactionDateInput(todayIso(),settings));}catch{setPaymentDate(todayIso());}
  },[visible,paying,paymentTarget,settings,wallets]);

  function convertDate(value){try{return inputDateToAd(value,settings);}catch{return null;}}

  function submit() {
    const value=normalizeAmount(amount);
    if(!value)return Alert.alert('Check amount','Enter an amount greater than zero.');
    if(paying){
      const ad=convertDate(paymentDate);
      if(!ad||!isValidIsoDate(ad))return Alert.alert('Check date','Enter a valid payment date.');
      if(!walletId)return Alert.alert('Choose wallet','Select the wallet used for this payment.');
      return onPay(paymentTarget.obligation.id,value,ad,walletId);
    }
    if(!name.trim())return Alert.alert('Name required','Enter a bill, EMI or loan name.');
    if(frequency==='once'){
      const ad=convertDate(dueDate);
      if(!ad||!isValidIsoDate(ad))return Alert.alert('Check due date','Enter a valid due date.');
      return onSave({
        id:`obligation-${Date.now()}`,kind,name:name.trim(),amount:value,frequency,
        dueDate:ad,category:categoryFor(kind),active:true,createdAt:new Date().toISOString(),
      });
    }
    const day=Math.trunc(Number(dueDay));
    if(!Number.isFinite(day)||day<1||day>31)return Alert.alert('Check due day','Use a day from 1 to 31.');
    onSave({
      id:`obligation-${Date.now()}`,kind,name:name.trim(),amount:value,frequency,
      dueDay:day,startMonth:todayIso().slice(0,7),category:categoryFor(kind),active:true,createdAt:new Date().toISOString(),
    });
  }

  return <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
    <Pressable style={s.backdrop} onPress={onClose}/>
    <View style={s.sheet}>
      <Text style={s.title}>{paying?t(lang,'recordPayment','Record payment'):t(lang,'addObligation','Add payment plan')}</Text>
      <Text style={s.muted}>{paying?paymentTarget?.obligation?.name:(lang==='ne'?'बिल, किस्ता र ऋणको तिर्नुपर्ने रकम सम्झनुहोस्।':'Track bills, EMI and loan dues without calculating lender interest.')}</Text>
      {!paying&&<>
        <Text style={s.label}>{lang==='ne'?'प्रकार':'Type'}</Text>
        <View style={s.row}><Choice label={t(lang,'bill','Bill')} active={kind==='bill'} onPress={()=>setKind('bill')}/><Choice label={t(lang,'emi','EMI')} active={kind==='emi'} onPress={()=>setKind('emi')}/><Choice label={t(lang,'loan','Loan')} active={kind==='loan'} onPress={()=>setKind('loan')}/></View>
        <Text style={s.label}>{lang==='ne'?'नाम':'Name'}</Text><TextInput value={name} onChangeText={setName} placeholder="Internet, Bike EMI…" placeholderTextColor={COLORS.muted} style={s.input}/>
      </>}
      <Text style={s.label}>{paying?t(lang,'paymentAmount','Payment amount'):t(lang,'amount','Amount')}</Text>
      <TextInput value={amount} onChangeText={setAmount} keyboardType="decimal-pad" placeholder="0" placeholderTextColor={COLORS.muted} style={s.input}/>
      {!paying&&<>
        <Text style={s.label}>{lang==='ne'?'दोहोरिने':'Frequency'}</Text>
        <View style={s.row}><Choice label={t(lang,'monthly','Monthly')} active={frequency==='monthly'} onPress={()=>setFrequency('monthly')}/><Choice label={t(lang,'oneTime','One time')} active={frequency==='once'} onPress={()=>setFrequency('once')}/></View>
        {frequency==='monthly'?<><Text style={s.label}>{t(lang,'dueDay','Due day')} (1–31)</Text><TextInput value={dueDay} onChangeText={setDueDay} keyboardType="number-pad" placeholder="10" placeholderTextColor={COLORS.muted} style={s.input}/></>:<><Text style={s.label}>{t(lang,'dueDate','Due date')} {settings.dateSystem==='BS'?'(BS)':'(AD)'}</Text><TextInput value={dueDate} onChangeText={setDueDate} placeholder="YYYY-MM-DD" placeholderTextColor={COLORS.muted} style={s.input}/></>}
      </>}
      {paying&&<>
        <Text style={s.label}>{t(lang,'chooseWallet','Choose wallet')}</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>{wallets.map(wallet=><Pressable key={wallet.id} onPress={()=>setWalletId(wallet.id)} style={[s.wallet,walletId===wallet.id&&s.walletActive]}><Text style={s.walletText}>{wallet.icon||'👛'} {wallet.name}</Text></Pressable>)}</ScrollView>
        <Text style={s.label}>{t(lang,'date','Date')} {settings.dateSystem==='BS'?'(BS)':'(AD)'}</Text><TextInput value={paymentDate} onChangeText={setPaymentDate} placeholder="YYYY-MM-DD" placeholderTextColor={COLORS.muted} style={s.input}/>
      </>}
      <Pressable style={s.primary} onPress={submit}><Text style={s.primaryText}>{paying?t(lang,'recordPayment','Record payment'):t(lang,'save','Save')}</Text></Pressable>
    </View>
  </Modal>;
}

const s=StyleSheet.create({
  backdrop:{...StyleSheet.absoluteFillObject,backgroundColor:'rgba(0,0,0,.58)'},
  sheet:{position:'absolute',left:0,right:0,bottom:0,maxHeight:'94%',backgroundColor:COLORS.surface,borderTopLeftRadius:28,borderTopRightRadius:28,borderWidth:1,borderColor:COLORS.border,padding:20,paddingBottom:28},
  title:{color:COLORS.text,fontSize:22,fontWeight:'900'},muted:{color:COLORS.muted,fontSize:13,lineHeight:19,marginTop:4},
  label:{color:COLORS.text,fontSize:12,fontWeight:'700',marginTop:14,marginBottom:7},input:{height:48,borderRadius:14,borderWidth:1,borderColor:COLORS.border,backgroundColor:COLORS.surface2,color:COLORS.text,paddingHorizontal:12},
  row:{flexDirection:'row',gap:8},choice:{flex:1,minHeight:42,borderRadius:12,borderWidth:1,borderColor:COLORS.border,backgroundColor:COLORS.surface,alignItems:'center',justifyContent:'center',paddingHorizontal:8},choiceActive:{borderColor:COLORS.accent,backgroundColor:COLORS.accentSoft},choiceText:{color:COLORS.muted,fontSize:12,fontWeight:'700'},choiceTextActive:{color:COLORS.text},
  wallet:{height:40,paddingHorizontal:12,borderRadius:12,borderWidth:1,borderColor:COLORS.border,backgroundColor:COLORS.surface,alignItems:'center',justifyContent:'center',marginRight:8},walletActive:{borderColor:COLORS.accent,backgroundColor:COLORS.accentSoft},walletText:{color:COLORS.text,fontSize:12,fontWeight:'700'},
  primary:{height:52,borderRadius:15,marginTop:20,backgroundColor:COLORS.accent,alignItems:'center',justifyContent:'center'},primaryText:{color:COLORS.onAccent,fontSize:15,fontWeight:'900'},
});
