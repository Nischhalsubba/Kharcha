import React from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { COLORS } from '../constants';
import { t } from '../i18n';

export default function DataSafetyModal({ visible, onClose, onBackup, onRestore, busy = false, language = 'en' }) {
  return <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
    <Pressable style={s.backdrop} onPress={busy ? undefined : onClose}/>
    <View style={s.sheet}>
      <Text style={s.title}>{t(language,'backupRestore','Backup & restore')}</Text>
      <Text style={s.muted}>{t(language,'backupIntro','Keep a portable copy of all your Kharcha data so you can recover it or move to another phone.')}</Text>

      <View style={s.card}>
        <Text style={s.icon}>🛟</Text>
        <View style={s.copy}><Text style={s.cardTitle}>{t(language,'createBackup','Create backup')}</Text><Text style={s.meta}>{t(language,'createBackupHint','Exports transactions, wallets, budgets, Udhaaro, events, bills, savings goals and household budgets.')}</Text></View>
      </View>
      <Pressable style={[s.primary,busy&&s.disabled]} disabled={busy} onPress={onBackup} accessibilityRole="button">
        <Text style={s.primaryText}>{busy?t(language,'working','Working…'):t(language,'createBackup','Create backup')}</Text>
      </Pressable>

      <View style={s.card}>
        <Text style={s.icon}>♻️</Text>
        <View style={s.copy}><Text style={s.cardTitle}>{t(language,'restoreBackup','Restore backup')}</Text><Text style={s.meta}>{t(language,'restoreBackupHint','Choose a Kharcha backup file. It is validated before any current data is replaced.')}</Text></View>
      </View>
      <Pressable style={[s.secondary,busy&&s.disabled]} disabled={busy} onPress={onRestore} accessibilityRole="button">
        <Text style={s.secondaryText}>{t(language,'restoreBackup','Restore backup')}</Text>
      </Pressable>

      <View style={s.warning}><Text style={s.warningIcon}>⚠️</Text><Text style={s.warningText}>{t(language,'backupWarning','Backup files are not encrypted. Store them somewhere you trust and avoid sharing them publicly.')}</Text></View>
      <Pressable style={s.close} disabled={busy} onPress={onClose}><Text style={s.closeText}>{t(language,'close','Close')}</Text></Pressable>
    </View>
  </Modal>;
}

const s=StyleSheet.create({
  backdrop:{...StyleSheet.absoluteFillObject,backgroundColor:'rgba(0,0,0,.6)'},
  sheet:{position:'absolute',left:0,right:0,bottom:0,backgroundColor:COLORS.surface,borderTopLeftRadius:28,borderTopRightRadius:28,borderWidth:1,borderColor:COLORS.border,padding:20,paddingBottom:28},
  title:{color:COLORS.text,fontSize:22,fontWeight:'900'},muted:{color:COLORS.muted,fontSize:13,lineHeight:19,marginTop:4,marginBottom:10},
  card:{flexDirection:'row',gap:12,alignItems:'center',backgroundColor:COLORS.surface,borderRadius:16,borderWidth:1,borderColor:COLORS.border,padding:14,marginTop:12},
  icon:{fontSize:24},copy:{flex:1},cardTitle:{color:COLORS.text,fontSize:14,fontWeight:'800'},meta:{color:COLORS.muted,fontSize:12,lineHeight:17,marginTop:3},
  primary:{height:50,borderRadius:14,backgroundColor:COLORS.accent,alignItems:'center',justifyContent:'center',marginTop:10},primaryText:{color:COLORS.onAccent,fontWeight:'900'},
  secondary:{height:50,borderRadius:14,borderWidth:1,borderColor:COLORS.accent,backgroundColor:COLORS.accentSoft,alignItems:'center',justifyContent:'center',marginTop:10},secondaryText:{color:COLORS.text,fontWeight:'900'},
  warning:{flexDirection:'row',gap:9,backgroundColor:COLORS.surface2,borderRadius:14,padding:12,marginTop:14},warningIcon:{fontSize:16},warningText:{flex:1,color:COLORS.muted,fontSize:11,lineHeight:16},
  close:{height:44,alignItems:'center',justifyContent:'center',marginTop:8},closeText:{color:COLORS.muted,fontWeight:'700'},disabled:{opacity:.55},
});
