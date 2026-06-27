import AsyncStorage from '@react-native-async-storage/async-storage';
import { Expense, MonthlyBudget } from '../types';
import { STORAGE_KEYS } from '../constants';

// ─── Expenses ────────────────────────────────────────────────────────────────

export const loadExpenses = async (): Promise<Expense[]> => {
  try {
    const json = await AsyncStorage.getItem(STORAGE_KEYS.EXPENSES);
    return json ? JSON.parse(json) : [];
  } catch {
    return [];
  }
};

export const saveExpenses = async (expenses: Expense[]): Promise<void> => {
  await AsyncStorage.setItem(STORAGE_KEYS.EXPENSES, JSON.stringify(expenses));
};

export const addExpense = async (expense: Expense): Promise<Expense[]> => {
  const existing = await loadExpenses();
  const updated = [expense, ...existing];
  await saveExpenses(updated);
  return updated;
};

export const updateExpense = async (
  updated: Expense
): Promise<Expense[]> => {
  const existing = await loadExpenses();
  const next = existing.map(e => (e.id === updated.id ? updated : e));
  await saveExpenses(next);
  return next;
};

export const deleteExpense = async (id: string): Promise<Expense[]> => {
  const existing = await loadExpenses();
  const next = existing.filter(e => e.id !== id);
  await saveExpenses(next);
  return next;
};

// ─── Budget ───────────────────────────────────────────────────────────────────

export const loadBudget = async (): Promise<MonthlyBudget | null> => {
  try {
    const json = await AsyncStorage.getItem(STORAGE_KEYS.BUDGET);
    return json ? JSON.parse(json) : null;
  } catch {
    return null;
  }
};

export const saveBudget = async (budget: MonthlyBudget): Promise<void> => {
  await AsyncStorage.setItem(STORAGE_KEYS.BUDGET, JSON.stringify(budget));
};

// ─── Currency ─────────────────────────────────────────────────────────────────

export const loadCurrency = async (): Promise<string> => {
  try {
    const val = await AsyncStorage.getItem(STORAGE_KEYS.CURRENCY);
    return val || 'USD';
  } catch {
    return 'USD';
  }
};

export const saveCurrency = async (currency: string): Promise<void> => {
  await AsyncStorage.setItem(STORAGE_KEYS.CURRENCY, currency);
};
