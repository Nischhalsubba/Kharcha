import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { COLORS } from '../constants';
import { t } from '../i18n';
const { transactionDateLabel } = require('../domain/nepal');

export default function PlanningSnapshot({settings,money,analytics}) {
  const lang=settings.language||'en';
  let nextDue='—';
  if(analytics.nextDueDate){try{const d=transactionDateLabel(analytics.nextDueDate,settings);nextDue=d.secondary?`${d.primary} · ${d.secondary}`:d.primary;}catch{nextDue=analytics.nextDueDate;}}
  return <View>
    <Text style={s.title}>{t(lang,'planningSnapshot','Planning snapshot')}</Text>
    <View style={s.grid}>
      <View style={s.card}><Text style={s.kicker}>{t(lang,'dueThisCycle','DUE THIS CYCLE').toUpperCase()}</Text><Text style={s.big}>{money(analytics.obligationRemaining)}</Text><Text style={s.meta}>{analytics.overdueCount} {t(lang,'overdue','overdue')}</Text></View>
      <View style={s.card}><Text style={s.kicker}>{t(lang,'savedAcrossGoals','SAVED ACROSS GOALS').toUpperCase()}</Text><Text style={s.big}>{money(analytics.savingsSaved)}</Text><Text style={s.meta}>{money(analytics.savingsTarget)} {t(lang,'targetAmount','target')}</Text></View>
      <View style={s.card}><Text style={s.kicker}>{t(lang,'householdBurn','HOUSEHOLD SPEND').toUpperCase()}</Text><Text style={s.big}>{money(analytics.householdSpent)}</Text><Text style={s.meta}>{money(analytics.householdLimit)} {t(lang,'limit','limit')}</Text></View>
      <View style={s.card}><Text style={s.kicker}>{t(lang,'nextDue','NEXT DUE').toUpperCase()}</Text><Text style={s.date}>{nextDue}</Text></View>
    </View>
  </View>;
}

const s=StyleSheet.create({title:{color:COLORS.text,fontSize:16,lineHeight:24,fontWeight:'600',marginTop:24,marginBottom:10},grid:{flexDirection:'row',flexWrap:'wrap',gap:10},card:{width:'48%',minHeight:118,backgroundColor:COLORS.surface,borderRadius:12,borderWidth:1,borderColor:COLORS.border,padding:14,justifyContent:'space-between'},kicker:{color:COLORS.accent,fontSize:9,fontWeight:'600',letterSpacing:.8},big:{color:COLORS.text,fontSize:19,fontWeight:'600'},date:{color:COLORS.text,fontSize:14,fontWeight:'600',lineHeight:20},meta:{color:COLORS.muted,fontSize:11,lineHeight:16}});
