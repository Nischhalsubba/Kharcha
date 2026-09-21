import React, { useEffect, useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { COLORS } from '../constants';
import { t } from '../i18n';

function Choice({ label, active, onPress }) {
  return <Pressable onPress={onPress} style={[s.choice, active && s.choiceActive]} accessibilityRole="button" accessibilityState={{ selected: active }}><Text style={[s.choiceText, active && s.choiceTextActive]}>{label}</Text></Pressable>;
}

export default function NepalSettingsModal({ visible, onClose, settings, onSave }) {
  const [language,setLanguage]=useState(settings.language || 'en');
  const [dateSystem,setDateSystem]=useState(settings.dateSystem || 'AD');
  const [amountFormat,setAmountFormat]=useState(settings.amountFormat || 'standard');
  useEffect(()=>{if(visible){setLanguage(settings.language||'en');setDateSystem(settings.dateSystem||'AD');setAmountFormat(settings.amountFormat||'standard');}},[visible,settings]);
  const lang=language;
  return <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}><Pressable style={s.backdrop} onPress={onClose}/><View style={s.sheet}>
    <Text style={s.title}>{t(lang,'settings','Language & calendar')}</Text><Text style={s.muted}>{lang==='ne'?'खर्चालाई तपाईंको भाषा, पात्रो र रकम शैलीअनुसार बनाउनुहोस्।':'Make Kharcha match your language, calendar and money style.'}</Text>
    <Text style={s.label}>{t(lang,'language','Language')}</Text><View style={s.row}><Choice label="English" active={language==='en'} onPress={()=>setLanguage('en')}/><Choice label="नेपाली" active={language==='ne'} onPress={()=>setLanguage('ne')}/></View>
    <Text style={s.label}>{t(lang,'calendar','Calendar')}</Text><View style={s.row}><Choice label="AD" active={dateSystem==='AD'} onPress={()=>setDateSystem('AD')}/><Choice label="BS" active={dateSystem==='BS'} onPress={()=>setDateSystem('BS')}/><Choice label={t(lang,'both','Both')} active={dateSystem==='both'} onPress={()=>setDateSystem('both')}/></View>
    <Text style={s.label}>{t(lang,'amountDisplay','Amount display')}</Text><View style={s.row}><Choice label={t(lang,'standard','Standard')} active={amountFormat==='standard'} onPress={()=>setAmountFormat('standard')}/><Choice label={t(lang,'compact','Lakh/Crore')} active={amountFormat==='compact'} onPress={()=>setAmountFormat('compact')}/></View>
    <Pressable style={s.primary} onPress={()=>onSave({...settings,language,dateSystem,amountFormat})}><Text style={s.primaryText}>{t(lang,'save','Save')}</Text></Pressable>
  </View></Modal>;
}
const s=StyleSheet.create({backdrop:{...StyleSheet.absoluteFillObject,backgroundColor:'rgba(0,0,0,.58)'},sheet:{position:'absolute',left:0,right:0,bottom:0,backgroundColor:'#10161E',borderTopLeftRadius:28,borderTopRightRadius:28,borderWidth:1,borderColor:COLORS.border,padding:20,paddingBottom:28},title:{color:COLORS.text,fontSize:22,fontWeight:'900'},muted:{color:COLORS.muted,fontSize:13,lineHeight:19,marginTop:4},label:{color:COLORS.text,fontSize:12,fontWeight:'700',marginTop:18,marginBottom:8},row:{flexDirection:'row',gap:8},choice:{flex:1,minHeight:44,borderRadius:13,borderWidth:1,borderColor:COLORS.border,backgroundColor:COLORS.surface,alignItems:'center',justifyContent:'center',paddingHorizontal:8},choiceActive:{borderColor:COLORS.accent,backgroundColor:COLORS.accentSoft},choiceText:{color:COLORS.muted,fontWeight:'700',fontSize:12},choiceTextActive:{color:COLORS.text},primary:{height:52,borderRadius:15,marginTop:22,backgroundColor:COLORS.accent,alignItems:'center',justifyContent:'center'},primaryText:{color:'#07130F',fontSize:15,fontWeight:'900'}});
