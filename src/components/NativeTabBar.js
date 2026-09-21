import React from 'react';
import { Platform, StyleSheet, Text, View } from 'react-native';
import { BlurView } from 'expo-blur';
import { COLORS } from '../constants';
import HapticPressable from './HapticPressable';
import NativeIcon from './NativeIcon';

function TabButton({item,active,onPress}){
  const color=active?COLORS.accent:COLORS.muted;
  return <HapticPressable
    style={s.tab}
    onPress={onPress}
    accessibilityRole="tab"
    accessibilityState={{selected:active}}
    accessibilityLabel={item.label}
  >
    <NativeIcon name={item.icon} size={21} color={color} strokeWidth={active?2.15:1.85}/>
    <Text style={[s.label,active&&s.labelActive]} numberOfLines={1}>{item.label}</Text>
  </HapticPressable>;
}

export default function NativeTabBar({activeTab,onTabChange,onAdd,items}){
  const left=items.slice(0,2),right=items.slice(2);
  return <View style={s.shell}>
    {Platform.OS==='ios'
      ?<BlurView intensity={72} tint="light" style={StyleSheet.absoluteFill}/>
      :<View style={[StyleSheet.absoluteFill,s.androidSurface]}/>}
    <View style={s.hairline}/>
    <View style={s.row}>
      {left.map(item=><TabButton key={item.key} item={item} active={activeTab===item.key} onPress={()=>onTabChange(item.key)}/>)}
      <View style={s.addSlot}>
        <HapticPressable haptic="impact" style={s.add} onPress={onAdd} accessibilityRole="button" accessibilityLabel="Add transaction">
          <NativeIcon name="plus" size={24} color="#FFFFFF" strokeWidth={2.2}/>
        </HapticPressable>
      </View>
      {right.map(item=><TabButton key={item.key} item={item} active={activeTab===item.key} onPress={()=>onTabChange(item.key)}/>)}
    </View>
  </View>;
}

const s=StyleSheet.create({
  shell:{height:64,overflow:'hidden',backgroundColor:'rgba(255,255,255,0.86)'},
  androidSurface:{backgroundColor:'#FFFFFF'},
  hairline:{height:StyleSheet.hairlineWidth,backgroundColor:COLORS.borderStrong,opacity:0.6},
  row:{flex:1,flexDirection:'row',alignItems:'center',paddingHorizontal:8},
  tab:{flex:1,minHeight:56,alignItems:'center',justifyContent:'center',gap:2,borderRadius:12},
  label:{color:COLORS.muted,fontSize:10,lineHeight:13,fontWeight:'500'},
  labelActive:{color:COLORS.accent,fontWeight:'600'},
  addSlot:{width:64,alignItems:'center',justifyContent:'center'},
  add:{width:48,height:48,borderRadius:24,backgroundColor:COLORS.accent,alignItems:'center',justifyContent:'center',boxShadow:'0 4px 12px rgba(0,116,252,0.18)'},
});
