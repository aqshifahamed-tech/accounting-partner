import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Platform, Alert } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { useColors } from '@/hooks/useColors';
import { useSettings } from '@/contexts/SettingsContext';
import { useTransactions } from '@/contexts/TransactionsContext';
import { usePeriodReport } from '@/hooks/useAnalytics';
import { getDateRangeForPreset, formatDayLabel, toISODate, parseISODate } from '@/utils/date';
import { formatCurrency } from '@/utils/currency';
import { buildReportHtml } from '@/utils/pdf';
import { transactionsToCsv } from '@/utils/csv';
import { writeAndShareFile } from '@/utils/backup';
import { Button } from '@/components/ui/Button';
import { DatePickerModal } from '@/components/DatePickerModal';
import { TransactionItem } from '@/components/TransactionItem';

type ReportRange = 'thisWeek' | 'thisMonth' | 'thisYear' | 'custom';

export default function ReportScreen() {
  const colors = useColors();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { settings } = useSettings();
  const { transactions } = useTransactions();

  const [rangeType, setRangeType] = useState<ReportRange>('thisMonth');
  const [customStart, setCustomStart] = useState(toISODate(new Date()));
  const [customEnd, setCustomEnd] = useState(toISODate(new Date()));
  const [showDatePicker, setShowDatePicker] = useState<'start' | 'end' | null>(null);

  const range = useMemo(() => {
    if (rangeType === 'custom') {
      return { start: customStart, end: customEnd };
    }
    return getDateRangeForPreset(rangeType);
  }, [rangeType, customStart, customEnd]);

  const report = usePeriodReport(transactions, range.start, range.end);
  const filteredTransactions = useMemo(() => {
    return transactions.filter(t => t.date >= range.start && t.date <= range.end);
  }, [transactions, range]);

  const handleExportPDF = async () => {
    try {
      const html = buildReportHtml({
        title: 'Accounting Partner - Period Report',
        subtitle: `${formatDayLabel(range.start)} to ${formatDayLabel(range.end)}`,
        currency: settings.currency,
        dateFormat: settings.dateFormat,
        totalIncome: report.totalIncome,
        totalExpense: report.totalExpense,
        profitLoss: report.profitLoss,
        transactionCount: report.transactionCount,
        incomeBreakdown: report.incomeBreakdown,
        expenseBreakdown: report.expenseBreakdown,
        transactions: filteredTransactions,
      });

      const { uri } = await Print.printToFileAsync({ html });
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(uri, { UTI: '.pdf', mimeType: 'application/pdf' });
      }
    } catch (e) {
      Alert.alert('Error', 'Failed to generate PDF report');
    }
  };

  const handleExportCSV = async () => {
    try {
      const csv = transactionsToCsv(filteredTransactions, settings.dateFormat);
      const fileName = `AP_Report_${range.start}_to_${range.end}.csv`;
      await writeAndShareFile(fileName, csv, 'text/csv');
    } catch (e) {
      Alert.alert('Error', 'Failed to export CSV');
    }
  };

  const SummaryCard = ({ label, value, color }: { label: string, value: string, color: string }) => (
    <View style={[styles.summaryCard, { backgroundColor: colors.card, borderRadius: colors.radius }]}>
      <Text style={[styles.summaryLabel, { color: colors.mutedForeground }]}>{label}</Text>
      <Text style={[styles.summaryValue, { color }]}>{value}</Text>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.foreground }]}>Reports</Text>
        <Pressable onPress={() => router.back()} style={styles.closeBtn}>
          <Feather name="x" size={24} color={colors.foreground} />
        </Pressable>
      </View>

      <ScrollView 
        contentContainerStyle={{ padding: 20, paddingBottom: insets.bottom + 40 }}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.rangeSelector}>
          {(['thisWeek', 'thisMonth', 'thisYear', 'custom'] as const).map(type => (
            <Pressable
              key={type}
              style={[
                styles.rangeBtn,
                { backgroundColor: colors.card, borderColor: colors.border },
                rangeType === type && { backgroundColor: colors.primary, borderColor: colors.primary }
              ]}
              onPress={() => setRangeType(type)}
            >
              <Text style={[
                styles.rangeBtnText,
                { color: rangeType === type ? colors.primaryForeground : colors.foreground }
              ]}>
                {type === 'thisWeek' ? 'Weekly' : type === 'thisMonth' ? 'Monthly' : type === 'thisYear' ? 'Yearly' : 'Custom'}
              </Text>
            </Pressable>
          ))}
        </View>

        {rangeType === 'custom' && (
          <View style={styles.customDateRow}>
            <Pressable 
              style={[styles.dateInput, { backgroundColor: colors.card, borderColor: colors.border, borderRadius: colors.radius }]}
              onPress={() => setShowDatePicker('start')}
            >
              <Text style={[styles.dateLabel, { color: colors.mutedForeground }]}>Start</Text>
              <Text style={[styles.dateVal, { color: colors.foreground }]}>{formatDayLabel(customStart)}</Text>
            </Pressable>
            <View style={styles.dateSeparator}>
              <Feather name="arrow-right" size={16} color={colors.mutedForeground} />
            </View>
            <Pressable 
              style={[styles.dateInput, { backgroundColor: colors.card, borderColor: colors.border, borderRadius: colors.radius }]}
              onPress={() => setShowDatePicker('end')}
            >
              <Text style={[styles.dateLabel, { color: colors.mutedForeground }]}>End</Text>
              <Text style={[styles.dateVal, { color: colors.foreground }]}>{formatDayLabel(customEnd)}</Text>
            </Pressable>
          </View>
        )}

        <View style={styles.summaryGrid}>
          <SummaryCard 
            label="Total Income" 
            value={formatCurrency(report.totalIncome, settings.currency)} 
            color={colors.income} 
          />
          <SummaryCard 
            label="Total Expense" 
            value={formatCurrency(report.totalExpense, settings.currency)} 
            color={colors.expense} 
          />
          <SummaryCard 
            label="Net Profit" 
            value={formatCurrency(report.profitLoss, settings.currency)} 
            color={report.profitLoss >= 0 ? colors.income : colors.expense} 
          />
          <SummaryCard 
            label="Savings Rate" 
            value={`${report.savingsRate.toFixed(1)}%`} 
            color={colors.primary} 
          />
        </View>

        <View style={styles.exportActions}>
          <Button 
            title="Export PDF" 
            icon={<Feather name="file" size={18} color={colors.primary} />} 
            variant="outline" 
            onPress={handleExportPDF}
            style={{ flex: 1 }}
          />
          <Button 
            title="Export CSV" 
            icon={<Feather name="file-text" size={18} color={colors.primary} />} 
            variant="outline" 
            onPress={handleExportCSV}
            style={{ flex: 1 }}
          />
        </View>

        <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Transactions ({report.transactionCount})</Text>
        
        {filteredTransactions.length > 0 ? (
          filteredTransactions.map(t => (
            <TransactionItem 
              key={t.id} 
              transaction={t} 
              onPress={(id) => router.push(`/transaction/${id}`)} 
            />
          ))
        ) : (
          <View style={[styles.emptyState, { backgroundColor: colors.card, borderRadius: colors.radius }]}>
            <Feather name="inbox" size={32} color={colors.mutedForeground} style={{ marginBottom: 12 }} />
            <Text style={[styles.emptyText, { color: colors.foreground }]}>No transactions found for this period.</Text>
          </View>
        )}

      </ScrollView>

      {showDatePicker && (
        <DatePickerModal
          visible={true}
          onClose={() => setShowDatePicker(null)}
          date={showDatePicker === 'start' ? customStart : customEnd}
          onSelect={(d) => {
            if (showDatePicker === 'start') {
              setCustomStart(d);
              if (d > customEnd) setCustomEnd(d);
            } else {
              setCustomEnd(d);
              if (d < customStart) setCustomStart(d);
            }
            setShowDatePicker(null);
          }}
        />
      )}
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
  rangeSelector: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 24,
  },
  rangeBtn: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    borderWidth: 1,
  },
  rangeBtnText: {
    fontFamily: 'Inter_500Medium',
    fontSize: 13,
  },
  customDateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  dateInput: {
    flex: 1,
    padding: 12,
    borderWidth: 1,
  },
  dateSeparator: {
    paddingHorizontal: 12,
  },
  dateLabel: {
    fontFamily: 'Inter_500Medium',
    fontSize: 11,
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  dateVal: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 15,
  },
  summaryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 24,
  },
  summaryCard: {
    width: '48%',
    padding: 16,
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8 },
      android: { elevation: 2 },
    }),
  },
  summaryLabel: {
    fontFamily: 'Inter_500Medium',
    fontSize: 12,
    marginBottom: 8,
  },
  summaryValue: {
    fontFamily: 'Inter_700Bold',
    fontSize: 18,
  },
  exportActions: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 32,
  },
  sectionTitle: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 18,
    marginBottom: 16,
  },
  emptyState: {
    padding: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
  },
});
