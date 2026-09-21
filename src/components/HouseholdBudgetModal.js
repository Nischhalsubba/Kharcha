import React, { useEffect, useState } from 'react';
import { Alert, Modal, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { COLORS } from '../constants';
import { t } from '../i18n';
const { normalizeAmount } = require('../domain/finance');

export default function HouseholdBudgetModal({visible,onClose,onSave,settings={}}) {
  const lang=settings.language||'en';
  const [name,setName]=useState('');
  const [limit,setLimit]=useState('');
  const [members,setMembers]=useState('');

  useEffect(()=>{if(visible){setName('');setLimit('');setMembers('');}},[visible]);

  function submit(){
    const amount=normalizeAmount(limit);
    if(!name.trim())return Alert.alert('Name required','Enter a household budget name.');
    if(!amount)return Alert.alert('Check budget','Enter a monthly limit greater than zero.');
    const memberList=[...new Set(members.split(',').map(item=>item.trim()).filter(Boolean))];
    onSave({id:`household-${Date.now()}`,name:name.trim(),monthlyLimit:amount,members:memberList,active:true,createdAt:new Date().toISOString()});
  }

  return <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
    <Pressable style={s.backdrop} onPress={onClose}/><View style={s.sheet}>
      <Text style={s.title}>{t(lang,'addHousehold','Add household budget')}</Text>
      <Text style={s.muted}>{lang==='ne'?'घरका साझा खर्चलाई एउटै मासिक सीमा र सदस्य नामसँग ट्र्याक गर्नुहोस्।':'Track shared home spending against one monthly limit and optional member names.'}</Text>
      <Text style={s.label}>{t(lang,'householdName','Budget name')}</Text><TextInput value={name} onChangeText={setName} placeholder="Home" placeholderTextColor={COLORS.muted} style={s.input}/>
      <Text style={s.label}>{t(lang,'monthlyBudget','Monthly budget')}</Text><TextInput value={limit} onChangeText={setLimit} keyboardType="decimal-pad" placeholder="30000" placeholderTextColor={COLORS.muted} style={s.input}/>
      <Text style={s.label}>{t(lang,'members','Members')}</Text><TextInput value={members} onChangeText={setMembers} placeholder="Nischhal, Reeja" placeholderTextColor={COLORS.muted} style={s.input}/>
      <Text style={s.hint}>{lang==='ne'?'नामहरू comma ले छुट्याउनुहोस्।':'Separate names with commas.'}</Text>
      <Pressable style={s.primary} onPress={submit}><Text style={s.primaryText}>{t(lang,'save','Save')}</Text></Pressable>
    </View>
  </Modal>;
}

const s=StyleSheet.create({
  backdrop:{...StyleSheet.absoluteFillObject,backgroundColor:'rgba(0,0,0,.58)'},sheet:{position:'absolute',left:0,right:0,bottom:0,backgroundColor:'#10161E',borderTopLeftRadius:28,borderTopRightRadius:28,borderWidth:1,borderColor:COLORS.border,padding:20,paddingBottom:28},
  title:{color:COLORS.text,fontSize:22,fontWeight:'900'},muted:{color:COLORS.muted,fontSize:13,lineHeight:19,marginTop:4},label:{color:COLORS.text,fontSize:12,fontWeight:'700',marginTop:14,marginBottom:7},input:{height:48,borderRadius:14,borderWidth:1,borderColor:COLORS.border,backgroundColor:COLORS.surface2,color:COLORS.text,paddingHorizontal:12},hint:{color:COLORS.muted,fontSize:11,marginTop:6},primary:{height:52,borderRadius:15,marginTop:20,backgroundColor:COLORS.accent,alignItems:'center',justifyContent:'center'},primaryText:{color:'#07130F',fontSize:15,fontWeight:'900'},
});
