import { Expense, ExpenseCategory } from '../types';
import { CURRENCY_SYMBOLS } from '../constants';

export const generateId = (): string =>
  Date.now().toString(36) + Math.random().toString(36).substr(2, 9);

export const formatCurrency = (amount: number, currency = 'USD'): string => {
  const symbol = CURRENCY_SYMBOLS[currency] || currency;
  return `${symbol}${amount.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
};

export const formatDate = (iso: string): string => {
  const d = new Date(iso);
  return d.toLocaleDateString('en-US', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
};

export const formatDateShort = (iso: string): string => {
  const d = new Date(iso);
  return d.toLocaleDateString('en-US', { day: 'numeric', month: 'short' });
};

export const getMonthKey = (date: Date | string): string => {
  const d = new Date(date);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
};

export const getMonthLabel = (monthKey: string): string => {
  const [year, month] = monthKey.split('-');
  const d = new Date(parseInt(year), parseInt(month) - 1, 1);
  return d.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
};

export const filterExpensesByMonth = (
  expenses: Expense[],
  monthKey: string
): Expense[] =>
  expenses.filter(e => getMonthKey(e.date) === monthKey);

export const getTotalByCategory = (
  expenses: Expense[]
): Record<ExpenseCategory, number> => {
  return expenses.reduce(
    (acc, e) => {
      acc[e.category] = (acc[e.category] || 0) + e.amount;
      return acc;
    },
    {} as Record<ExpenseCategory, number>
  );
};

export const getLast6Months = (): string[] => {
  const months: string[] = [];
  const now = new Date();
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    months.push(getMonthKey(d));
  }
  return months;
};

export const getMonthlyTotals = (
  expenses: Expense[],
  months: string[]
): number[] =>
  months.map(m =>
    filterExpensesByMonth(expenses, m).reduce((s, e) => s + e.amount, 0)
  );

export const getCurrentMonthKey = (): string => getMonthKey(new Date());

export const groupExpensesByDate = (
  expenses: Expense[]
): { date: string; items: Expense[] }[] => {
  const map: Record<string, Expense[]> = {};
  expenses.forEach(e => {
    const key = e.date.substring(0, 10);
    if (!map[key]) map[key] = [];
    map[key].push(e);
  });
  return Object.entries(map)
    .sort(([a], [b]) => (a < b ? 1 : -1))
    .map(([date, items]) => ({ date, items }));
};
