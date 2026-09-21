import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { COLORS } from '../constants';
import { t } from '../i18n';
const { transactionDateLabel } = require('../domain/nepal');

function stateLabel(state,lang){
  if(state==='overdue')return t(lang,'overdue','Overdue');
  if(state==='due')return t(lang,'due','Due today');
  if(state==='paid')return t(lang,'paid','Paid');
  if(state==='inactive')return t(lang,'paused','Paused');
  return t(lang,'upcoming','Upcoming');
}

export default function PlanningTools({settings,money,statuses,onAdd,onPay}) {
  const lang=settings.language||'en';
  const actionable=statuses.filter(item=>item.state!=='paid'&&item.state!=='inactive');
  const overdue=statuses.filter(item=>item.state==='overdue').length;
  const totalRemaining=actionable.reduce((sum,item)=>sum+item.remaining,0);
  function dateLabel(value){if(!value)return '—';try{const d=transactionDateLabel(value,settings);return d.secondary?`${d.primary} · ${d.secondary}`:d.primary;}catch{return value;}}
  return <View>
    <View style={s.head}><View><Text style={s.kicker}>{t(lang,'planning','FINANCIAL PLANNING').toUpperCase()}</Text><Text style={s.title}>{t(lang,'obligations','Bills, EMI & loans')}</Text></View><Pressable onPress={onAdd}><Text style={s.link}>{t(lang,'add','Add')}</Text></Pressable></View>
    <View style={s.summary}><View><Text style={s.meta}>{lang==='ne'?'यो चक्र बाँकी':'Remaining this cycle'}</Text><Text style={s.big}>{money(totalRemaining)}</Text></View><View style={s.right}><Text style={[s.big,overdue?s.danger:null]}>{overdue}</Text><Text style={s.meta}>{t(lang,'overdue','overdue')}</Text></View></View>
    <View style={s.list}>{statuses.length?statuses.map(item=><View key={item.id} style={s.item}><View style={s.copy}><Text style={s.itemTitle}>{item.name}</Text><Text style={s.meta}>{stateLabel(item.state,lang)} · {dateLabel(item.dueDate)}</Text></View><View style={s.right}><Text style={s.itemTitle}>{money(item.remaining)}</Text>{item.remaining>0&&item.state!=='inactive'?<Pressable onPress={()=>onPay(item)}><Text style={s.link}>{t(lang,'recordPayment','Record payment')}</Text></Pressable>:null}</View></View>):<Text style={s.empty}>{t(lang,'noObligations','No bill, EMI or loan plans yet.')}</Text>}</View>
  </View>;
}
const s=StyleSheet.create({
  head:{flexDirection:'row',justifyContent:'space-between',alignItems:'flex-end',marginTop:24,marginBottom:10},kicker:{color:COLORS.accent,fontSize:9,fontWeight:'600',letterSpacing:1},title:{color:COLORS.text,fontSize:16,lineHeight:24,fontWeight:'600',marginTop:4},link:{color:COLORS.accent,fontSize:12,fontWeight:'600'},
  summary:{minHeight:102,backgroundColor:COLORS.surface,borderRadius:12,borderWidth:1,borderColor:COLORS.border,padding:15,flexDirection:'row',justifyContent:'space-between',alignItems:'center',marginBottom:10},big:{color:COLORS.text,fontSize:20,fontWeight:'600'},meta:{color:COLORS.muted,fontSize:12,lineHeight:17,marginTop:4},danger:{color:COLORS.danger},right:{alignItems:'flex-end'},
  list:{backgroundColor:COLORS.surface,borderRadius:12,borderWidth:1,borderColor:COLORS.border,overflow:'hidden'},item:{minHeight:72,padding:14,flexDirection:'row',justifyContent:'space-between',alignItems:'center',borderBottomWidth:1,borderBottomColor:COLORS.border},copy:{flex:1},itemTitle:{color:COLORS.text,fontSize:14,fontWeight:'600'},empty:{color:COLORS.muted,padding:16,fontSize:13},
});
