import React from 'react';
import Svg, { Circle, Line, Path, Polyline, Rect } from 'react-native-svg';
import { COLORS } from '../constants';

const common={fill:'none',strokeLinecap:'round',strokeLinejoin:'round'};

export default function NativeIcon({name,size=22,color=COLORS.mutedStrong,strokeWidth=1.9}) {
  const props={...common,stroke:color,strokeWidth};
  let body;
  switch(name){
    case 'home':
      body=<><Path {...props} d="M3 11.5 12 4l9 7.5"/><Path {...props} d="M5 10.5V20h5v-6h4v6h5v-9.5"/></>;break;
    case 'activity':
      body=<><Line {...props} x1="8" y1="6" x2="21" y2="6"/><Line {...props} x1="8" y1="12" x2="21" y2="12"/><Line {...props} x1="8" y1="18" x2="21" y2="18"/><Circle {...props} cx="4" cy="6" r="1"/><Circle {...props} cx="4" cy="12" r="1"/><Circle {...props} cx="4" cy="18" r="1"/></>;break;
    case 'budget':
    case 'wallet':
      body=<><Rect {...props} x="3" y="6" width="18" height="13" rx="3"/><Path {...props} d="M16 10h5v5h-5a2.5 2.5 0 0 1 0-5Z"/><Circle cx="17.2" cy="12.5" r=".8" fill={color}/></>;break;
    case 'reports':
      body=<><Path {...props} d="M4 20V10"/><Path {...props} d="M10 20V4"/><Path {...props} d="M16 20v-7"/><Path {...props} d="M22 20H2"/></>;break;
    case 'plus':
      body=<><Line {...props} x1="12" y1="5" x2="12" y2="19"/><Line {...props} x1="5" y1="12" x2="19" y2="12"/></>;break;
    case 'settings':
      body=<><Line {...props} x1="4" y1="7" x2="20" y2="7"/><Circle {...props} cx="9" cy="7" r="2"/><Line {...props} x1="4" y1="17" x2="20" y2="17"/><Circle {...props} cx="15" cy="17" r="2"/></>;break;
    case 'search':
      body=<><Circle {...props} cx="10.5" cy="10.5" r="6.5"/><Line {...props} x1="15.5" y1="15.5" x2="21" y2="21"/></>;break;
    case 'more':
      body=<><Circle cx="5" cy="12" r="1.3" fill={color}/><Circle cx="12" cy="12" r="1.3" fill={color}/><Circle cx="19" cy="12" r="1.3" fill={color}/></>;break;
    case 'transfer':
      body=<><Path {...props} d="M4 8h13l-3-3"/><Path {...props} d="m17 8-3 3"/><Path {...props} d="M20 16H7l3 3"/><Path {...props} d="m7 16 3-3"/></>;break;
    case 'food':
      body=<><Path {...props} d="M6 3v8"/><Path {...props} d="M3.5 3v5a2.5 2.5 0 0 0 5 0V3"/><Path {...props} d="M6 11v10"/><Path {...props} d="M16 3v18"/><Path {...props} d="M16 3c3 2 4 5 4 8h-4"/></>;break;
    case 'groceries':
      body=<><Path {...props} d="M4 9h16l-1.5 11h-13Z"/><Path {...props} d="m8 9 2-5M16 9l-2-5"/></>;break;
    case 'transport':
      body=<><Path {...props} d="M5 17h14l-1-7-2-4H8l-2 4Z"/><Circle {...props} cx="7.5" cy="17.5" r="1.5"/><Circle {...props} cx="16.5" cy="17.5" r="1.5"/><Line {...props} x1="6" y1="11" x2="18" y2="11"/></>;break;
    case 'fuel':
      body=<><Rect {...props} x="4" y="3" width="10" height="18" rx="2"/><Line {...props} x1="6.5" y1="7" x2="11.5" y2="7"/><Path {...props} d="M14 7h3l3 3v8a2 2 0 0 1-4 0v-5"/></>;break;
    case 'shopping':
      body=<><Path {...props} d="M5 8h14l1 13H4Z"/><Path {...props} d="M9 10V7a3 3 0 0 1 6 0v3"/></>;break;
    case 'bills':
      body=<><Path {...props} d="M6 3h12v18l-3-2-3 2-3-2-3 2Z"/><Line {...props} x1="9" y1="8" x2="15" y2="8"/><Line {...props} x1="9" y1="12" x2="15" y2="12"/></>;break;
    case 'electricity':
      body=<Path {...props} d="m13 2-7 11h6l-1 9 7-12h-6Z"/>;break;
    case 'water':
      body=<Path {...props} d="M12 2s6 7 6 12a6 6 0 0 1-12 0c0-5 6-12 6-12Z"/>;break;
    case 'internet':
      body=<><Path {...props} d="M4 9a12 12 0 0 1 16 0"/><Path {...props} d="M7 13a7 7 0 0 1 10 0"/><Path {...props} d="M10 17a3 3 0 0 1 4 0"/><Circle cx="12" cy="20" r="1" fill={color}/></>;break;
    case 'phone':
      body=<><Rect {...props} x="7" y="2" width="10" height="20" rx="2"/><Line {...props} x1="10" y1="5" x2="14" y2="5"/><Circle cx="12" cy="19" r=".8" fill={color}/></>;break;
    case 'health':
      body=<Path {...props} d="M12 21S4 16 4 10a4 4 0 0 1 7-2.6A4 4 0 0 1 18 10c0 6-6 11-6 11Z"/>;break;
    case 'house':
      body=<><Path {...props} d="M3 11.5 12 4l9 7.5"/><Path {...props} d="M5 10.5V20h14v-9.5"/><Path {...props} d="M10 20v-6h4v6"/></>;break;
    case 'key':
      body=<><Circle {...props} cx="8" cy="12" r="4"/><Path {...props} d="M12 12h9M18 12v3M15 12v2"/></>;break;
    case 'school':
      body=<><Path {...props} d="m3 9 9-5 9 5-9 5Z"/><Path {...props} d="M7 12v5c3 2 7 2 10 0v-5"/><Line {...props} x1="21" y1="9" x2="21" y2="16"/></>;break;
    case 'bank':
      body=<><Path {...props} d="m3 9 9-5 9 5"/><Line {...props} x1="5" y1="10" x2="19" y2="10"/><Line {...props} x1="6" y1="10" x2="6" y2="18"/><Line {...props} x1="10" y1="10" x2="10" y2="18"/><Line {...props} x1="14" y1="10" x2="14" y2="18"/><Line {...props} x1="18" y1="10" x2="18" y2="18"/><Line {...props} x1="3" y1="20" x2="21" y2="20"/></>;break;
    case 'donation':
      body=<><Path {...props} d="M7 13c2-2 3-3 5-3 3 0 5 2 5 5"/><Path {...props} d="M3 12h4v7H3Z"/><Path {...props} d="M7 18h8l6-4"/><Path {...props} d="M12 8S9 6 9 4.5a2 2 0 0 1 3-1.2A2 2 0 0 1 15 4.5C15 6 12 8 12 8Z"/></>;break;
    case 'festival':
    case 'sparkles':
      body=<><Path {...props} d="m12 3 1.5 4.5L18 9l-4.5 1.5L12 15l-1.5-4.5L6 9l4.5-1.5Z"/><Path {...props} d="m19 15 .7 2.3L22 18l-2.3.7L19 21l-.7-2.3L16 18l2.3-.7Z"/></>;break;
    case 'entertainment':
      body=<><Rect {...props} x="3" y="5" width="18" height="14" rx="3"/><Path {...props} d="m10 9 6 3-6 3Z"/></>;break;
    case 'briefcase':
      body=<><Rect {...props} x="3" y="7" width="18" height="13" rx="2"/><Path {...props} d="M9 7V4h6v3"/><Path {...props} d="M3 12h18"/></>;break;
    case 'laptop':
      body=<><Rect {...props} x="4" y="4" width="16" height="12" rx="2"/><Path {...props} d="M2 20h20l-2-4H4Z"/></>;break;
    case 'globe':
      body=<><Circle {...props} cx="12" cy="12" r="9"/><Path {...props} d="M3 12h18M12 3c3 3 3 15 0 18M12 3c-3 3-3 15 0 18"/></>;break;
    case 'store':
      body=<><Path {...props} d="M4 9h16l-2-5H6Z"/><Path {...props} d="M5 9v11h14V9"/><Path {...props} d="M9 20v-6h6v6"/></>;break;
    case 'coins':
      body=<><EllipseCoin {...props} cx="9" cy="7"/><Path {...props} d="M4 7v4c0 2 10 2 10 0V7"/><Path {...props} d="M10 14c2.5 1 7 .6 7-1.5V9"/><Path {...props} d="M10 18c2.5 1 7 .6 7-1.5v-4"/></>;break;
    case 'gift':
      body=<><Rect {...props} x="4" y="9" width="16" height="12" rx="2"/><Line {...props} x1="12" y1="9" x2="12" y2="21"/><Line {...props} x1="3" y1="9" x2="21" y2="9"/><Path {...props} d="M12 9c-3 0-5-1-5-3 0-1.5 1-2.5 2.5-2.5C11.5 3.5 12 6 12 9ZM12 9c3 0 5-1 5-3 0-1.5-1-2.5-2.5-2.5C12.5 3.5 12 6 12 9Z"/></>;break;
    case 'target':
      body=<><Circle {...props} cx="12" cy="12" r="9"/><Circle {...props} cx="12" cy="12" r="5"/><Circle cx="12" cy="12" r="1.5" fill={color}/></>;break;
    case 'repeat':
      body=<><Path {...props} d="M17 2l4 4-4 4"/><Path {...props} d="M3 11V9a3 3 0 0 1 3-3h15"/><Path {...props} d="m7 22-4-4 4-4"/><Path {...props} d="M21 13v2a3 3 0 0 1-3 3H3"/></>;break;
    case 'calendar':
      body=<><Rect {...props} x="3" y="5" width="18" height="16" rx="2"/><Line {...props} x1="7" y1="3" x2="7" y2="7"/><Line {...props} x1="17" y1="3" x2="17" y2="7"/><Line {...props} x1="3" y1="10" x2="21" y2="10"/></>;break;
    case 'cash':
      body=<><Rect {...props} x="3" y="6" width="18" height="12" rx="2"/><Circle {...props} cx="12" cy="12" r="3"/><Path {...props} d="M6 9h1M17 15h1"/></>;break;
    case 'card':
      body=<><Rect {...props} x="3" y="5" width="18" height="14" rx="2"/><Line {...props} x1="3" y1="9" x2="21" y2="9"/><Line {...props} x1="7" y1="15" x2="11" y2="15"/></>;break;
    case 'qr':
      body=<><Rect {...props} x="3" y="3" width="6" height="6"/><Rect {...props} x="15" y="3" width="6" height="6"/><Rect {...props} x="3" y="15" width="6" height="6"/><Path {...props} d="M15 15h3v3h3M15 21h3v-3"/></>;break;
    case 'tag':
      body=<><Path {...props} d="M3 12V4h8l10 10-7 7Z"/><Circle {...props} cx="8" cy="8" r="1.5"/></>;break;
    case 'chevron-right':
      body=<Polyline {...props} points="9 5 16 12 9 19"/>;break;
    case 'chevron-left':
      body=<Polyline {...props} points="15 5 8 12 15 19"/>;break;
    case 'close':
      body=<><Line {...props} x1="6" y1="6" x2="18" y2="18"/><Line {...props} x1="18" y1="6" x2="6" y2="18"/></>;break;
    default:
      body=<><Circle cx="6" cy="12" r="1.2" fill={color}/><Circle cx="12" cy="12" r="1.2" fill={color}/><Circle cx="18" cy="12" r="1.2" fill={color}/></>;
  }
  return <Svg width={size} height={size} viewBox="0 0 24 24" accessibilityElementsHidden>{body}</Svg>;
}

