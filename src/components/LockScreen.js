import React, { useEffect, useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, SafeAreaView, StyleSheet, Text, TextInput, View } from 'react-native';
import { COLORS } from '../constants';

export default function LockScreen({onUnlockPin,onUnlockBiometric,biometricEnabled=false,biometricAvailable=false,cooldownUntil=0,failedAttempts=0}) {
  const [pin,setPin]=useState('');
  const [busy,setBusy]=useState(false);
  const [message,setMessage]=useState('');
  const [now,setNow]=useState(Date.now());

  useEffect(()=>{
    if(!cooldownUntil)return;
    const timer=setInterval(()=>setNow(Date.now()),1000);
    return()=>clearInterval(timer);
  },[cooldownUntil]);

  const remaining=Math.max(0,Math.ceil((cooldownUntil-now)/1000));
  const blocked=remaining>0;

  async function unlockPin(){
    if(blocked||busy)return;
    setBusy(true);setMessage('');
    try{
      const ok=await onUnlockPin(pin);
      if(ok)setPin('');
      else {setPin('');setMessage('Incorrect PIN.');}
    }catch(error){setMessage(error?.message||'Kharcha could not verify the PIN.');}
    finally{setBusy(false);}
  }

  async function unlockBiometric(){
    if(blocked||busy)return;
    setBusy(true);setMessage('');
    try{
      const ok=await onUnlockBiometric();
      if(!ok)setMessage('Biometric unlock was not completed. Use your PIN.');
    }catch(error){setMessage(error?.message||'Biometric unlock was not completed.');}
    finally{setBusy(false);}
  }

  return <SafeAreaView style={s.safe}>
    <KeyboardAvoidingView style={s.center} behavior={Platform.OS==='ios'?'padding':undefined}>
      <View style={s.mark}><Text style={s.markText}>K</Text></View>
      <Text style={s.brand}>Kharcha</Text>
      <Text style={s.title}>Locked</Text>
      <Text style={s.copy}>Enter your PIN to view your financial data.</Text>
      <TextInput
        value={pin}
        onChangeText={setPin}
        keyboardType="number-pad"
        secureTextEntry
        maxLength={6}
        placeholder="••••"
        placeholderTextColor={COLORS.muted}
        style={s.input}
        editable={!blocked&&!busy}
        onSubmitEditing={unlockPin}
      />
      {blocked?<Text style={s.warning}>Too many attempts. Try again in {remaining}s.</Text>:message?<Text style={s.warning}>{message}</Text>:failedAttempts>0?<Text style={s.meta}>{failedAttempts} failed attempt{failedAttempts===1?'':'s'}</Text>:null}
      <Pressable style={[s.primary,(blocked||busy)&&s.disabled]} disabled={blocked||busy} onPress={unlockPin}><Text style={s.primaryText}>{busy?'Checking…':'Unlock'}</Text></Pressable>
      {biometricEnabled&&biometricAvailable?<Pressable style={[s.secondary,(blocked||busy)&&s.disabled]} disabled={blocked||busy} onPress={unlockBiometric}><Text style={s.secondaryText}>Use biometrics</Text></Pressable>:null}
      <Text style={s.privacy}>Your Kharcha data stays on this device.</Text>
    </KeyboardAvoidingView>
  </SafeAreaView>;
}

const s=StyleSheet.create({
  safe:{flex:1,backgroundColor:COLORS.bg},center:{flex:1,alignItems:'center',justifyContent:'center',paddingHorizontal:28},
  mark:{width:58,height:58,borderRadius:12,backgroundColor:COLORS.accent,alignItems:'center',justifyContent:'center'},markText:{color:COLORS.onAccent,fontSize:28,fontWeight:'600'},
  brand:{color:COLORS.text,fontSize:18,fontWeight:'600',marginTop:14},title:{color:COLORS.text,fontSize:30,fontWeight:'600',marginTop:26},copy:{color:COLORS.muted,fontSize:13,textAlign:'center',marginTop:6},
  input:{width:'100%',height:48,borderRadius:12,borderWidth:1,borderColor:COLORS.border,backgroundColor:COLORS.surface,color:COLORS.text,textAlign:'center',fontSize:24,letterSpacing:12,marginTop:24},
  primary:{width:'100%',height:48,borderRadius:10,backgroundColor:COLORS.accent,alignItems:'center',justifyContent:'center',marginTop:16},primaryText:{color:COLORS.onAccent,fontWeight:'600'},
  secondary:{width:'100%',height:48,borderRadius:10,borderWidth:1,borderColor:COLORS.border,backgroundColor:COLORS.surface,alignItems:'center',justifyContent:'center',marginTop:10},secondaryText:{color:COLORS.text,fontWeight:'600'},
  warning:{color:COLORS.danger,fontSize:12,fontWeight:'600',marginTop:10},meta:{color:COLORS.muted,fontSize:12,marginTop:10},privacy:{color:COLORS.muted,fontSize:11,marginTop:24},disabled:{opacity:.5},
});
