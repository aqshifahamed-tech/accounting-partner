import React from 'react';
import { View, Text, StyleSheet, Pressable, Platform } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useColors } from '@/hooks/useColors';
import { useSettings } from '@/contexts/SettingsContext';
import { formatCurrency } from '@/utils/currency';
import { formatDayLabel } from '@/utils/date';
import type { Transaction } from '@/types';
import { getCategoryDef } from '@/constants/categories';

export function TransactionItem({ 
  transaction, 
  onPress 
}: { 
  transaction: Transaction; 
  onPress: (id: string) => void; 
}) {
  const colors = useColors();
  const { settings } = useSettings();
  
  const isIncome = transaction.type === 'income';
  const categoryDef = getCategoryDef(transaction.type, transaction.category);

  return (
    <Pressable
      style={({ pressed }) => [
        styles.container,
        { backgroundColor: colors.card, borderRadius: colors.radius },
        pressed && { opacity: 0.8 },
      ]}
      onPress={() => onPress(transaction.id)}
    >
      <View style={[styles.iconContainer, { backgroundColor: categoryDef.color + '20' }]}>
        <Feather name={categoryDef.icon as any} size={20} color={categoryDef.color} />
      </View>
      
      <View style={styles.details}>
        <Text style={[styles.category, { color: colors.foreground }]} numberOfLines={1}>
          {transaction.category}
        </Text>
        <Text style={[styles.description, { color: colors.mutedForeground }]} numberOfLines={1}>
          {transaction.description || formatDayLabel(transaction.date)}
        </Text>
      </View>
      
      <View style={styles.amountContainer}>
        <Text
          style={[
            styles.amount,
            { color: isIncome ? colors.income : colors.foreground },
          ]}
        >
          {isIncome ? '+' : '-'}{formatCurrency(transaction.amount, settings.currency)}
        </Text>
        {transaction.paymentMethod !== 'Other' && (
          <Text style={[styles.method, { color: colors.mutedForeground }]}>
            {transaction.paymentMethod}
          </Text>
        )}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    marginBottom: 12,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.04,
        shadowRadius: 8,
      },
      android: {
        elevation: 2,
      },
      web: {
        boxShadow: '0px 2px 8px rgba(0,0,0,0.04)',
      }
    }),
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  details: {
    flex: 1,
    marginRight: 16,
  },
  category: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 16,
    marginBottom: 4,
  },
  description: {
    fontFamily: 'Inter_400Regular',
    fontSize: 13,
  },
  amountContainer: {
    alignItems: 'flex-end',
  },
  amount: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 16,
    marginBottom: 4,
  },
  method: {
    fontFamily: 'Inter_500Medium',
    fontSize: 11,
  },
});
