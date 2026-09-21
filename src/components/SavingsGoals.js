import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { COLORS } from '../constants';
import { t } from '../i18n';
const { transactionDateLabel } = require('../domain/nepal');

export default function SavingsGoals({settings,money,statuses,onAdd,onDeposit,onWithdraw}) {
  const lang=settings.language||'en';
  function dateLabel(value){if(!value)return '';try{const d=transactionDateLabel(value,settings);return d.secondary?`${d.primary} · ${d.secondary}`:d.primary;}catch{return value;}}
  return <View>
    <View style={s.head}><Text style={s.title}>{t(lang,'savingsGoals','Savings goals')}</Text><Pressable onPress={onAdd}><Text style={s.link}>{t(lang,'add','Add')}</Text></Pressable></View>
    {statuses.length?<View style={s.list}>{statuses.map(goal=><View key={goal.id} style={s.item}>
      <View style={s.between}><View style={s.copy}><Text style={s.itemTitle}>🎯 {goal.name}</Text><Text style={s.meta}>{money(goal.saved)} / {money(goal.targetAmount)}{goal.targetDate?` · ${dateLabel(goal.targetDate)}`:''}</Text></View><Text style={s.percent}>{Math.round(goal.progress*100)}%</Text></View>
      <View style={s.track}><View style={[s.fill,{width:`${goal.progress*100}%`}]} /></View>
      <View style={s.actions}>{goal.remaining>0?<Pressable onPress={()=>onDeposit(goal)}><Text style={s.link}>{t(lang,'deposit','Add savings')}</Text></Pressable>:null}{goal.saved>0?<Pressable onPress={()=>onWithdraw(goal)}><Text style={s.withdraw}>{t(lang,'withdraw','Withdraw')}</Text></Pressable>:null}{goal.remaining===0?<Text style={s.success}>✓ {t(lang,'goalReached','Goal reached')}</Text>:null}</View>
    </View>)}</View>:<Text style={s.empty}>{t(lang,'noGoals','No savings goals yet.')}</Text>}
  </View>;
}
const s=StyleSheet.create({
  head:{flexDirection:'row',justifyContent:'space-between',alignItems:'center',marginTop:24,marginBottom:10},title:{color:COLORS.text,fontSize:18,fontWeight:'800'},link:{color:COLORS.accent,fontSize:12,fontWeight:'800'},withdraw:{color:COLORS.income,fontSize:12,fontWeight:'800'},success:{color:COLORS.accent,fontSize:12,fontWeight:'800'},
  list:{backgroundColor:COLORS.surface,borderRadius:18,borderWidth:1,borderColor:COLORS.border,overflow:'hidden'},item:{padding:14,borderBottomWidth:1,borderBottomColor:COLORS.border},between:{flexDirection:'row',justifyContent:'space-between',alignItems:'center'},copy:{flex:1},itemTitle:{color:COLORS.text,fontSize:14,fontWeight:'800'},meta:{color:COLORS.muted,fontSize:12,lineHeight:17,marginTop:4},percent:{color:COLORS.text,fontSize:15,fontWeight:'900'},track:{height:6,borderRadius:99,backgroundColor:COLORS.surface2,overflow:'hidden',marginTop:10},fill:{height:'100%',backgroundColor:COLORS.accent,borderRadius:99},actions:{flexDirection:'row',gap:16,alignItems:'center',marginTop:10},empty:{color:COLORS.muted,backgroundColor:COLORS.surface,borderRadius:18,borderWidth:1,borderColor:COLORS.border,padding:16,fontSize:13},
});
