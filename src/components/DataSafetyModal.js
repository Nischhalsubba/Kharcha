import React from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { COLORS } from '../constants';
import { t } from '../i18n';

function ActionCard({icon,title,copy,label,onPress,busy,primary=false}) {
  return <View style={s.block}>
    <View style={s.card}><Text style={s.icon}>{icon}</Text><View style={s.copy}><Text style={s.cardTitle}>{title}</Text><Text style={s.meta}>{copy}</Text></View></View>
    <Pressable style={[primary?s.primary:s.secondary,busy&&s.disabled]} disabled={busy} onPress={onPress} accessibilityRole="button">
      <Text style={primary?s.primaryText:s.secondaryText}>{label}</Text>
    </Pressable>
  </View>;
}

export default function DataSafetyModal({
  visible,onClose,onBackup,onRestore,onCsvExport,onMonthlyReport,onDataManagement,busy=false,language='en',
}) {
  return <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
    <Pressable style={s.backdrop} onPress={busy?undefined:onClose}/>
    <ScrollView style={s.sheet} contentContainerStyle={s.body} keyboardShouldPersistTaps="handled">
      <Text style={s.title}>{t(language,'dataSafety','Data & safety')}</Text>
      <Text style={s.muted}>{t(language,'backupIntro','Keep your Kharcha data portable, recoverable and under your control.')}</Text>

      <ActionCard icon="🛟" title={t(language,'createBackup','Create backup')} copy={t(language,'createBackupHint','Exports transactions, wallets, budgets, Udhaaro, events, bills, savings goals and household budgets.')} label={t(language,'createBackup','Create backup')} onPress={onBackup} busy={busy} primary/>
      <ActionCard icon="♻️" title={t(language,'restoreBackup','Restore backup')} copy={t(language,'restoreBackupHint','Choose a Kharcha backup file. It is validated before any current data is replaced.')} label={t(language,'restoreBackup','Restore backup')} onPress={onRestore} busy={busy}/>
      <ActionCard icon="▤" title={t(language,'exportTransactions','Export transactions')} copy={t(language,'exportTransactionsHint','Create an Excel-compatible CSV with AD + BS dates and Kharcha money details.')} label={t(language,'exportCsv','Export CSV')} onPress={onCsvExport} busy={busy}/>
      <ActionCard icon="▧" title={t(language,'monthlyReport','Monthly financial report')} copy={t(language,'monthlyReportHint','Create a PDF summary of income, expenses, budget, Udhaaro, bills, savings and household spending.')} label={t(language,'generatePdf','Generate PDF')} onPress={onMonthlyReport} busy={busy}/>
      <ActionCard icon="⚙" title={t(language,'manageData','Manage data')} copy={t(language,'manageDataHint','Import Kharcha CSV, clear a month, recover a safety snapshot, or reset the app safely.')} label={t(language,'openDataManager','Open data manager')} onPress={onDataManagement} busy={busy}/>

      <View style={s.warning}><Text style={s.warningIcon}>⚠️</Text><Text style={s.warningText}>{t(language,'backupWarning','Backup and export files are not encrypted. Store them somewhere you trust and avoid sharing them publicly.')}</Text></View>
      <Pressable style={s.close} disabled={busy} onPress={onClose}><Text style={s.closeText}>{t(language,'close','Close')}</Text></Pressable>
    </ScrollView>
  </Modal>;
}

const s=StyleSheet.create({
  backdrop:{...StyleSheet.absoluteFillObject,backgroundColor:'rgba(16,24,40,.45)'},
  sheet:{position:'absolute',left:0,right:0,bottom:0,maxHeight:'94%',backgroundColor:COLORS.surface,borderTopLeftRadius:28,borderTopRightRadius:28,borderWidth:1,borderColor:COLORS.border},
  body:{padding:20,paddingBottom:30},
  title:{color:COLORS.text,fontSize:22,fontWeight:'900'},
  muted:{color:COLORS.muted,fontSize:13,lineHeight:19,marginTop:4,marginBottom:4},
  block:{marginTop:12},
  card:{flexDirection:'row',gap:12,alignItems:'center',backgroundColor:COLORS.surface2,borderRadius:16,padding:14},
  icon:{fontSize:22},copy:{flex:1},cardTitle:{color:COLORS.text,fontSize:14,fontWeight:'800'},meta:{color:COLORS.muted,fontSize:12,lineHeight:17,marginTop:3},
  primary:{height:48,borderRadius:14,backgroundColor:COLORS.accent,alignItems:'center',justifyContent:'center',marginTop:8},
  primaryText:{color:COLORS.onAccent,fontWeight:'900'},
  secondary:{height:48,borderRadius:14,borderWidth:1,borderColor:COLORS.border,backgroundColor:COLORS.surface,alignItems:'center',justifyContent:'center',marginTop:8},
  secondaryText:{color:COLORS.text,fontWeight:'800'},
  warning:{flexDirection:'row',gap:9,backgroundColor:COLORS.surface2,borderRadius:14,padding:12,marginTop:16},
  warningIcon:{fontSize:16},warningText:{flex:1,color:COLORS.muted,fontSize:11,lineHeight:16},
  close:{height:44,alignItems:'center',justifyContent:'center',marginTop:8},closeText:{color:COLORS.muted,fontWeight:'700'},disabled:{opacity:.5},
});
