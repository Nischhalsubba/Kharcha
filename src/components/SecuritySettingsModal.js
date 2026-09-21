import React, { useEffect, useState } from 'react';
import { Alert, Modal, Pressable, ScrollView, StyleSheet, Switch, Text, TextInput, View } from 'react-native';
import { COLORS } from '../constants';

function PinInput({label,value,onChangeText,placeholder='4–6 digits'}) {
  return <View>
    <Text style={s.label}>{label}</Text>
    <TextInput
      value={value}
      onChangeText={onChangeText}
      keyboardType="number-pad"
      secureTextEntry
      maxLength={6}
      placeholder={placeholder}
      placeholderTextColor={COLORS.muted}
      style={s.input}
    />
  </View>;
}

const TIMEOUTS=[
  [0,'Immediately'],
  [30,'After 30 seconds'],
  [60,'After 1 minute'],
  [300,'After 5 minutes'],
];

export default function SecuritySettingsModal({
  visible,onClose,config,biometricAvailable,busy=false,
  onEnable,onUpdatePin,onDisable,onToggleBiometric,onSetTimeout,
}) {
  const enabled=config?.enabled===true;
  const [pin,setPin]=useState('');
  const [confirmPin,setConfirmPin]=useState('');
  const [currentPin,setCurrentPin]=useState('');
  const [newPin,setNewPin]=useState('');
  const [newPinConfirm,setNewPinConfirm]=useState('');

  useEffect(()=>{if(visible){setPin('');setConfirmPin('');setCurrentPin('');setNewPin('');setNewPinConfirm('');}},[visible]);

  function enable(){
    if(pin!==confirmPin)return Alert.alert('PINs do not match','Enter the same PIN twice.');
    onEnable(pin);
  }
  function update(){
    if(newPin!==newPinConfirm)return Alert.alert('PINs do not match','Enter the same new PIN twice.');
    onUpdatePin(currentPin,newPin);
  }
  function disable(){
    if(!currentPin)return Alert.alert('Current PIN required','Enter your current PIN before disabling app lock.');
    onDisable(currentPin);
  }

  return <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
    <Pressable style={s.backdrop} onPress={busy?undefined:onClose}/>
    <ScrollView style={s.sheet} contentContainerStyle={s.body} keyboardShouldPersistTaps="handled">
      <Text style={s.title}>App lock</Text>
      <Text style={s.muted}>Protect Kharcha from casual access with a device-local PIN and optional biometrics.</Text>

      {!enabled?<View style={s.section}>
        <Text style={s.sectionTitle}>Enable PIN lock</Text>
        <Text style={s.meta}>Use a 4–6 digit PIN. Kharcha stores a salted PIN hash in the platform secure store, not the plaintext PIN.</Text>
        <PinInput label="New PIN" value={pin} onChangeText={setPin}/>
        <PinInput label="Confirm PIN" value={confirmPin} onChangeText={setConfirmPin}/>
        <Pressable style={[s.primary,busy&&s.disabled]} disabled={busy} onPress={enable}><Text style={s.primaryText}>Enable app lock</Text></Pressable>
      </View>:<>
        <View style={s.section}>
          <Text style={s.sectionTitle}>Unlock method</Text>
          <View style={s.switchRow}>
            <View style={s.switchCopy}><Text style={s.rowTitle}>Biometric unlock</Text><Text style={s.meta}>{biometricAvailable?'Use enrolled fingerprint / Face ID with PIN fallback.':'No enrolled biometric method is available.'}</Text></View>
            <Switch value={Boolean(config.biometricEnabled&&biometricAvailable)} disabled={busy||!biometricAvailable} onValueChange={onToggleBiometric} trackColor={{false:COLORS.border,true:COLORS.accentSoft}} thumbColor={config.biometricEnabled?COLORS.accent:COLORS.muted}/>
          </View>
        </View>

        <View style={s.section}>
          <Text style={s.sectionTitle}>Auto-lock</Text>
          <Text style={s.meta}>Lock Kharcha after it has been in the background.</Text>
          <View style={s.timeoutGrid}>{TIMEOUTS.map(([seconds,label])=><Pressable key={seconds} onPress={()=>onSetTimeout(seconds)} disabled={busy} style={[s.timeout,config.lockAfterSeconds===seconds&&s.timeoutActive]}><Text style={[s.timeoutText,config.lockAfterSeconds===seconds&&s.timeoutTextActive]}>{label}</Text></Pressable>)}</View>
        </View>

        <View style={s.section}>
          <Text style={s.sectionTitle}>Change PIN</Text>
          <PinInput label="Current PIN" value={currentPin} onChangeText={setCurrentPin}/>
          <PinInput label="New PIN" value={newPin} onChangeText={setNewPin}/>
          <PinInput label="Confirm new PIN" value={newPinConfirm} onChangeText={setNewPinConfirm}/>
          <Pressable style={[s.secondary,busy&&s.disabled]} disabled={busy} onPress={update}><Text style={s.secondaryText}>Update PIN</Text></Pressable>
        </View>

        <View style={[s.section,s.dangerSection]}>
          <Text style={s.dangerTitle}>Disable app lock</Text>
          <Text style={s.meta}>Enter your current PIN above before disabling protection.</Text>
          <Pressable style={[s.dangerButton,busy&&s.disabled]} disabled={busy} onPress={disable}><Text style={s.dangerButtonText}>Disable app lock</Text></Pressable>
        </View>
      </>}

      <View style={s.note}><Text style={s.noteText}>App lock protects access to Kharcha. It does not encrypt the full transaction database or exported backup/CSV/PDF files.</Text></View>
      <Pressable style={s.close} disabled={busy} onPress={onClose}><Text style={s.closeText}>Close</Text></Pressable>
    </ScrollView>
  </Modal>;
}

