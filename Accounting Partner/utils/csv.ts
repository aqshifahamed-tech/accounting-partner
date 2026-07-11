import type { Transaction } from '@/types';
import { formatDate } from '@/utils/date';
import type { DateFormatKey } from '@/types';

function escapeCsvField(value: string): string {
  if (/[",\n]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

export function transactionsToCsv(
  transactions: Transaction[],
  dateFormat: DateFormatKey,
): string {
  const header = [
    'Type',
    'Date',
    'Category',
    'Amount',
    'Payment Method',
    'Description',
    'Notes',
  ];
  const rows = transactions.map((t) => [
    t.type === 'income' ? 'Income' : 'Expense',
    formatDate(t.date, dateFormat),
    t.category,
    t.amount.toFixed(2),
    t.paymentMethod,
    t.description,
    t.notes,
  ]);
  const lines = [header, ...rows].map((row) =>
    row.map((cell) => escapeCsvField(String(cell))).join(','),
  );
  return lines.join('\n');
}