function EllipseCoin(props){
  return <Path {...props} d="M4 7c0-2 10-2 10 0s-10 2-10 0Z"/>;
}

export function categoryIconName(category,type='expense'){
  if(category==='Savings Goal')return 'target';
  if(category==='Udhaaro Repayment')return 'donation';
  const key=String(category||'').toLowerCase();
  if(['food','khaja'].includes(key))return 'food';
  if(key==='groceries')return 'groceries';
  if(key==='transport')return 'transport';
  if(key==='fuel')return 'fuel';
  if(key==='shopping')return 'shopping';
  if(key==='bills')return 'bills';
  if(key==='electricity')return 'electricity';
  if(key==='water')return 'water';
  if(key==='internet')return 'internet';
  if(key==='mobile recharge')return 'phone';
  if(key==='health')return 'health';
  if(['home','rental income'].includes(key))return 'house';
  if(key==='rent')return 'key';
  if(key==='school fees')return 'school';
  if(['emi','loan repayment'].includes(key))return 'bank';
  if(key==='puja & donation')return 'donation';
  if(key==='festival')return 'festival';
  if(key==='entertainment')return 'entertainment';
  if(key==='salary')return 'briefcase';
  if(key==='freelance')return 'laptop';
  if(key==='remittance')return 'globe';
  if(key==='business')return 'store';
  if(key==='allowance')return 'coins';
  if(key==='gift')return 'gift';
  return type==='income'?'coins':'tag';
}

export function walletIconName(wallet){
  const key=String(wallet?.type||wallet?.id||'').toLowerCase();
  if(key.includes('cash'))return 'cash';
  if(key.includes('bank'))return 'bank';
  if(key.includes('card'))return 'card';
  if(key.includes('esewa')||key.includes('khalti')||key.includes('ime'))return 'phone';
  return 'wallet';
}

export function paymentIconName(key){
  if(key==='cash')return 'cash';
  if(key==='qr')return 'qr';
  if(key==='card')return 'card';
  if(key==='bank')return 'bank';
  return 'wallet';
}