const s=StyleSheet.create({
  backdrop:{...StyleSheet.absoluteFillObject,backgroundColor:'rgba(38,39,48,.42)'},
  sheet:{position:'absolute',left:0,right:0,bottom:0,maxHeight:'94%',backgroundColor:COLORS.surface,borderTopLeftRadius:20,borderTopRightRadius:20,borderWidth:1,borderColor:COLORS.border},
  body:{padding:20,paddingBottom:30},
  title:{color:COLORS.text,fontSize:22,fontWeight:'600'},muted:{color:COLORS.muted,fontSize:13,lineHeight:19,marginTop:4},
  section:{backgroundColor:COLORS.surface2,borderRadius:12,padding:15,marginTop:14},dangerSection:{borderWidth:1,borderColor:'#F3B7B7'},
  sectionTitle:{color:COLORS.text,fontSize:15,fontWeight:'600'},dangerTitle:{color:COLORS.danger,fontSize:15,fontWeight:'600'},
  label:{color:COLORS.text,fontSize:12,fontWeight:'600',marginTop:13,marginBottom:6},
  input:{height:48,borderRadius:10,borderWidth:1,borderColor:COLORS.border,backgroundColor:COLORS.surface,color:COLORS.text,paddingHorizontal:12,fontSize:17,letterSpacing:4},
  meta:{color:COLORS.muted,fontSize:12,lineHeight:17,marginTop:4},
  primary:{height:50,borderRadius:10,backgroundColor:COLORS.accent,alignItems:'center',justifyContent:'center',marginTop:16},primaryText:{color:COLORS.onAccent,fontWeight:'600'},
  secondary:{height:48,borderRadius:10,borderWidth:1,borderColor:COLORS.border,backgroundColor:COLORS.surface,alignItems:'center',justifyContent:'center',marginTop:14},secondaryText:{color:COLORS.text,fontWeight:'600'},
  switchRow:{flexDirection:'row',alignItems:'center',gap:12,marginTop:10},switchCopy:{flex:1},rowTitle:{color:COLORS.text,fontSize:14,fontWeight:'600'},
  timeoutGrid:{gap:8,marginTop:12},timeout:{minHeight:44,borderRadius:12,borderWidth:1,borderColor:COLORS.border,backgroundColor:COLORS.surface,justifyContent:'center',paddingHorizontal:12},timeoutActive:{borderColor:COLORS.accent,backgroundColor:COLORS.accentSoft},timeoutText:{color:COLORS.muted,fontWeight:'600'},timeoutTextActive:{color:COLORS.accent,fontWeight:'600'},
  dangerButton:{height:48,borderRadius:10,backgroundColor:COLORS.danger,alignItems:'center',justifyContent:'center',marginTop:12},dangerButtonText:{color:'#FFFFFF',fontWeight:'600'},
  note:{backgroundColor:COLORS.surface2,borderRadius:10,padding:12,marginTop:14},noteText:{color:COLORS.muted,fontSize:11,lineHeight:16},
  close:{height:44,alignItems:'center',justifyContent:'center',marginTop:8},closeText:{color:COLORS.muted,fontWeight:'600'},disabled:{opacity:.5},
});
