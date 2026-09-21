import { Platform } from 'react-native';
import Constants from 'expo-constants';

const CHANNEL_ID='kharcha-reminders';
const SOURCE='kharcha-reminder';

let notificationsModule=null;
let notificationHandlerConfigured=false;

export function isReminderRuntimeSupported() {
  return !(Platform.OS==='android' && Constants.executionEnvironment==='storeClient');
}

function getNotifications() {
  if(!isReminderRuntimeSupported()) return null;

  if(!notificationsModule){
    // SDK 57's expo-notifications package can crash Android Expo Go merely
    // by being imported. Keep the native module completely lazy so Expo Go
    // can run Kharcha while development/production builds retain reminders.
    notificationsModule=require('expo-notifications');
  }

  if(!notificationHandlerConfigured){
    notificationsModule.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowBanner: true,
        shouldShowList: true,
        shouldPlaySound: false,
        shouldSetBadge: false,
      }),
    });
    notificationHandlerConfigured=true;
  }

  return notificationsModule;
}

function permissionGranted(status,Notifications) {
  if (status?.granted) return true;
  const iosStatus=status?.ios?.status;
  return [
    Notifications?.IosAuthorizationStatus?.AUTHORIZED,
    Notifications?.IosAuthorizationStatus?.PROVISIONAL,
    Notifications?.IosAuthorizationStatus?.EPHEMERAL,
  ].filter((value)=>value!=null).includes(iosStatus);
}

export async function ensureReminderChannel() {
  const Notifications=getNotifications();
  if(!Notifications) return false;
  if (Platform.OS!=='android') return true;
  await Notifications.setNotificationChannelAsync(CHANNEL_ID,{
    name:'Kharcha reminders',
    description:'Bills, Udhaaro and savings target reminders',
    importance:Notifications.AndroidImportance.DEFAULT,
    vibrationPattern:[0,200],
  });
  return true;
}

export async function getReminderPermission() {
  const Notifications=getNotifications();
  if(!Notifications) return false;
  const status=await Notifications.getPermissionsAsync();
  return permissionGranted(status,Notifications);
}

export async function requestReminderPermission() {
  const Notifications=getNotifications();
  if(!Notifications) return false;
  await ensureReminderChannel();
  const existing=await Notifications.getPermissionsAsync();
  if(permissionGranted(existing,Notifications)) return true;
  const requested=await Notifications.requestPermissionsAsync({
    ios:{allowAlert:true,allowBadge:false,allowSound:false},
  });
  return permissionGranted(requested,Notifications);
}

function localIsoDate(date=new Date()) {
  const pad=(value)=>String(value).padStart(2,'0');
  return `${date.getFullYear()}-${pad(date.getMonth()+1)}-${pad(date.getDate())}`;
}

function targetDate(isoDate) {
  const [year,month,day]=String(isoDate).split('-').map(Number);
  return new Date(year,month-1,day,9,0,0,0);
}

function reminderCopy(item,language='en') {
  const lead=item.stage==='lead';
  if(language==='ne'){
    if(item.kind==='obligation') return {title:lead?'भुक्तानी सम्झना':'आज भुक्तानी गर्नुहोस्',body:lead?`${item.name} भोलि तिर्नुपर्ने छ।`:`${item.name} आज तिर्नुपर्ने छ।`};
    if(item.kind==='udharo') return {title:lead?'उधारो सम्झना':'आज उधारो मिति',body:lead?`${item.name} को उधारो भोलि म्यादमा पुग्छ।`:`${item.name} को उधारो आज म्यादमा पुग्छ।`};
    return {title:lead?'बचत लक्ष्य सम्झना':'बचत लक्ष्य मिति',body:lead?`${item.name} को लक्ष्य मिति भोलि हो।`:`${item.name} को लक्ष्य मिति आज हो।`};
  }
  if(item.kind==='obligation') return {title:lead?'Payment reminder':'Payment due today',body:lead?`${item.name} is due tomorrow.`:`${item.name} is due today.`};
  if(item.kind==='udharo') return {title:lead?'Udhaaro reminder':'Udhaaro due today',body:lead?`${item.name}'s Udhaaro is due tomorrow.`:`${item.name}'s Udhaaro is due today.`};
  return {title:lead?'Savings goal reminder':'Savings target today',body:lead?`${item.name}'s target date is tomorrow.`:`${item.name}'s target date is today.`};
}

async function cancelKharchaReminders(Notifications) {
  if(!Notifications) return 0;
  const scheduled=await Notifications.getAllScheduledNotificationsAsync();
  const owned=scheduled.filter((request)=>request?.content?.data?.source===SOURCE);
  await Promise.all(owned.map((request)=>Notifications.cancelScheduledNotificationAsync(request.identifier)));
  return owned.length;
}

export async function syncFinancialReminders(plan=[],language='en') {
  const Notifications=getNotifications();
  if(!Notifications){
    return {scheduled:0,permissionGranted:false,unsupportedRuntime:true};
  }

  await cancelKharchaReminders(Notifications);
  if(!plan.length) return {scheduled:0,permissionGranted:await getReminderPermission(),unsupportedRuntime:false};
  const allowed=await getReminderPermission();
  if(!allowed) return {scheduled:0,permissionGranted:false,unsupportedRuntime:false};
  await ensureReminderChannel();

  let scheduled=0;
  const today=localIsoDate();
  for(const item of plan){
    const target=targetDate(item.date);
    let seconds=Math.floor((target.getTime()-Date.now())/1000);
    if(seconds<=0&&item.date===today) seconds=5;
    if(seconds<=0) continue;
    const copy=reminderCopy(item,language);
    const trigger={
      type:Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
      seconds:Math.max(5,seconds),
      repeats:false,
      ...(Platform.OS==='android'?{channelId:CHANNEL_ID}:{}),
    };
    await Notifications.scheduleNotificationAsync({
      content:{
        title:copy.title,
        body:copy.body,
        data:{source:SOURCE,kind:item.kind,entityId:item.entityId,stage:item.stage,dueDate:item.dueDate},
      },
      trigger,
    });
    scheduled+=1;
  }
  return {scheduled,permissionGranted:true,unsupportedRuntime:false};
}
