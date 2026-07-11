import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useColors } from '@/hooks/useColors';
import { useTransactions } from '@/contexts/TransactionsContext';
import { getCategories } from '@/constants/categories';
import { PAYMENT_METHODS } from '@/types';
import { todayISO } from '@/utils/date';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { DatePickerModal } from '@/components/DatePickerModal';
import { generateId } from '@/utils/id';

export default function NewTransactionScreen() {
  const colors = useColors();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams();
  const { addTransaction } = useTransactions();

  const [type, setType] = useState<'income' | 'expense'>(
    (params.type as any) === 'expense' ? 'expense' : 'income'
  );
  
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(todayISO());
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<any>('Cash');
  const [notes, setNotes] = useState('');
  
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const categories = getCategories(type);

  // Auto-select first category if none selected or if type changes
  useEffect(() => {
    if (!category || !categories.find(c => c.name === category)) {
      setCategory(categories[0]?.name || '');
    }
  }, [type, categories]);

  const handleSave = async () => {
    const newErrors: Record<string, string> = {};
    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
      newErrors.amount = 'Please enter a valid amount';
    }
    if (!category) {
      newErrors.category = 'Please select a category';
    }
    if (!description.trim()) {
      newErrors.description = 'Please enter a description';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      await addTransaction({
        type,
        amount: Number(amount),
        date,
        category,
        description: description.trim(),
        paymentMethod,
        notes: notes.trim(),
      });
      router.back();
    } catch (e) {
      Alert.alert('Error', 'Failed to save transaction');
    }
  };

  return (
    <KeyboardAvoidingView 
      style={{ flex: 1, backgroundColor: colors.background }} 
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.foreground }]}>New Transaction</Text>
        <Pressable onPress={() => router.back()} style={styles.closeBtn}>
          <Feather name="x" size={24} color={colors.foreground} />
        </Pressable>
      </View>

      <ScrollView 
        style={styles.container}
        contentContainerStyle={{ padding: 20, paddingBottom: insets.bottom + 100 }}
      >
        <View style={[styles.typeSelector, { backgroundColor: colors.card, borderRadius: colors.radius }]}>
          <Pressable 
            style={[styles.typeBtn, type === 'income' && { backgroundColor: colors.income, borderRadius: colors.radius - 4 }]}
            onPress={() => setType('income')}
          >
            <Text style={[styles.typeText, { color: type === 'income' ? '#fff' : colors.mutedForeground }]}>Income</Text>
          </Pressable>
          <Pressable 
            style={[styles.typeBtn, type === 'expense' && { backgroundColor: colors.expense, borderRadius: colors.radius - 4 }]}
            onPress={() => setType('expense')}
          >
            <Text style={[styles.typeText, { color: type === 'expense' ? '#fff' : colors.mutedForeground }]}>Expense</Text>
          </Pressable>
        </View>

        <Input
          label="Amount"
          placeholder="0.00"
          keyboardType="numeric"
          value={amount}
          onChangeText={setAmount}
          error={errors.amount}
          leftIcon={<Feather name="dollar-sign" size={20} color={colors.mutedForeground} />}
          style={{ fontSize: 24, fontFamily: 'Inter_600SemiBold' }}
        />

        <View style={styles.inputGroup}>
          <Text style={[styles.label, { color: colors.foreground }]}>Date</Text>
          <Pressable 
            style={[styles.dateBtn, { backgroundColor: colors.card, borderColor: colors.border, borderRadius: colors.radius }]}
            onPress={() => setShowDatePicker(true)}
          >
            <Feather name="calendar" size={20} color={colors.mutedForeground} />
            <Text style={[styles.dateText, { color: colors.foreground }]}>{date}</Text>
          </Pressable>
        </View>

        <View style={styles.inputGroup}>
          <Text style={[styles.label, { color: colors.foreground }]}>Category</Text>
          {errors.category && <Text style={{ color: colors.destructive, fontSize: 12, marginBottom: 8 }}>{errors.category}</Text>}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipsScroll}>
            {categories.map(c => (
              <Pressable
                key={c.name}
                style={[
                  styles.chip,
                  { backgroundColor: colors.card, borderColor: colors.border },
                  category === c.name && { backgroundColor: c.color + '20', borderColor: c.color }
                ]}
                onPress={() => setCategory(c.name)}
              >
                <Feather name={c.icon as any} size={16} color={category === c.name ? c.color : colors.mutedForeground} style={{ marginRight: 6 }} />
                <Text style={[
                  styles.chipText,
                  { color: category === c.name ? c.color : colors.foreground }
                ]}>
                  {c.name}
                </Text>
              </Pressable>
            ))}
          </ScrollView>
        </View>

        <Input
          label="Description"
          placeholder="What was this for?"
          value={description}
          onChangeText={setDescription}
          error={errors.description}
        />

        <View style={styles.inputGroup}>
          <Text style={[styles.label, { color: colors.foreground }]}>Payment Method</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipsScroll}>
            {PAYMENT_METHODS.map(m => (
              <Pressable
                key={m}
                style={[
                  styles.chip,
                  { backgroundColor: colors.card, borderColor: colors.border },
                  paymentMethod === m && { backgroundColor: colors.primary, borderColor: colors.primary }
                ]}
                onPress={() => setPaymentMethod(m as any)}
              >
                <Text style={[
                  styles.chipText,
                  { color: paymentMethod === m ? colors.primaryForeground : colors.foreground }
                ]}>
                  {m}
                </Text>
              </Pressable>
            ))}
          </ScrollView>
        </View>

        <Input
          label="Notes (Optional)"
          placeholder="Add any extra details..."
          value={notes}
          onChangeText={setNotes}
          multiline
          numberOfLines={3}
          style={{ height: 80, textAlignVertical: 'top' }}
        />
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: insets.bottom + 20, backgroundColor: colors.background, borderTopColor: colors.border }]}>
        <Button 
          title="Save Transaction" 
          onPress={handleSave} 
          size="lg"
          style={{ backgroundColor: type === 'income' ? colors.income : colors.expense }}
          textStyle={{ color: '#fff' }}
        />
      </View>

      <DatePickerModal 
        visible={showDatePicker}
        onClose={() => setShowDatePicker(false)}
        date={date}
        onSelect={(d) => {
          setDate(d);
          setShowDatePicker(false);
        }}
      />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
  },
  title: {
    fontFamily: 'Inter_700Bold',
    fontSize: 20,
  },
  closeBtn: {
    padding: 4,
  },
  container: {
    flex: 1,
  },
  typeSelector: {
    flexDirection: 'row',
    padding: 4,
    marginBottom: 24,
  },
  typeBtn: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  typeText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 15,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontFamily: 'Inter_500Medium',
    fontSize: 13,
    marginBottom: 8,
    marginLeft: 4,
  },
  dateBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderWidth: 1,
  },
  dateText: {
    fontFamily: 'Inter_400Regular',
    fontSize: 16,
    marginLeft: 12,
  },
  chipsScroll: {
    flexDirection: 'row',
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    marginRight: 8,
  },
  chipText: {
    fontFamily: 'Inter_500Medium',
    fontSize: 14,
  },
  footer: {
    paddingHorizontal: 20,
    paddingTop: 16,
    borderTopWidth: 1,
  },
});
