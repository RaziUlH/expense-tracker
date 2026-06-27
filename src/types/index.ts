export type ExpenseCategory =
  | 'Food & Dining'
  | 'Transport'
  | 'Shopping'
  | 'Entertainment'
  | 'Health'
  | 'Bills & Utilities'
  | 'Education'
  | 'Travel'
  | 'Personal Care'
  | 'Other';

export interface Expense {
  id: string;
  title: string;
  amount: number;
  category: ExpenseCategory;
  date: string; // ISO string
  note?: string;
}

export interface MonthlyBudget {
  month: string; // YYYY-MM
  limit: number;
}

export type RootStackParamList = {
  MainTabs: undefined;
  AddExpense: { expense?: Expense };
  ExpenseDetail: { expense: Expense };
};

export type TabParamList = {
  Dashboard: undefined;
  Expenses: undefined;
  Analytics: undefined;
  Settings: undefined;
};
