import { useMemo } from 'react';
import type {
  CategoryBreakdownEntry,
  DashboardSummary,
  HighestStats,
  MonthlySeriesPoint,
  PeriodReport,
  Transaction,
  TransactionFilter,
  TransactionType,
} from '@/types';
import { getCategoryDef } from '@/constants/categories';
import {
  getDateRangeForPreset,
  monthLabel,
  parseISODate,
  todayISO,
  toISODate,
} from '@/utils/date';

function inRange(date: string, start?: string, end?: string): boolean {
  if (start && date < start) return false;
  if (end && date > end) return false;
  return true;
}

export function useDashboardSummary(
  transactions: Transaction[],
): DashboardSummary {
  return useMemo(() => {
    const now = new Date();
    const today = todayISO();
    const monthPrefix = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    const yearPrefix = `${now.getFullYear()}`;

    let totalIncome = 0;
    let totalExpense = 0;
    let todayIncome = 0;
    let todayExpense = 0;
    let monthIncome = 0;
    let monthExpense = 0;
    let yearIncome = 0;
    let yearExpense = 0;

    for (const t of transactions) {
      const isIncome = t.type === 'income';
      if (isIncome) totalIncome += t.amount;
      else totalExpense += t.amount;

      if (t.date === today) {
        if (isIncome) todayIncome += t.amount;
        else todayExpense += t.amount;
      }
      if (t.date.startsWith(monthPrefix)) {
        if (isIncome) monthIncome += t.amount;
        else monthExpense += t.amount;
      }
      if (t.date.startsWith(yearPrefix)) {
        if (isIncome) yearIncome += t.amount;
        else yearExpense += t.amount;
      }
    }

    return {
      totalIncome,
      totalExpense,
      balance: totalIncome - totalExpense,
      todayIncome,
      todayExpense,
      monthIncome,
      monthExpense,
      yearIncome,
      yearExpense,
    };
  }, [transactions]);
}

export function getCategoryBreakdown(
  transactions: Transaction[],
  type: TransactionType,
): CategoryBreakdownEntry[] {
  const filtered = transactions.filter((t) => t.type === type);
  const total = filtered.reduce((sum, t) => sum + t.amount, 0);
  const map = new Map<string, { total: number; count: number }>();
  for (const t of filtered) {
    const entry = map.get(t.category) ?? { total: 0, count: 0 };
    entry.total += t.amount;
    entry.count += 1;
    map.set(t.category, entry);
  }
  return Array.from(map.entries())
    .map(([category, { total: catTotal, count }]) => ({
      category,
      total: catTotal,
      count,
      percentage: total > 0 ? (catTotal / total) * 100 : 0,
      color: getCategoryDef(type, category).color,
    }))
    .sort((a, b) => b.total - a.total);
}

export function useHighestStats(
  transactions: Transaction[],
  type: TransactionType,
): HighestStats {
  return useMemo(() => {
    const filtered = transactions.filter((t) => t.type === type);
    if (filtered.length === 0) {
      return {
        highestCategory: null,
        highestMonth: null,
        highestDay: null,
        largestTransaction: null,
      };
    }

    const byCategory = getCategoryBreakdown(transactions, type);
    const highestCategory = byCategory[0]
      ? { category: byCategory[0].category, total: byCategory[0].total }
      : null;

    const monthMap = new Map<string, number>();
    const dayMap = new Map<string, number>();
    let largestTransaction = filtered[0]!;

    for (const t of filtered) {
      const d = parseISODate(t.date);
      const monthKey = `${d.getFullYear()}-${d.getMonth()}`;
      monthMap.set(monthKey, (monthMap.get(monthKey) ?? 0) + t.amount);
      dayMap.set(t.date, (dayMap.get(t.date) ?? 0) + t.amount);
      if (t.amount > largestTransaction.amount) largestTransaction = t;
    }

    let highestMonth: { label: string; total: number } | null = null;
    for (const [key, total] of monthMap.entries()) {
      if (!highestMonth || total > highestMonth.total) {
        const [year, month] = key.split('-').map(Number);
        highestMonth = { label: monthLabel(month ?? 0, year ?? 0), total };
      }
    }

    let highestDay: { date: string; total: number } | null = null;
    for (const [date, total] of dayMap.entries()) {
      if (!highestDay || total > highestDay.total) {
        highestDay = { date, total };
      }
    }

    return { highestCategory, highestMonth, highestDay, largestTransaction };
  }, [transactions, type]);
}

export function usePeriodReport(
  transactions: Transaction[],
  startDate: string,
  endDate: string,
): PeriodReport {
  return useMemo(() => {
    const filtered = transactions.filter((t) =>
      inRange(t.date, startDate, endDate),
    );
    const totalIncome = filtered
      .filter((t) => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
    const totalExpense = filtered
      .filter((t) => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);
    const profitLoss = totalIncome - totalExpense;
    return {
      totalIncome,
      totalExpense,
      profitLoss,
      savingsRate: totalIncome > 0 ? (profitLoss / totalIncome) * 100 : 0,
      transactionCount: filtered.length,
      incomeBreakdown: getCategoryBreakdown(filtered, 'income'),
      expenseBreakdown: getCategoryBreakdown(filtered, 'expense'),
    };
  }, [transactions, startDate, endDate]);
}

export function useYearlySeries(
  transactions: Transaction[],
  year: number,
): MonthlySeriesPoint[] {
  return useMemo(() => {
    const points: MonthlySeriesPoint[] = [];
    let runningBalance = transactions
      .filter((t) => parseISODate(t.date).getFullYear() < year)
      .reduce(
        (sum, t) => sum + (t.type === 'income' ? t.amount : -t.amount),
        0,
      );

    for (let month = 0; month < 12; month++) {
      const prefix = `${year}-${String(month + 1).padStart(2, '0')}`;
      let income = 0;
      let expense = 0;
      for (const t of transactions) {
        if (t.date.startsWith(prefix)) {
          if (t.type === 'income') income += t.amount;
          else expense += t.amount;
        }
      }
      runningBalance += income - expense;
      points.push({
        label: monthLabel(month, year).split(' ')[0]!.slice(0, 3),
        month,
        year,
        income,
        expense,
        balance: runningBalance,
      });
    }
    return points;
  }, [transactions, year]);
}

export function filterTransactions(
  transactions: Transaction[],
  filter: TransactionFilter,
  type?: TransactionType,
): Transaction[] {
  let result = type ? transactions.filter((t) => t.type === type) : transactions;

  if (filter.preset !== 'all' && filter.preset !== 'custom') {
    const range = getDateRangeForPreset(filter.preset);
    result = result.filter((t) => inRange(t.date, range.start, range.end));
  } else if (filter.preset === 'custom' && (filter.startDate || filter.endDate)) {
    result = result.filter((t) =>
      inRange(t.date, filter.startDate, filter.endDate),
    );
  }

  if (filter.category) {
    result = result.filter((t) => t.category === filter.category);
  }

  if (filter.query && filter.query.trim().length > 0) {
    const q = filter.query.trim().toLowerCase();
    result = result.filter((t) => {
      return (
        t.category.toLowerCase().includes(q) ||
        t.description.toLowerCase().includes(q) ||
        t.notes.toLowerCase().includes(q) ||
        t.paymentMethod.toLowerCase().includes(q) ||
        String(t.amount).includes(q) ||
        t.date.includes(q) ||
        toISODate(parseISODate(t.date)).includes(q)
      );
    });
  }

  return result;
}
