import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { COLORS } from '../constants';
import { t } from '../i18n';

export default function HouseholdBudgets({settings,money,statuses,onAdd}) {
  const lang=settings.language||'en';
  return <View>
    <View style={s.head}><Text style={s.title}>{t(lang,'householdBudgets','Household budgets')}</Text><Pressable onPress={onAdd}><Text style={s.link}>{t(lang,'add','Add')}</Text></Pressable></View>
    {statuses.length?<View style={s.list}>{statuses.map(item=><View key={item.id} style={s.item}>
      <View style={s.between}><View style={s.copy}><Text style={s.itemTitle}>🏠 {item.name}</Text><Text style={s.meta}>{money(item.spent)} / {money(item.limit)}</Text></View><Text style={item.overBy>0?s.danger:s.value}>{item.overBy>0?`+${money(item.overBy)}`:money(item.remaining)}</Text></View>
      <View style={s.track}><View style={[s.fill,{width:`${item.progress*100}%`}]} /></View>
      {Object.keys(item.byMember).length?<View style={s.members}>{Object.entries(item.byMember).map(([member,amount])=><Text key={member} style={s.member}>{member}: {money(amount)}</Text>)}</View>:null}
    </View>)}</View>:<Text style={s.empty}>{t(lang,'noHouseholds','No household budgets yet.')}</Text>}
  </View>;
}

const s=StyleSheet.create({
  head:{flexDirection:'row',justifyContent:'space-between',alignItems:'center',marginTop:24,marginBottom:10},title:{color:COLORS.text,fontSize:18,fontWeight:'800'},link:{color:COLORS.accent,fontSize:12,fontWeight:'800'},
  list:{backgroundColor:COLORS.surface,borderRadius:18,borderWidth:1,borderColor:COLORS.border,overflow:'hidden'},item:{padding:14,borderBottomWidth:1,borderBottomColor:COLORS.border},between:{flexDirection:'row',justifyContent:'space-between',alignItems:'center'},copy:{flex:1},itemTitle:{color:COLORS.text,fontSize:14,fontWeight:'800'},meta:{color:COLORS.muted,fontSize:12,lineHeight:17,marginTop:4},value:{color:COLORS.text,fontSize:13,fontWeight:'800'},danger:{color:COLORS.danger,fontSize:13,fontWeight:'800'},track:{height:6,borderRadius:99,backgroundColor:COLORS.surface2,overflow:'hidden',marginTop:10},fill:{height:'100%',backgroundColor:COLORS.accent,borderRadius:99},members:{flexDirection:'row',flexWrap:'wrap',gap:8,marginTop:10},member:{color:COLORS.muted,fontSize:11},empty:{color:COLORS.muted,backgroundColor:COLORS.surface,borderRadius:18,borderWidth:1,borderColor:COLORS.border,padding:16,fontSize:13},
});
