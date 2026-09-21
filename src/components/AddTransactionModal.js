import React, { useEffect, useMemo, useState } from 'react';
import {
  Alert, KeyboardAvoidingView, Modal, Platform, Pressable, ScrollView,
  StyleSheet, Text, TextInput, View,
} from 'react-native';
import { COLORS, categoryPairs } from '../constants';
const { isValidIsoDate, normalizeAmount } = require('../domain/finance');

function pad2(value) { return String(value).padStart(2, '0'); }
function todayIso() {
  const date = new Date();
  return `${date.getFullYear()}-${pad2(date.getMonth() + 1)}-${pad2(date.getDate())}`;
}

export default function AddTransactionModal({
  visible, onClose, onSave, initialTransaction, wallets = [], customCategories,
}) {
  const [type, setType] = useState('expense');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('Food');
  const [walletId, setWalletId] = useState('cash');
  const [note, setNote] = useState('');
  const [date, setDate] = useState(todayIso());
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!visible) return;
    const tx = initialTransaction;
    const nextType = tx?.type || 'expense';
    setType(nextType);
    setAmount(tx ? String(tx.amount) : '');
    setCategory(tx?.category || (nextType === 'expense' ? 'Food' : 'Salary'));
    setWalletId(tx?.walletId || wallets[0]?.id || 'cash');
    setNote(tx?.note || '');
    setDate(tx?.date || todayIso());
    setSaving(false);
  }, [visible, initialTransaction, wallets]);

  const categories = useMemo(() => categoryPairs(type, customCategories), [type, customCategories]);

  function switchType(next) {
    setType(next);
    setCategory(next === 'expense' ? 'Food' : 'Salary');
  }

  async function submit() {
    const normalized = normalizeAmount(amount);
    if (!normalized) return Alert.alert('Enter an amount', 'Use a number greater than zero.');
    if (!isValidIsoDate(date)) return Alert.alert('Check the date', 'Use a real date in YYYY-MM-DD format.');
    if (!walletId) return Alert.alert('Choose a wallet', 'Select where this money moved.');
    setSaving(true);
    const now = new Date().toISOString();
    await onSave({
      id: initialTransaction?.id || `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      type,
      amount: normalized,
      category,
      note: note.trim(),
      date,
      walletId,
      createdAt: initialTransaction?.createdAt || now,
      updatedAt: initialTransaction ? now : undefined,
      recurringId: initialTransaction?.recurringId,
    });
  }

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <KeyboardAvoidingView style={s.root} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <Pressable style={s.backdrop} onPress={onClose} />
        <View style={s.sheet}>
          <View style={s.handle} />
          <View style={s.header}>
            <View>
              <Text style={s.title}>{initialTransaction ? 'Edit transaction' : 'Add transaction'}</Text>
              <Text style={s.muted}>{initialTransaction ? 'Correct the details and save.' : 'Takes only a few seconds.'}</Text>
            </View>
            <Pressable onPress={onClose} hitSlop={12} accessibilityRole="button" accessibilityLabel="Close transaction form"><Text style={s.close}>×</Text></Pressable>
          </View>
          <View style={s.segmented}>
            {['expense', 'income'].map((key) => (
              <Pressable key={key} style={[s.segment, type === key && s.segmentActive]} onPress={() => switchType(key)} accessibilityRole="button" accessibilityState={{ selected: type === key }}>
                <Text style={[s.segmentText, type === key && s.segmentTextActive]}>{key === 'expense' ? 'Expense' : 'Income'}</Text>
              </Pressable>
            ))}
          </View>
          <Text style={s.label}>Amount</Text>
          <View style={s.amountWrap}><Text style={s.prefix}>Rs</Text><TextInput value={amount} onChangeText={setAmount} keyboardType="decimal-pad" placeholder="0" placeholderTextColor={COLORS.muted} style={s.amount} /></View>
          <Text style={s.label}>Category</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.chipRow}>
            {categories.map(([name, emoji]) => (
              <Pressable key={name} onPress={() => setCategory(name)} style={[s.chip, category === name && s.chipSelected]} accessibilityRole="button" accessibilityState={{ selected: category === name }}>
                <Text>{emoji}</Text><Text style={[s.chipText, category === name && s.chipTextSelected]}>{name}</Text>
              </Pressable>
            ))}
          </ScrollView>
          <Text style={s.label}>Wallet</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.chipRow}>
            {wallets.map((wallet) => (
              <Pressable key={wallet.id} onPress={() => setWalletId(wallet.id)} style={[s.chip, walletId === wallet.id && s.chipSelected]} accessibilityRole="button" accessibilityState={{ selected: walletId === wallet.id }}>
                <Text>{wallet.icon || '👛'}</Text><Text style={[s.chipText, walletId === wallet.id && s.chipTextSelected]}>{wallet.name}</Text>
              </Pressable>
            ))}
          </ScrollView>
          <View style={s.twoCol}>
            <View style={s.flex}><Text style={s.label}>Note</Text><TextInput value={note} onChangeText={setNote} placeholder="Lunch, taxi…" placeholderTextColor={COLORS.muted} style={s.input} /></View>
            <View style={s.flex}><Text style={s.label}>Date</Text><TextInput value={date} onChangeText={setDate} placeholder="YYYY-MM-DD" placeholderTextColor={COLORS.muted} style={s.input} /></View>
          </View>
          <Pressable style={[s.primary, saving && s.disabled]} onPress={submit} disabled={saving} accessibilityRole="button">
            <Text style={s.primaryText}>{saving ? 'Saving…' : initialTransaction ? 'Save changes' : `Save ${type}`}</Text>
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const s = StyleSheet.create({
  root:{flex:1,justifyContent:'flex-end'},backdrop:{...StyleSheet.absoluteFillObject,backgroundColor:'rgba(0,0,0,.58)'},sheet:{backgroundColor:'#10161E',borderTopLeftRadius:28,borderTopRightRadius:28,borderWidth:1,borderColor:COLORS.border,paddingHorizontal:20,paddingTop:10,paddingBottom:Platform.OS==='ios'?30:22,maxHeight:'92%'},
  handle:{width:42,height:4,borderRadius:99,backgroundColor:COLORS.border,alignSelf:'center',marginBottom:14},header:{flexDirection:'row',justifyContent:'space-between'},title:{color:COLORS.text,fontSize:22,fontWeight:'900'},muted:{color:COLORS.muted,fontSize:13,marginTop:4},close:{color:COLORS.muted,fontSize:30,lineHeight:30},
  segmented:{flexDirection:'row',backgroundColor:COLORS.surface,padding:4,borderRadius:14,marginTop:18},segment:{flex:1,height:42,alignItems:'center',justifyContent:'center',borderRadius:11},segmentActive:{backgroundColor:COLORS.surface2},segmentText:{color:COLORS.muted,fontWeight:'700'},segmentTextActive:{color:COLORS.text},
  label:{color:COLORS.text,fontSize:12,fontWeight:'700',marginBottom:7,marginTop:12},amountWrap:{height:66,borderRadius:17,borderWidth:1,borderColor:COLORS.border,backgroundColor:COLORS.surface,flexDirection:'row',alignItems:'center',paddingHorizontal:14},prefix:{color:COLORS.accent,fontSize:20,fontWeight:'800',marginRight:8},amount:{flex:1,color:COLORS.text,fontSize:28,fontWeight:'800'},
  chipRow:{paddingRight:16},chip:{height:42,paddingHorizontal:13,borderRadius:13,borderWidth:1,borderColor:COLORS.border,backgroundColor:COLORS.surface,flexDirection:'row',gap:7,alignItems:'center',marginRight:8},chipSelected:{backgroundColor:COLORS.accentSoft,borderColor:COLORS.accent},chipText:{color:COLORS.muted,fontSize:12,fontWeight:'700'},chipTextSelected:{color:COLORS.text},
  twoCol:{flexDirection:'row',gap:10},flex:{flex:1},input:{height:48,borderRadius:14,borderWidth:1,borderColor:COLORS.border,backgroundColor:COLORS.surface2,color:COLORS.text,paddingHorizontal:12,fontSize:14},primary:{height:52,borderRadius:15,marginTop:18,backgroundColor:COLORS.accent,alignItems:'center',justifyContent:'center'},primaryText:{color:'#07130F',fontSize:15,fontWeight:'900'},disabled:{opacity:.6},
});
