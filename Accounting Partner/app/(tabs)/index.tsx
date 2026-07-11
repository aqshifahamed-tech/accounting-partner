import React, { useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, Platform, Dimensions } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useColors } from '@/hooks/useColors';
import { useSettings } from '@/contexts/SettingsContext';
import { useTransactions } from '@/contexts/TransactionsContext';
import { useDashboardSummary, useHighestStats } from '@/hooks/useAnalytics';
import { formatCurrency, formatCurrencyCompact } from '@/utils/currency';
import { TransactionItem } from '@/components/TransactionItem';
import { Button } from '@/components/ui/Button';

export default function DashboardScreen() {
  const colors = useColors();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { settings, t } = useSettings();
  const { transactions } = useTransactions();
  
  const summary = useDashboardSummary(transactions);
  const highestIncome = useHighestStats(transactions, 'income');
  const highestExpense = useHighestStats(transactions, 'expense');

  const recentTransactions = useMemo(() => {
    return transactions.slice(0, 5);
  }, [transactions]);

  const BalanceCard = () => (
    <LinearGradient
      colors={[colors.gradientStart, colors.gradientEnd]}
      style={[styles.balanceCard, { borderRadius: colors.radius }]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      <View style={styles.balanceHeader}>
        <Text style={styles.balanceLabel}>{t('balance')}</Text>
        <Feather name="shield" size={16} color="rgba(255,255,255,0.7)" />
      </View>
      <Text style={styles.balanceValue}>
        {formatCurrency(summary.balance, settings.currency)}
      </Text>
      
      <View style={styles.balanceStatsRow}>
        <View style={styles.balanceStat}>
          <View style={styles.balanceStatIconRow}>
            <Feather name="arrow-down-circle" size={14} color="#4ADE80" />
            <Text style={styles.balanceStatLabel}>{t('totalIncome')}</Text>
          </View>
          <Text style={styles.balanceStatValue}>
            {formatCurrencyCompact(summary.totalIncome, settings.currency)}
          </Text>
        </View>
        
        <View style={styles.balanceStatDivider} />
        
        <View style={styles.balanceStat}>
          <View style={styles.balanceStatIconRow}>
            <Feather name="arrow-up-circle" size={14} color="#FF6B6B" />
            <Text style={styles.balanceStatLabel}>{t('totalExpense')}</Text>
          </View>
          <Text style={styles.balanceStatValue}>
            {formatCurrencyCompact(summary.totalExpense, settings.currency)}
          </Text>
        </View>
      </View>
    </LinearGradient>
  );

  const SummaryGrid = () => (
    <View style={styles.summaryGrid}>
      <View style={[styles.summaryCard, { backgroundColor: colors.card, borderRadius: colors.radius }]}>
        <Text style={[styles.summaryCardLabel, { color: colors.mutedForeground }]}>{t('today')}</Text>
        <View style={styles.summaryCardRow}>
          <Feather name="arrow-down" size={12} color={colors.income} />
          <Text style={[styles.summaryCardIncome, { color: colors.income }]}>
            {formatCurrencyCompact(summary.todayIncome, settings.currency)}
          </Text>
        </View>
        <View style={styles.summaryCardRow}>
          <Feather name="arrow-up" size={12} color={colors.expense} />
          <Text style={[styles.summaryCardExpense, { color: colors.expense }]}>
            {formatCurrencyCompact(summary.todayExpense, settings.currency)}
          </Text>
        </View>
      </View>
      
      <View style={[styles.summaryCard, { backgroundColor: colors.card, borderRadius: colors.radius }]}>
        <Text style={[styles.summaryCardLabel, { color: colors.mutedForeground }]}>{t('thisMonth')}</Text>
        <View style={styles.summaryCardRow}>
          <Feather name="arrow-down" size={12} color={colors.income} />
          <Text style={[styles.summaryCardIncome, { color: colors.income }]}>
            {formatCurrencyCompact(summary.monthIncome, settings.currency)}
          </Text>
        </View>
        <View style={styles.summaryCardRow}>
          <Feather name="arrow-up" size={12} color={colors.expense} />
          <Text style={[styles.summaryCardExpense, { color: colors.expense }]}>
            {formatCurrencyCompact(summary.monthExpense, settings.currency)}
          </Text>
        </View>
      </View>

      <View style={[styles.summaryCard, { backgroundColor: colors.card, borderRadius: colors.radius }]}>
        <Text style={[styles.summaryCardLabel, { color: colors.mutedForeground }]}>{t('thisYear')}</Text>
        <View style={styles.summaryCardRow}>
          <Feather name="arrow-down" size={12} color={colors.income} />
          <Text style={[styles.summaryCardIncome, { color: colors.income }]}>
            {formatCurrencyCompact(summary.yearIncome, settings.currency)}
          </Text>
        </View>
        <View style={styles.summaryCardRow}>
          <Feather name="arrow-up" size={12} color={colors.expense} />
          <Text style={[styles.summaryCardExpense, { color: colors.expense }]}>
            {formatCurrencyCompact(summary.yearExpense, settings.currency)}
          </Text>
        </View>
      </View>
    </View>
  );

  const TeaserCards = () => (
    <View style={styles.teaserRow}>
      {highestIncome.highestCategory && (
        <View style={[styles.teaserCard, { backgroundColor: colors.card, borderRadius: colors.radius }]}>
          <View style={[styles.teaserIcon, { backgroundColor: colors.income + '20' }]}>
            <Feather name="trending-up" size={18} color={colors.income} />
          </View>
          <Text style={[styles.teaserLabel, { color: colors.mutedForeground }]}>Top Income</Text>
          <Text style={[styles.teaserValue, { color: colors.foreground }]} numberOfLines={1}>
            {highestIncome.highestCategory.category}
          </Text>
          <Text style={[styles.teaserAmount, { color: colors.income }]}>
            {formatCurrencyCompact(highestIncome.highestCategory.total, settings.currency)}
          </Text>
        </View>
      )}
      
      {highestExpense.highestCategory && (
        <View style={[styles.teaserCard, { backgroundColor: colors.card, borderRadius: colors.radius }]}>
          <View style={[styles.teaserIcon, { backgroundColor: colors.expense + '20' }]}>
            <Feather name="trending-down" size={18} color={colors.expense} />
          </View>
          <Text style={[styles.teaserLabel, { color: colors.mutedForeground }]}>Top Expense</Text>
          <Text style={[styles.teaserValue, { color: colors.foreground }]} numberOfLines={1}>
            {highestExpense.highestCategory.category}
          </Text>
          <Text style={[styles.teaserAmount, { color: colors.expense }]}>
            {formatCurrencyCompact(highestExpense.highestCategory.total, settings.currency)}
          </Text>
        </View>
      )}
    </View>
  );

  return (
    <ScrollView 
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={{ paddingTop: insets.top + 16, paddingBottom: 100 }}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.header}>
        <Text style={[styles.greeting, { color: colors.foreground }]}>Dashboard</Text>
        <Feather name="bell" size={24} color={colors.foreground} />
      </View>

      <View style={styles.content}>
        <BalanceCard />
        
        <View style={styles.quickActions}>
          <Button 
            title={t('addIncome')}
            onPress={() => router.push('/transaction/new?type=income')}
            style={styles.actionBtn}
            icon={<Feather name="arrow-down-circle" size={18} color="#fff" />}
            size="sm"
          />
          <Button 
            title={t('addExpense')}
            variant="destructive"
            onPress={() => router.push('/transaction/new?type=expense')}
            style={styles.actionBtn}
            icon={<Feather name="arrow-up-circle" size={18} color="#fff" />}
            size="sm"
          />
        </View>

        <SummaryGrid />
        
        <TeaserCards />

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Recent Transactions</Text>
            <Button 
              title={t('reports')} 
              variant="ghost" 
              size="sm"
              onPress={() => router.push('/report')}
            />
          </View>
          
          {recentTransactions.length > 0 ? (
            recentTransactions.map(t => (
              <TransactionItem 
                key={t.id} 
                transaction={t} 
                onPress={(id) => router.push(`/transaction/${id}`)} 
              />
            ))
          ) : (
            <View style={[styles.emptyState, { backgroundColor: colors.card, borderRadius: colors.radius }]}>
              <Feather name="inbox" size={32} color={colors.mutedForeground} style={{ marginBottom: 12 }} />
              <Text style={[styles.emptyStateTitle, { color: colors.foreground }]}>No transactions yet</Text>
              <Text style={[styles.emptyStateDesc, { color: colors.mutedForeground }]}>
                Add your first income or expense to get started.
              </Text>
            </View>
          )}
        </View>
      </View>
    </ScrollView>
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
    marginBottom: 20,
  },
  greeting: {
    fontFamily: 'Inter_700Bold',
    fontSize: 28,
  },
  content: {
    paddingHorizontal: 20,
  },
  balanceCard: {
    padding: 24,
    marginBottom: 20,
    ...Platform.select({
      ios: {
        shadowColor: '#1E4FD8',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.3,
        shadowRadius: 16,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  balanceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  balanceLabel: {
    fontFamily: 'Inter_500Medium',
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
  },
  balanceValue: {
    fontFamily: 'Inter_700Bold',
    fontSize: 36,
    color: '#FFFFFF',
    marginBottom: 24,
  },
  balanceStatsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.15)',
    padding: 16,
    borderRadius: 16,
  },
  balanceStat: {
    flex: 1,
  },
  balanceStatIconRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  balanceStatLabel: {
    fontFamily: 'Inter_500Medium',
    fontSize: 12,
    color: 'rgba(255,255,255,0.7)',
    marginLeft: 6,
  },
  balanceStatValue: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 16,
    color: '#FFFFFF',
  },
  balanceStatDivider: {
    width: 1,
    height: '100%',
    backgroundColor: 'rgba(255,255,255,0.2)',
    marginHorizontal: 16,
  },
  quickActions: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  actionBtn: {
    flex: 1,
  },
  summaryGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  summaryCard: {
    flex: 1,
    padding: 12,
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8 },
      android: { elevation: 2 },
    }),
  },
  summaryCardLabel: {
    fontFamily: 'Inter_500Medium',
    fontSize: 11,
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  summaryCardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  summaryCardIncome: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 14,
    marginLeft: 4,
  },
  summaryCardExpense: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 14,
    marginLeft: 4,
  },
  teaserRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 32,
  },
  teaserCard: {
    flex: 1,
    padding: 16,
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8 },
      android: { elevation: 2 },
    }),
  },
  teaserIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  teaserLabel: {
    fontFamily: 'Inter_500Medium',
    fontSize: 12,
    marginBottom: 4,
  },
  teaserValue: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 14,
    marginBottom: 2,
  },
  teaserAmount: {
    fontFamily: 'Inter_700Bold',
    fontSize: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 18,
  },
  emptyState: {
    padding: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyStateTitle: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 16,
    marginBottom: 8,
  },
  emptyStateDesc: {
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    textAlign: 'center',
  },
});
