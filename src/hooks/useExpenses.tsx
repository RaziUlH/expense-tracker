import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { Expense, MonthlyBudget } from '../types';
import {
  loadExpenses,
  saveExpenses,
  addExpense as storageAddExpense,
  updateExpense as storageUpdateExpense,
  deleteExpense as storageDeleteExpense,
  loadBudget,
  saveBudget,
  loadCurrency,
  saveCurrency,
} from '../utils/storage';
import {
  filterExpensesByMonth,
  getCurrentMonthKey,
} from '../utils/helpers';

interface ExpenseContextValue {
  expenses: Expense[];
  budget: MonthlyBudget | null;
  currency: string;
  loading: boolean;
  currentMonth: string;
  setCurrentMonth: (m: string) => void;
  monthlyExpenses: Expense[];
  monthlyTotal: number;
  addExpense: (e: Expense) => Promise<void>;
  updateExpense: (e: Expense) => Promise<void>;
  deleteExpense: (id: string) => Promise<void>;
  setBudget: (b: MonthlyBudget) => Promise<void>;
  setCurrency: (c: string) => Promise<void>;
  refreshExpenses: () => Promise<void>;
}

const ExpenseContext = createContext<ExpenseContextValue | undefined>(undefined);

export const ExpenseProvider = ({ children }: { children: ReactNode }) => {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [budget, setBudgetState] = useState<MonthlyBudget | null>(null);
  const [currency, setCurrencyState] = useState('USD');
  const [loading, setLoading] = useState(true);
  const [currentMonth, setCurrentMonth] = useState(getCurrentMonthKey());

  const refreshExpenses = useCallback(async () => {
    const [exps, bud, cur] = await Promise.all([
      loadExpenses(),
      loadBudget(),
      loadCurrency(),
    ]);
    setExpenses(exps);
    setBudgetState(bud);
    setCurrencyState(cur);
  }, []);

  useEffect(() => {
    (async () => {
      setLoading(true);
      await refreshExpenses();
      setLoading(false);
    })();
  }, [refreshExpenses]);

  const monthlyExpenses = filterExpensesByMonth(expenses, currentMonth);
  const monthlyTotal = monthlyExpenses.reduce((s, e) => s + e.amount, 0);

  const addExpense = async (e: Expense) => {
    const updated = await storageAddExpense(e);
    setExpenses(updated);
  };

  const updateExpense = async (e: Expense) => {
    const updated = await storageUpdateExpense(e);
    setExpenses(updated);
  };

  const deleteExpense = async (id: string) => {
    const updated = await storageDeleteExpense(id);
    setExpenses(updated);
  };

  const setBudget = async (b: MonthlyBudget) => {
    await saveBudget(b);
    setBudgetState(b);
  };

  const setCurrency = async (c: string) => {
    await saveCurrency(c);
    setCurrencyState(c);
  };

  return (
    <ExpenseContext.Provider
      value={{
        expenses,
        budget,
        currency,
        loading,
        currentMonth,
        setCurrentMonth,
        monthlyExpenses,
        monthlyTotal,
        addExpense,
        updateExpense,
        deleteExpense,
        setBudget,
        setCurrency,
        refreshExpenses,
      }}>
      {children}
    </ExpenseContext.Provider>
  );
};

export const useExpenses = (): ExpenseContextValue => {
  const ctx = useContext(ExpenseContext);
  if (!ctx) throw new Error('useExpenses must be used within ExpenseProvider');
  return ctx;
};
