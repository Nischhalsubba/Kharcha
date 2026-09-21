import React, { useEffect, useState } from 'react';
import { Alert, Modal, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { COLORS, WALLET_PRESETS } from '../constants';

export default function WalletModal({ visible, onClose, onSave }) {
  const [preset, setPreset] = useState('bank');
  const [name, setName] = useState('Bank');
  const [openingBalance, setOpeningBalance] = useState('0');

  useEffect(() => { if (visible) { setPreset('bank'); setName('Bank'); setOpeningBalance('0'); } }, [visible]);

  function choose(next) {
    const item = WALLET_PRESETS.find(([id]) => id === next);
    setPreset(next); setName(item?.[1] || 'Wallet');
  }

  function submit() {
    const trimmed = name.trim();
    const amount = Number(String(openingBalance).replace(/,/g, '').trim() || 0);
    if (!trimmed) return Alert.alert('Name your wallet', 'Enter a wallet or account name.');
    if (!Number.isFinite(amount)) return Alert.alert('Check opening balance', 'Enter a valid number.');
    const item = WALLET_PRESETS.find(([id]) => id === preset);
    onSave({ id: `${preset}-${Date.now()}`, name: trimmed, type: preset, icon: item?.[2] || '👛', openingBalance: amount });
  }

  return <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
    <Pressable style={s.backdrop} onPress={onClose}/><View style={s.sheet}><Text style={s.title}>Add wallet</Text><Text style={s.muted}>Track cash, bank and digital wallets separately.</Text>
      <Text style={s.label}>Type</Text><ScrollView horizontal showsHorizontalScrollIndicator={false}>{WALLET_PRESETS.map(([id,label,icon])=><Pressable key={id} onPress={()=>choose(id)} style={[s.chip,preset===id&&s.selected]}><Text>{icon}</Text><Text style={s.chipText}>{label}</Text></Pressable>)}</ScrollView>
      <Text style={s.label}>Wallet name</Text><TextInput value={name} onChangeText={setName} placeholder="Nabil Bank, eSewa…" placeholderTextColor={COLORS.muted} style={s.input}/>
      <Text style={s.label}>Opening balance</Text><TextInput value={openingBalance} onChangeText={setOpeningBalance} keyboardType="decimal-pad" placeholder="0" placeholderTextColor={COLORS.muted} style={s.input}/>
      <Pressable style={s.primary} onPress={submit}><Text style={s.primaryText}>Add wallet</Text></Pressable>
    </View>
  </Modal>;
}
const s=StyleSheet.create({backdrop:{...StyleSheet.absoluteFillObject,backgroundColor:'rgba(0,0,0,.58)'},sheet:{position:'absolute',left:0,right:0,bottom:0,backgroundColor:'#10161E',borderTopLeftRadius:28,borderTopRightRadius:28,borderWidth:1,borderColor:COLORS.border,padding:20,paddingBottom:28},title:{color:COLORS.text,fontSize:22,fontWeight:'900'},muted:{color:COLORS.muted,fontSize:13,marginTop:4},label:{color:COLORS.text,fontSize:12,fontWeight:'700',marginTop:16,marginBottom:7},chip:{height:42,paddingHorizontal:12,borderRadius:13,borderWidth:1,borderColor:COLORS.border,backgroundColor:COLORS.surface,flexDirection:'row',gap:6,alignItems:'center',marginRight:8},selected:{borderColor:COLORS.accent,backgroundColor:COLORS.accentSoft},chipText:{color:COLORS.text,fontSize:12,fontWeight:'700'},input:{height:48,borderRadius:14,borderWidth:1,borderColor:COLORS.border,backgroundColor:COLORS.surface2,color:COLORS.text,paddingHorizontal:12},primary:{height:52,borderRadius:15,marginTop:20,backgroundColor:COLORS.accent,alignItems:'center',justifyContent:'center'},primaryText:{color:'#07130F',fontSize:15,fontWeight:'900'}});
