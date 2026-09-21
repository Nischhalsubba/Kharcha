import { Platform, StyleSheet } from 'react-native';
import { COLORS, DESIGN_TOKENS } from './constants';

const cardShadow = Platform.select({
  ios: { shadowColor: COLORS.shadow, shadowOpacity: 0.13, shadowRadius: 4, shadowOffset: { width: 0, height: 2 } },
  android: { elevation: 2 },
  default: {},
});
const floatingShadow = Platform.select({
  ios: { shadowColor: COLORS.shadow, shadowOpacity: 0.12, shadowRadius: 20, shadowOffset: { width: 0, height: 12 } },
  android: { elevation: 10 },
  default: {},
});

const s=StyleSheet.create({
  safe:{flex:1,backgroundColor:COLORS.bg},
  app:{flex:1,backgroundColor:COLORS.bg},
  center:{alignItems:'center',justifyContent:'center',paddingHorizontal:24},
  content:{flex:1},

  top:{paddingHorizontal:20,paddingTop:10,paddingBottom:12,flexDirection:'row',justifyContent:'space-between',alignItems:'center'},
  eyebrow:{color:COLORS.muted,fontSize:12,lineHeight:16,fontWeight:'400',letterSpacing:-0.12},
  brand:{color:COLORS.text,fontSize:24,lineHeight:32,fontWeight:'600',letterSpacing:-0.72},
  badge:{minHeight:32,paddingHorizontal:12,borderRadius:99,backgroundColor:COLORS.nav,flexDirection:'row',alignItems:'center',gap:6},
  dot:{color:COLORS.success,fontSize:8},
  badgeText:{color:'#FFFFFF',fontSize:12,lineHeight:16,fontWeight:'500'},

  scroll:{paddingHorizontal:20,paddingBottom:120},
  screen:{flex:1,paddingHorizontal:20},
  screenTitleRow:{minHeight:44,flexDirection:'row',alignItems:'center',justifyContent:'space-between',marginBottom:12},
  screenTitle:{color:COLORS.text,fontSize:20,lineHeight:30,fontWeight:'600',letterSpacing:-0.4},
  headerIconButton:{width:36,height:36,alignItems:'center',justifyContent:'center',borderRadius:18},
  headerIconText:{color:COLORS.text,fontSize:18,fontWeight:'600'},

  hero:{paddingTop:8,paddingBottom:4},
  heroValue:{color:COLORS.text,fontSize:24,lineHeight:36,fontWeight:'600',letterSpacing:-0.72,marginTop:4},
  metrics:{flexDirection:'row',alignItems:'center',marginTop:16},
  metric:{flex:1},
  metricValue:{fontSize:14,lineHeight:21,fontWeight:'600',marginTop:3},
  metricValueLarge:{color:COLORS.text,fontSize:24,lineHeight:36,fontWeight:'600',letterSpacing:-0.72},
  divider:{width:1,height:30,backgroundColor:COLORS.border,marginHorizontal:18},
  income:{color:COLORS.income},
  danger:{color:COLORS.danger},

  card:{backgroundColor:COLORS.surface,borderRadius:12,marginTop:12,overflow:'hidden',...cardShadow},
  financeCard:{backgroundColor:COLORS.surface,borderRadius:12,overflow:'hidden',...cardShadow},
  financeCardHeader:{minHeight:48,paddingHorizontal:16,paddingVertical:10,flexDirection:'row',alignItems:'center',justifyContent:'space-between'},
  financeCardBody:{padding:16,gap:16},
  cardDivider:{height:1,backgroundColor:COLORS.border},
  cardTitle:{color:COLORS.text,fontSize:18,lineHeight:27,fontWeight:'600',letterSpacing:-0.36},
  cardHeaderTitle:{color:COLORS.text,fontSize:14,lineHeight:21,fontWeight:'600',letterSpacing:-0.28},
  cardMenu:{color:COLORS.muted,fontSize:18,fontWeight:'600',letterSpacing:2},

  between:{flexDirection:'row',justifyContent:'space-between',alignItems:'center'},
  kicker:{color:COLORS.muted,fontSize:12,lineHeight:16,fontWeight:'400',letterSpacing:-0.12},
  percent:{color:COLORS.text,fontSize:14,lineHeight:21,fontWeight:'600'},
  meta:{color:COLORS.muted,fontSize:12,lineHeight:16,fontWeight:'400',letterSpacing:-0.12},

  compareBlock:{alignItems:'flex-end',gap:4},
  pill:{minHeight:28,paddingHorizontal:12,borderRadius:99,borderWidth:1,borderColor:COLORS.border,backgroundColor:COLORS.surface,flexDirection:'row',alignItems:'center',justifyContent:'center',gap:4},
  pillText:{color:COLORS.text,fontSize:14,lineHeight:21,fontWeight:'400',letterSpacing:-0.28},
  pillChevron:{color:COLORS.muted,fontSize:12},

  chart:{height:100,flexDirection:'row',alignItems:'flex-end',gap:7,paddingTop:8},
  chartColumn:{flex:1,height:'100%',justifyContent:'flex-end',alignItems:'center',gap:5},
  chartTrack:{width:'100%',height:72,justifyContent:'flex-end',alignItems:'center'},
  chartBar:{width:'64%',minHeight:3,borderRadius:4,backgroundColor:COLORS.danger},
  chartLabel:{color:COLORS.muted,fontSize:10,lineHeight:12},
  chartBudgetLine:{height:1,backgroundColor:COLORS.danger,opacity:0.55,position:'absolute',left:0,right:0,top:22},

  track:{height:6,borderRadius:99,backgroundColor:COLORS.surface2,overflow:'hidden',marginTop:12,marginBottom:8},
  fill:{height:'100%',backgroundColor:COLORS.accent,borderRadius:99},

  sectionHead:{flexDirection:'row',justifyContent:'space-between',alignItems:'center',marginTop:20,marginBottom:12,paddingLeft:12},
  sectionTitle:{color:COLORS.text,fontSize:16,lineHeight:24,fontWeight:'600',letterSpacing:-0.32},
  action:{color:COLORS.accent,fontSize:12,lineHeight:16,fontWeight:'600'},
  sectionAction:{minHeight:44,justifyContent:'center',paddingLeft:12},

  list:{backgroundColor:COLORS.surface,borderRadius:12,overflow:'hidden',...cardShadow},
  row:{minHeight:56,flexDirection:'row',alignItems:'center',paddingHorizontal:16,paddingVertical:10},
  icon:{width:32,height:32,borderRadius:16,backgroundColor:COLORS.accentSoft,alignItems:'center',justifyContent:'center',marginRight:12,borderWidth:1,borderColor:'rgba(255,255,255,0.8)'},
  iconIncome:{backgroundColor:'#DDF8EF'},
  iconExpense:{backgroundColor:'#FFF0F0'},
  iconTransfer:{backgroundColor:'#E9F1FD'},
  iconText:{fontSize:16},
  rowCopy:{flex:1},
  rowTitle:{color:COLORS.text,fontSize:14,lineHeight:21,fontWeight:'600',letterSpacing:-0.28},
  rowRight:{alignItems:'flex-end',marginLeft:8},
  amount:{fontSize:14,lineHeight:21,fontWeight:'600',letterSpacing:-0.28},
  rowActions:{flexDirection:'row',gap:12,marginTop:4},
  edit:{color:COLORS.accent,fontSize:10,fontWeight:'600'},
  delete:{color:COLORS.danger,fontSize:10,fontWeight:'600'},
  rowDivider:{height:1,backgroundColor:COLORS.border,marginLeft:60},

  empty:{alignItems:'center',padding:28,backgroundColor:COLORS.surface,borderRadius:12,...cardShadow},
  emptyEmoji:{fontSize:28},
  emptyTitle:{color:COLORS.text,fontSize:16,lineHeight:24,fontWeight:'600',marginTop:10},
  emptyCopy:{color:COLORS.muted,textAlign:'center',fontSize:13,lineHeight:19,marginTop:6,maxWidth:280},

  secondary:{marginTop:12,paddingHorizontal:16,minHeight:44,borderRadius:10,borderWidth:1,borderColor:COLORS.border,backgroundColor:COLORS.surface,alignItems:'center',justifyContent:'center'},
  secondaryText:{color:COLORS.text,fontSize:14,lineHeight:21,fontWeight:'600'},

  listPad:{paddingBottom:120},
  listSingle:{backgroundColor:COLORS.surface,borderRadius:12,overflow:'hidden',marginBottom:8,...cardShadow},
  groupedList:{gap:12,paddingBottom:120},
  dateGroup:{backgroundColor:COLORS.surface,borderRadius:12,paddingTop:12,overflow:'hidden',...cardShadow},
  dateGroupLabel:{color:COLORS.muted,fontSize:12,lineHeight:16,paddingHorizontal:20,paddingBottom:8},

  form:{backgroundColor:COLORS.surface,borderRadius:12,padding:20,...cardShadow},
  label:{color:COLORS.mutedStrong,fontSize:12,lineHeight:16,fontWeight:'600',marginBottom:7,marginTop:12},
  inputRow:{flexDirection:'row',alignItems:'center',borderRadius:10,borderWidth:1,borderColor:COLORS.border,backgroundColor:'#FCFDFD'},
  prefix:{color:COLORS.mutedStrong,fontWeight:'600',paddingLeft:14,paddingRight:4},
  input:{flex:1,minHeight:48,color:COLORS.text,paddingHorizontal:12,fontSize:14},
  primary:{minHeight:48,borderRadius:10,marginTop:18,backgroundColor:COLORS.nav,alignItems:'center',justifyContent:'center'},
  primaryText:{color:'#FFFFFF',fontSize:14,lineHeight:21,fontWeight:'600'},

  category:{padding:16},
  emptyInline:{color:COLORS.muted,padding:18,fontSize:13},

  insightRow:{flexDirection:'row',gap:10,marginBottom:12},
  insight:{flex:1,minHeight:122,backgroundColor:COLORS.surface,borderRadius:12,padding:16,justifyContent:'space-between',...cardShadow},
  insightBig:{color:COLORS.text,fontSize:20,lineHeight:30,fontWeight:'600',marginVertical:8,letterSpacing:-0.4},

  bottom:{minHeight:64,marginHorizontal:20,marginBottom:12,borderRadius:99,backgroundColor:COLORS.nav,flexDirection:'row',alignItems:'center',justifyContent:'space-around',padding:6,...floatingShadow},
  tab:{flex:1,minHeight:44,alignItems:'center',justifyContent:'center',borderRadius:99,paddingHorizontal:4},
  tabActive:{backgroundColor:COLORS.navActive},
  tabIcon:{color:'#A8A9B2',fontSize:18,lineHeight:21,fontWeight:'600'},
  tabLabel:{color:'#A8A9B2',fontSize:9,lineHeight:12,fontWeight:'600',marginTop:1},
  active:{color:'#FFFFFF'},
  fab:{width:44,height:44,borderRadius:22,backgroundColor:COLORS.accent,alignItems:'center',justifyContent:'center',marginHorizontal:2},
  fabText:{color:'#FFFFFF',fontSize:24,lineHeight:26,fontWeight:'500'},

  search:{minHeight:44,borderRadius:10,borderWidth:1,borderColor:COLORS.borderStrong,backgroundColor:COLORS.surface,color:COLORS.text,paddingHorizontal:14,marginBottom:8,fontSize:14},
  filters:{paddingVertical:4,paddingRight:16},
  filterChip:{minHeight:36,paddingHorizontal:12,borderRadius:99,borderWidth:1,borderColor:COLORS.border,backgroundColor:COLORS.surface,justifyContent:'center',marginRight:7},
  filterChipActive:{borderColor:COLORS.borderStrong,backgroundColor:COLORS.surface2},
  filterChipText:{color:COLORS.muted,fontSize:12,lineHeight:16,fontWeight:'500'},
  filterChipTextActive:{color:COLORS.text,fontWeight:'600'},

  walletRow:{paddingRight:20,gap:10},
  walletCard:{width:150,minHeight:96,backgroundColor:COLORS.surface,borderRadius:12,padding:14,...cardShadow},
  walletIcon:{fontSize:20},
  walletName:{color:COLORS.muted,fontSize:12,lineHeight:16,fontWeight:'400',marginTop:8},
  walletBalance:{color:COLORS.text,fontSize:16,lineHeight:24,fontWeight:'600',marginTop:3},

  setupGrid:{flexDirection:'row',flexWrap:'wrap',gap:10},
  setupCard:{width:'48%',minHeight:118,backgroundColor:COLORS.surface,borderRadius:12,padding:15,...cardShadow},
  setupIcon:{fontSize:22,marginBottom:12},

  manageRow:{minHeight:62,paddingHorizontal:16,paddingVertical:12,flexDirection:'row',alignItems:'center',justifyContent:'space-between',borderBottomWidth:1,borderBottomColor:COLORS.border},
  manageRight:{alignItems:'flex-end',gap:6},

  referenceLabel:{height:60,flexDirection:'row',alignItems:'flex-end'},
  referenceLabelBlock:{height:60,paddingHorizontal:30,alignItems:'center',justifyContent:'center',backgroundColor:COLORS.accent},
  referenceLabelText:{color:'#FFFFFF',fontSize:24,lineHeight:36,fontWeight:'600'},
  referenceLabelLine:{flex:1,height:4,backgroundColor:COLORS.accent,borderTopRightRadius:100,borderBottomRightRadius:100},
});
export default s;
