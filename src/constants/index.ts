import { ExpenseCategory } from '../types';

export const COLORS = {
  // Primary palette - deep purple gradient
  primary: '#7C3AED',
  primaryLight: '#A78BFA',
  primaryDark: '#5B21B6',
  primaryGlow: 'rgba(124, 58, 237, 0.3)',

  // Secondary
  secondary: '#06B6D4',
  secondaryLight: '#67E8F9',

  // Accents
  accent: '#F59E0B',
  accentLight: '#FCD34D',
  success: '#10B981',
  successLight: '#6EE7B7',
  danger: '#EF4444',
  dangerLight: '#FCA5A5',
  warning: '#F97316',

  // Background layers
  bg: '#0A0A1A',
  bgCard: '#12122A',
  bgCardElevated: '#1A1A35',
  bgInput: '#1E1E3A',
  bgModal: '#16163A',

  // Text
  textPrimary: '#F1F0FF',
  textSecondary: '#9B99C4',
  textMuted: '#5A5880',
  textInverse: '#0A0A1A',

  // Borders
  border: '#2A2A4A',
  borderLight: '#3A3A5A',

  // Chart colors
  chartColors: [
    '#7C3AED',
    '#06B6D4',
    '#10B981',
    '#F59E0B',
    '#EF4444',
    '#F97316',
    '#8B5CF6',
    '#EC4899',
    '#14B8A6',
    '#6366F1',
  ],
};

export const CATEGORY_CONFIG: Record<
  ExpenseCategory,
  { icon: string; color: string; bg: string }
> = {
  'Food & Dining': { icon: '🍔', color: '#F59E0B', bg: 'rgba(245,158,11,0.15)' },
  Transport: { icon: '🚗', color: '#06B6D4', bg: 'rgba(6,182,212,0.15)' },
  Shopping: { icon: '🛍️', color: '#EC4899', bg: 'rgba(236,72,153,0.15)' },
  Entertainment: { icon: '🎬', color: '#8B5CF6', bg: 'rgba(139,92,246,0.15)' },
  Health: { icon: '💊', color: '#10B981', bg: 'rgba(16,185,129,0.15)' },
  'Bills & Utilities': { icon: '⚡', color: '#EF4444', bg: 'rgba(239,68,68,0.15)' },
  Education: { icon: '📚', color: '#3B82F6', bg: 'rgba(59,130,246,0.15)' },
  Travel: { icon: '✈️', color: '#F97316', bg: 'rgba(249,115,22,0.15)' },
  'Personal Care': { icon: '💆', color: '#A78BFA', bg: 'rgba(167,139,250,0.15)' },
  Other: { icon: '📦', color: '#9B99C4', bg: 'rgba(155,153,196,0.15)' },
};

export const CATEGORIES: ExpenseCategory[] = [
  'Food & Dining',
  'Transport',
  'Shopping',
  'Entertainment',
  'Health',
  'Bills & Utilities',
  'Education',
  'Travel',
  'Personal Care',
  'Other',
];

export const STORAGE_KEYS = {
  EXPENSES: '@expense_tracker_expenses',
  BUDGET: '@expense_tracker_budget',
  CURRENCY: '@expense_tracker_currency',
};

export const CURRENCIES = ['USD', 'EUR', 'GBP', 'INR', 'JPY', 'CAD', 'AUD'];
export const CURRENCY_SYMBOLS: Record<string, string> = {
  USD: '$',
  EUR: '€',
  GBP: '£',
  INR: '₹',
  JPY: '¥',
  CAD: 'CA$',
  AUD: 'A$',
};
