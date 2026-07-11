import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import type { Transaction, TransactionInput } from '@/types';
import { generateId } from '@/utils/id';
import { readJSON, STORAGE_KEYS, writeJSON } from '@/utils/storage';

interface TransactionsContextValue {
  transactions: Transaction[];
  isLoading: boolean;
  addTransaction: (input: TransactionInput) => Promise<Transaction>;
  updateTransaction: (
    id: string,
    input: TransactionInput,
  ) => Promise<Transaction | null>;
  deleteTransaction: (id: string) => Promise<void>;
  getById: (id: string) => Transaction | undefined;
  replaceAll: (next: Transaction[]) => Promise<void>;
}

const TransactionsContext = createContext<TransactionsContextValue | null>(
  null,
);

export function TransactionsProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const stored = await readJSON<Transaction[]>(
        STORAGE_KEYS.transactions,
        [],
      );
      setTransactions(stored);
      setIsLoading(false);
    })();
  }, []);

  const persist = useCallback(async (next: Transaction[]) => {
    setTransactions(next);
    await writeJSON(STORAGE_KEYS.transactions, next);
  }, []);

  const addTransaction = useCallback(
    async (input: TransactionInput) => {
      const now = new Date().toISOString();
      const transaction: Transaction = {
        ...input,
        id: generateId(),
        createdAt: now,
        updatedAt: now,
      };
      const next = [transaction, ...transactions].sort((a, b) =>
        b.date.localeCompare(a.date),
      );
      await persist(next);
      return transaction;
    },
    [transactions, persist],
  );

  const updateTransaction = useCallback(
    async (id: string, input: TransactionInput) => {
      let updated: Transaction | null = null;
      const next = transactions.map((t) => {
        if (t.id !== id) return t;
        updated = { ...t, ...input, updatedAt: new Date().toISOString() };
        return updated;
      });
      if (updated) {
        next.sort((a, b) => b.date.localeCompare(a.date));
        await persist(next);
      }
      return updated;
    },
    [transactions, persist],
  );

  const deleteTransaction = useCallback(
    async (id: string) => {
      const next = transactions.filter((t) => t.id !== id);
      await persist(next);
    },
    [transactions, persist],
  );

  const getById = useCallback(
    (id: string) => transactions.find((t) => t.id === id),
    [transactions],
  );

  const replaceAll = useCallback(
    async (next: Transaction[]) => {
      await persist(next);
    },
    [persist],
  );

  const value = useMemo<TransactionsContextValue>(
    () => ({
      transactions,
      isLoading,
      addTransaction,
      updateTransaction,
      deleteTransaction,
      getById,
      replaceAll,
    }),
    [
      transactions,
      isLoading,
      addTransaction,
      updateTransaction,
      deleteTransaction,
      getById,
      replaceAll,
    ],
  );

  return (
    <TransactionsContext.Provider value={value}>
      {children}
    </TransactionsContext.Provider>
  );
}

export function useTransactions(): TransactionsContextValue {
  const ctx = useContext(TransactionsContext);
  if (!ctx) {
    throw new Error(
      'useTransactions must be used within TransactionsProvider',
    );
  }
  return ctx;
}
