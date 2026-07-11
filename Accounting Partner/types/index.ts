export type TransactionType = 'income' | 'expense';

export type PaymentMethod =
  | 'Cash'
  | 'Card'
  | 'Bank Transfer'
  | 'Mobile Wallet'
  | 'Cheque'
  | 'Other';

export const PAYMENT_METHODS: PaymentMethod[] = [
  'Cash',
  'Card',
  'Bank Transfer',
  'Mobile Wallet',
  'Cheque',
  'Other',
];

export interface Transaction {
  id: string;
  type: TransactionType;
  amount: number;
  date: string; // ISO date string: YYYY-MM-DD
  category: string;
  description: string;
  paymentMethod: PaymentMethod;
  notes: string;
  createdAt: string;
  updatedAt: string;
}

export type TransactionInput = Omit<
  Transaction,
  'id' | 'createdAt' | 'updatedAt'
>;

export type ThemeMode = 'light' | 'dark' | 'system';

export type AccentKey = 'ocean' | 'emerald' | 'violet' | 'sunset' | 'royal';

export type DateFormatKey = 'DD/MM/YYYY' | 'MM/DD/YYYY' | 'YYYY-MM-DD';

export type LanguageKey = 'en' | 'hi' | 'ta';

export interface SecuritySettings {
  biometricEnabled: boolean;
  pinEnabled: boolean;
  pinHash: string | null;
  autoLockMinutes: number; // 0 = immediately, -1 = never
}

export interface AppSettings {
  theme: ThemeMode;
  accent: AccentKey;
  dynamicColors: boolean;
  currency: string; // currency code, e.g. "INR"
  dateFormat: DateFormatKey;
  language: LanguageKey;
  notificationsEnabled: boolean;
  security: SecuritySettings;
  hasOnboarded: boolean;
}

export type FilterPreset =
  | 'all'
  | 'today'
  | 'yesterday'
  | 'thisWeek'
  | 'thisMonth'
  | 'thisYear'
  | 'custom';

export interface TransactionFilter {
  preset: FilterPreset;
  startDate?: string;
  endDate?: string;
  category?: string | null;
  query?: string;
}

export interface CategoryDef {
  name: string;
  icon: string;
  color: string;
}

export interface CategoryBreakdownEntry {
  category: string;
  total: number;
  count: number;
  percentage: number;
  color: string;
}

export interface DashboardSummary {
  totalIncome: number;
  totalExpense: number;
  balance: number;
  todayIncome: number;
  todayExpense: number;
  monthIncome: number;
  monthExpense: number;
  yearIncome: number;
  yearExpense: number;
}

export interface HighestStats {
  highestCategory: { category: string; total: number } | null;
  highestMonth: { label: string; total: number } | null;
  highestDay: { date: string; total: number } | null;
  largestTransaction: Transaction | null;
}

export interface PeriodReport {
  totalIncome: number;
  totalExpense: number;
  profitLoss: number;
  savingsRate: number;
  transactionCount: number;
  incomeBreakdown: CategoryBreakdownEntry[];
  expenseBreakdown: CategoryBreakdownEntry[];
}

export interface MonthlySeriesPoint {
  label: string;
  month: number;
  year: number;
  income: number;
  expense: number;
  balance: number;
}
