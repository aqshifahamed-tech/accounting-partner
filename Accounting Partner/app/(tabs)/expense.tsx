import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, FlatList, Pressable } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useColors } from '@/hooks/useColors';
import { useSettings } from '@/contexts/SettingsContext';
import { useTransactions } from '@/contexts/TransactionsContext';
import { filterTransactions } from '@/hooks/useAnalytics';
import { TransactionItem } from '@/components/TransactionItem';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import type { FilterPreset, TransactionFilter } from '@/types';

const PRESETS: { label: string; value: FilterPreset }[] = [
  { label: 'All', value: 'all' },
  { label: 'Today', value: 'today' },
  { label: 'This Week', value: 'thisWeek' },
  { label: 'This Month', value: 'thisMonth' },
  { label: 'This Year', value: 'thisYear' },
];

export default function ExpenseScreen() {
  const colors = useColors();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { t } = useSettings();
  const { transactions } = useTransactions();
  
  const [search, setSearch] = useState('');
  const [preset, setPreset] = useState<FilterPreset>('all');
  const [showFilters, setShowFilters] = useState(false);

  const filteredData = useMemo(() => {
    const filter: TransactionFilter = {
      preset,
      query: search,
    };
    return filterTransactions(transactions, filter, 'expense');
  }, [transactions, search, preset]);

  return (
    <View style={[styles.container, { backgroundColor: colors.background, paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.foreground }]}>{t('expense')}</Text>
        <Button 
          title=""
          variant="destructive"
          icon={<Feather name="plus" size={24} color={colors.primaryForeground} style={{ marginRight: -8 }} />}
          onPress={() => router.push('/transaction/new?type=expense')}
          style={{ width: 44, height: 44, borderRadius: 22, paddingHorizontal: 0, paddingVertical: 0 }}
        />
      </View>

      <View style={styles.searchContainer}>
        <Input 
          placeholder={t('search')}
          value={search}
          onChangeText={setSearch}
          leftIcon={<Feather name="search" size={20} color={colors.mutedForeground} />}
          style={{ flex: 1, marginBottom: 0 }}
        />
        <Pressable 
          style={[styles.filterBtn, { backgroundColor: showFilters ? colors.destructive + '20' : colors.card, borderRadius: colors.radius }]}
          onPress={() => setShowFilters(!showFilters)}
        >
          <Feather name="filter" size={20} color={showFilters ? colors.destructive : colors.foreground} />
        </Pressable>
      </View>

      {showFilters && (
        <View style={styles.filtersWrapper}>
          <FlatList
            horizontal
            showsHorizontalScrollIndicator={false}
            data={PRESETS}
            contentContainerStyle={styles.presetsList}
            keyExtractor={item => item.value}
            renderItem={({ item }) => {
              const isActive = preset === item.value;
              return (
                <Pressable
                  style={[
                    styles.presetPill,
                    { 
                      backgroundColor: isActive ? colors.destructive : colors.card,
                      borderColor: isActive ? colors.destructive : colors.border
                    }
                  ]}
                  onPress={() => setPreset(item.value)}
                >
                  <Text style={[
                    styles.presetText, 
                    { color: isActive ? colors.destructiveForeground : colors.foreground }
                  ]}>
                    {item.label}
                  </Text>
                </Pressable>
              );
            }}
          />
        </View>
      )}

      <FlatList
        data={filteredData}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <TransactionItem 
            transaction={item} 
            onPress={(id) => router.push(`/transaction/${id}`)} 
          />
        )}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Feather name="arrow-up-circle" size={48} color={colors.mutedForeground} style={{ marginBottom: 16 }} />
            <Text style={[styles.emptyTitle, { color: colors.foreground }]}>No expenses found</Text>
            <Text style={[styles.emptyDesc, { color: colors.mutedForeground }]}>
              {search || preset !== 'all' ? 'Try adjusting your search or filters.' : 'Add your first expense record.'}
            </Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  title: {
    fontFamily: 'Inter_700Bold',
    fontSize: 28,
  },
  searchContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 12,
    marginBottom: 16,
  },
  filterBtn: {
    width: 52,
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  filtersWrapper: {
    marginBottom: 16,
  },
  presetsList: {
    paddingHorizontal: 20,
    gap: 8,
  },
  presetPill: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  presetText: {
    fontFamily: 'Inter_500Medium',
    fontSize: 13,
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  emptyState: {
    paddingTop: 60,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyTitle: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 18,
    marginBottom: 8,
  },
  emptyDesc: {
    fontFamily: 'Inter_400Regular',
    fontSize: 15,
    textAlign: 'center',
  },
});
