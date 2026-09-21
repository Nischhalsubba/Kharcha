import React from 'react';
import { Platform, Pressable } from 'react-native';
import * as Haptics from 'expo-haptics';

function trigger(kind){
  if(Platform.OS!=='ios')return;
  if(kind==='impact')Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(()=>{});
  else Haptics.selectionAsync().catch(()=>{});
}

export default function HapticPressable({onPress,haptic='selection',style,children,disabled=false,...props}){
  const handlePress=(event)=>{
    if(!disabled&&haptic)trigger(haptic);
    onPress?.(event);
  };
  return <Pressable
    {...props}
    disabled={disabled}
    onPress={handlePress}
    android_ripple={{color:'rgba(0,116,252,0.08)',borderless:false}}
    style={(state)=>[
      typeof style==='function'?style(state):style,
      state.pressed&&!disabled&&{opacity:0.72,transform:[{scale:0.985}]},
      disabled&&{opacity:0.45},
    ]}
  >{children}</Pressable>;
}
