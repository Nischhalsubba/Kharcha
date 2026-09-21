import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { categoryLabel, t } from '../i18n';
import s from '../appStyles';
import { Section } from './AppPrimitives';

export default function SmartInsights({ settings, money, comparison, savings, forecast, unusual = [], suggestions = [], onAddSuggestion }) {
  const lang=settings.language||'en';
  const comparisonValue=comparison?.changeRate==null?'—':`${comparison.changeRate>=0?'+':''}${Math.round(comparison.changeRate*100)}%`;
  const comparisonCopy=comparison
    ? `${money(comparison.currentExpense)} · ${t(lang,'previousMonth','previous')} ${money(comparison.previousExpense)}`
    : '—';
  const savingsValue=savings?.rate==null?'—':`${Math.round(savings.rate*100)}%`;

  return <View>
    <Section title={t(lang,'smartInsights','Smart insights')}/>
    <View style={s.insightRow}>
      <View style={s.insight}>
        <Text style={s.kicker}>{t(lang,'vsLastMonth','VS LAST MONTH').toUpperCase()}</Text>
        <Text style={s.insightBig}>{comparisonValue}</Text>
        <Text style={s.meta}>{comparisonCopy}</Text>
      </View>
      <View style={s.insight}>
        <Text style={s.kicker}>{t(lang,'savingsRate','SAVINGS RATE').toUpperCase()}</Text>
        <Text style={s.insightBig}>{savingsValue}</Text>
        <Text style={s.meta}>{savings?money(savings.saved):'—'} {t(lang,'retained','retained')}</Text>
      </View>
    </View>
    <View style={s.form}>
      <Text style={s.kicker}>{t(lang,'monthEndForecast','MONTH-END FORECAST').toUpperCase()}</Text>
      <Text style={s.cardTitle}>{forecast?money(forecast.projectedExpense):'—'}</Text>
      <Text style={[s.meta,{marginTop:8}]}>{forecast?`${money(forecast.spentToDate)} ${t(lang,'throughDay','through day')} ${forecast.elapsedDays} / ${forecast.daysInMonth}`:t(lang,'notEnoughData','Not enough data yet.')}</Text>
    </View>

    {unusual.length?<><Section title={t(lang,'unusualSpending','Unusual spending')}/><View style={s.list}>{unusual.slice(0,4).map((item)=><View key={item.category} style={s.manageRow}><View style={{flex:1}}><Text style={s.rowTitle}>{categoryLabel(item.category,lang)}</Text><Text style={s.meta}>{item.ratio.toFixed(1)}× {t(lang,'recentAverage','recent average')} · +{money(item.excess)}</Text></View><Text style={s.danger}>{money(item.currentAmount)}</Text></View>)}</View></>:null}

    {suggestions.length?<><Section title={t(lang,'recurringSuggestions','Recurring suggestions')}/><View style={s.list}>{suggestions.slice(0,4).map((item)=><View key={item.key} style={s.manageRow}><View style={{flex:1}}><Text style={s.rowTitle}>{item.note||categoryLabel(item.category,lang)}</Text><Text style={s.meta}>{money(item.amount)} · {item.frequency} · {item.occurrences}× · {t(lang,'next','next')} {item.nextDate}</Text></View><Pressable onPress={()=>onAddSuggestion(item)} hitSlop={8}><Text style={s.action}>{t(lang,'makeRecurring','Make recurring')}</Text></Pressable></View>)}</View></>:null}
  </View>;
}
