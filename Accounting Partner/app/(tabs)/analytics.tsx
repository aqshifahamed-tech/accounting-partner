import React, { useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, Dimensions, Platform } from 'react-native';
import { PieChart, BarChart, LineChart } from 'react-native-chart-kit';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { useColors } from '@/hooks/useColors';
import { useSettings } from '@/contexts/SettingsContext';
import { useTransactions } from '@/contexts/TransactionsContext';
import { getCategoryBreakdown, useHighestStats, useYearlySeries } from '@/hooks/useAnalytics';
import { formatCurrencyCompact, formatCurrency } from '@/utils/currency';

const { width } = Dimensions.get('window');
const CHART_WIDTH = width - 40;

export default function AnalyticsScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { t, settings } = useSettings();
  const { transactions } = useTransactions();

  const currentYear = new Date().getFullYear();
  const yearlySeries = useYearlySeries(transactions, currentYear);
  const incomeBreakdown = getCategoryBreakdown(transactions, 'income');
  const expenseBreakdown = getCategoryBreakdown(transactions, 'expense');
  const highestIncome = useHighestStats(transactions, 'income');
  const highestExpense = useHighestStats(transactions, 'expense');

  const chartConfig = useMemo(() => ({
    backgroundGradientFrom: colors.card,
    backgroundGradientTo: colors.card,
    color: (opacity = 1) => `rgba(${colors.isDark ? '255,255,255' : '11,30,61'}, ${opacity})`,
    labelColor: (opacity = 1) => colors.mutedForeground,
    strokeWidth: 2,
    barPercentage: 0.5,
    useShadowColorFromDataset: false,
    decimalPlaces: 0,
    propsForLabels: {
      fontFamily: 'Inter_400Regular',
      fontSize: 10,
    }
  }), [colors]);

  const barChartData = useMemo(() => {
    // Filter to months that have past or present data (don't show future empty months if we want a cleaner chart)
    // For now, let's show all 12 months for consistent layout
    return {
      labels: yearlySeries.map(p => p.label),
      datasets: [
        { data: yearlySeries.map(p => p.income), color: () => colors.income },
        { data: yearlySeries.map(p => p.expense), color: () => colors.expense }
      ]
    };
  }, [yearlySeries, colors]);

  const lineChartData = useMemo(() => {
    return {
      labels: yearlySeries.map(p => p.label),
      datasets: [
        {
          data: yearlySeries.map(p => p.balance),
          color: (opacity = 1) => `rgba(30, 79, 216, ${opacity})`, // primary
          strokeWidth: 3,
        }
      ],
    };
  }, [yearlySeries]);

  const renderEmptyState = (message: string) => (
    <View style={[styles.emptyCard, { backgroundColor: colors.card, borderRadius: colors.radius }]}>
      <Feather name="pie-chart" size={32} color={colors.mutedForeground} style={{ marginBottom: 12 }} />
      <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>{message}</Text>
    </View>
  );

  const StatCard = ({ title, label, value, icon, iconColor }: { title: string, label: string, value: string, icon: string, iconColor: string }) => (
    <View style={[styles.statCard, { backgroundColor: colors.card, borderRadius: colors.radius }]}>
      <View style={[styles.statIcon, { backgroundColor: iconColor + '20' }]}>
        <Feather name={icon as any} size={18} color={iconColor} />
      </View>
      <View style={styles.statContent}>
        <Text style={[styles.statTitle, { color: colors.mutedForeground }]}>{title}</Text>
        <Text style={[styles.statLabel, { color: colors.foreground }]} numberOfLines={1}>{label}</Text>
        <Text style={[styles.statValue, { color: iconColor }]}>{value}</Text>
      </View>
    </View>
  );

  return (
    <ScrollView 
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={{ paddingTop: insets.top + 16, paddingBottom: 100 }}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.foreground }]}>{t('analytics')}</Text>
      </View>

      <View style={styles.content}>
        <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Income vs Expense ({currentYear})</Text>
        {transactions.length > 0 ? (
          <View style={[styles.chartCard, { backgroundColor: colors.card, borderRadius: colors.radius }]}>
            <BarChart
              data={barChartData}
              width={CHART_WIDTH - 32}
              height={220}
              yAxisLabel={settings.currency === 'INR' ? '₹' : '$'}
              yAxisSuffix=""
              chartConfig={chartConfig}
              verticalLabelRotation={0}
              showValuesOnTopOfBars={false}
              fromZero
              style={styles.chart}
            />
            <View style={styles.legendRow}>
              <View style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: colors.income }]} />
                <Text style={[styles.legendText, { color: colors.foreground }]}>Income</Text>
              </View>
              <View style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: colors.expense }]} />
                <Text style={[styles.legendText, { color: colors.foreground }]}>Expense</Text>
              </View>
            </View>
          </View>
        ) : renderEmptyState('Add transactions to see yearly trends.')}

        <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Balance Trend</Text>
        {transactions.length > 0 ? (
          <View style={[styles.chartCard, { backgroundColor: colors.card, borderRadius: colors.radius }]}>
            <LineChart
              data={lineChartData}
              width={CHART_WIDTH - 32}
              height={220}
              yAxisLabel={settings.currency === 'INR' ? '₹' : '$'}
              yAxisSuffix=""
              chartConfig={{
                ...chartConfig,
                color: (opacity = 1) => `rgba(30, 79, 216, ${opacity})`,
                labelColor: (opacity = 1) => colors.mutedForeground,
              }}
              bezier
              style={styles.chart}
            />
          </View>
        ) : renderEmptyState('Add transactions to see balance trends.')}

        <View style={styles.row}>
          <View style={styles.col}>
            <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Income by Category</Text>
            {incomeBreakdown.length > 0 ? (
              <View style={[styles.pieCard, { backgroundColor: colors.card, borderRadius: colors.radius }]}>
                <PieChart
                  data={incomeBreakdown.map(b => ({
                    name: b.category,
                    population: b.total,
                    color: b.color,
                    legendFontColor: colors.foreground,
                    legendFontSize: 11
                  }))}
                  width={CHART_WIDTH / 2 - 16}
                  height={140}
                  chartConfig={chartConfig}
                  accessor={"population"}
                  backgroundColor={"transparent"}
                  paddingLeft={"0"}
                  hasLegend={false}
                  absolute
                />
                <View style={styles.pieLegend}>
                  {incomeBreakdown.slice(0, 4).map(b => (
                    <View key={b.category} style={styles.pieLegendItem}>
                      <View style={[styles.pieLegendDot, { backgroundColor: b.color }]} />
                      <Text style={[styles.pieLegendText, { color: colors.foreground }]} numberOfLines={1}>
                        {b.category}
                      </Text>
                    </View>
                  ))}
                </View>
              </View>
            ) : renderEmptyState('No income.')}
          </View>

          <View style={styles.col}>
            <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Expense by Category</Text>
            {expenseBreakdown.length > 0 ? (
              <View style={[styles.pieCard, { backgroundColor: colors.card, borderRadius: colors.radius }]}>
                <PieChart
                  data={expenseBreakdown.map(b => ({
                    name: b.category,
                    population: b.total,
                    color: b.color,
                    legendFontColor: colors.foreground,
                    legendFontSize: 11
                  }))}
                  width={CHART_WIDTH / 2 - 16}
                  height={140}
                  chartConfig={chartConfig}
                  accessor={"population"}
                  backgroundColor={"transparent"}
                  paddingLeft={"0"}
                  hasLegend={false}
                  absolute
                />
                <View style={styles.pieLegend}>
                  {expenseBreakdown.slice(0, 4).map(b => (
                    <View key={b.category} style={styles.pieLegendItem}>
                      <View style={[styles.pieLegendDot, { backgroundColor: b.color }]} />
                      <Text style={[styles.pieLegendText, { color: colors.foreground }]} numberOfLines={1}>
                        {b.category}
                      </Text>
                    </View>
                  ))}
                </View>
              </View>
            ) : renderEmptyState('No expense.')}
          </View>
        </View>

        <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Highest Income Sources</Text>
        <View style={styles.statsGrid}>
          {highestIncome.highestCategory ? (
            <StatCard 
              title="Top Category" 
              label={highestIncome.highestCategory.category} 
              value={formatCurrencyCompact(highestIncome.highestCategory.total, settings.currency)}
              icon="pie-chart"
              iconColor={colors.income}
            />
          ) : null}
          {highestIncome.largestTransaction ? (
            <StatCard 
              title="Largest Transaction" 
              label={highestIncome.largestTransaction.description || highestIncome.largestTransaction.category} 
              value={formatCurrencyCompact(highestIncome.largestTransaction.amount, settings.currency)}
              icon="award"
              iconColor={colors.income}
            />
          ) : null}
        </View>

        <Text style={[styles.sectionTitle, { color: colors.foreground, marginTop: 16 }]}>Highest Expense Sources</Text>
        <View style={styles.statsGrid}>
          {highestExpense.highestCategory ? (
            <StatCard 
              title="Top Category" 
              label={highestExpense.highestCategory.category} 
              value={formatCurrencyCompact(highestExpense.highestCategory.total, settings.currency)}
              icon="pie-chart"
              iconColor={colors.expense}
            />
          ) : null}
          {highestExpense.largestTransaction ? (
            <StatCard 
              title="Largest Transaction" 
              label={highestExpense.largestTransaction.description || highestExpense.largestTransaction.category} 
              value={formatCurrencyCompact(highestExpense.largestTransaction.amount, settings.currency)}
              icon="alert-circle"
              iconColor={colors.expense}
            />
          ) : null}
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
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  title: {
    fontFamily: 'Inter_700Bold',
    fontSize: 28,
  },
  content: {
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 18,
    marginBottom: 16,
  },
  chartCard: {
    padding: 16,
    marginBottom: 24,
    alignItems: 'center',
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8 },
      android: { elevation: 2 },
    }),
  },
  chart: {
    borderRadius: 16,
    marginLeft: -16, // Offset chart-kit's default padding
  },
  legendRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 24,
    marginTop: 16,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  legendText: {
    fontFamily: 'Inter_500Medium',
    fontSize: 12,
  },
  row: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 24,
  },
  col: {
    flex: 1,
  },
  pieCard: {
    padding: 16,
    alignItems: 'center',
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8 },
      android: { elevation: 2 },
    }),
  },
  pieLegend: {
    width: '100%',
    marginTop: 16,
    gap: 6,
  },
  pieLegendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  pieLegendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  pieLegendText: {
    fontFamily: 'Inter_400Regular',
    fontSize: 11,
    flex: 1,
  },
  emptyCard: {
    padding: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  emptyText: {
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    textAlign: 'center',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  statCard: {
    flex: 1,
    minWidth: '45%',
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8 },
      android: { elevation: 2 },
    }),
  },
  statIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  statContent: {
    flex: 1,
  },
  statTitle: {
    fontFamily: 'Inter_500Medium',
    fontSize: 11,
    marginBottom: 2,
    textTransform: 'uppercase',
  },
  statLabel: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 14,
    marginBottom: 4,
  },
  statValue: {
    fontFamily: 'Inter_700Bold',
    fontSize: 16,
  },
});
