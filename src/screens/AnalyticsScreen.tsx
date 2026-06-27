import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
} from 'react-native';
import { useExpenses } from '../hooks/useExpenses';
import { COLORS, CATEGORY_CONFIG } from '../constants';
import {
  formatCurrency,
  getLast6Months,
  getMonthLabel,
  filterExpensesByMonth,
  getTotalByCategory,
  getMonthlyTotals,
} from '../utils/helpers';
import { Card, SectionHeader } from '../components/Common';
import { CategoryPieChart, MonthlyBarChart } from '../components/Charts';
import { ExpenseCategory } from '../types';

const AnalyticsScreen: React.FC = () => {
  const { expenses, currency, currentMonth, setCurrentMonth } = useExpenses();
  const [activeChart, setActiveChart] = useState<'bar' | 'pie'>('bar');

  const months = getLast6Months();
  const selectedMonthExpenses = filterExpensesByMonth(expenses, currentMonth);
  const selectedTotal = selectedMonthExpenses.reduce((s, e) => s + e.amount, 0);
  const categoryTotals = getTotalByCategory(selectedMonthExpenses);
  const monthlyTotals = getMonthlyTotals(expenses, months);

  const sortedCategories = Object.entries(categoryTotals)
    .sort(([, a], [, b]) => b - a);

  const maxCategory = sortedCategories[0];
  const avgMonthly =
    monthlyTotals.filter(t => t > 0).length > 0
      ? monthlyTotals.reduce((a, b) => a + b, 0) /
        monthlyTotals.filter(t => t > 0).length
      : 0;

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.bg} />
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}>

        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Analytics</Text>
          <Text style={styles.headerSub}>Spending insights</Text>
        </View>

        {/* Summary Cards */}
        <View style={styles.summaryRow}>
          <View style={[styles.summaryCard, styles.summaryCardPurple]}>
            <Text style={styles.summaryIcon}>📅</Text>
            <Text style={styles.summaryValue}>{formatCurrency(selectedTotal, currency)}</Text>
            <Text style={styles.summaryLabel}>{getMonthLabel(currentMonth)}</Text>
          </View>
          <View style={[styles.summaryCard, styles.summaryCardCyan]}>
            <Text style={styles.summaryIcon}>📊</Text>
            <Text style={styles.summaryValue}>{formatCurrency(avgMonthly, currency)}</Text>
            <Text style={styles.summaryLabel}>Avg Monthly</Text>
          </View>
        </View>

        {/* Month Selector */}
        <View style={styles.monthScroll}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.monthRow}>
              {months.map(m => (
                <TouchableOpacity
                  key={m}
                  style={[
                    styles.monthChip,
                    currentMonth === m && styles.monthChipActive,
                  ]}
                  onPress={() => setCurrentMonth(m)}>
                  <Text
                    style={[
                      styles.monthChipText,
                      currentMonth === m && styles.monthChipTextActive,
                    ]}>
                    {getMonthLabel(m)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        </View>

        {/* Chart Switcher */}
        <View style={styles.chartSwitcher}>
          <TouchableOpacity
            style={[
              styles.switcherBtn,
              activeChart === 'bar' && styles.switcherBtnActive,
            ]}
            onPress={() => setActiveChart('bar')}>
            <Text
              style={[
                styles.switcherText,
                activeChart === 'bar' && styles.switcherTextActive,
              ]}>
              📊 Trend
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.switcherBtn,
              activeChart === 'pie' && styles.switcherBtnActive,
            ]}
            onPress={() => setActiveChart('pie')}>
            <Text
              style={[
                styles.switcherText,
                activeChart === 'pie' && styles.switcherTextActive,
              ]}>
              🥧 Breakdown
            </Text>
          </TouchableOpacity>
        </View>

        {/* Charts */}
        <Card style={styles.chartCard}>
          {activeChart === 'bar' ? (
            <>
              <SectionHeader title="6-Month Trend" subtitle="Monthly spending" />
              <MonthlyBarChart expenses={expenses} currency={currency} />
            </>
          ) : (
            <>
              <SectionHeader
                title="Category Breakdown"
                subtitle={getMonthLabel(currentMonth)}
              />
              <CategoryPieChart
                expenses={selectedMonthExpenses}
                currency={currency}
              />
            </>
          )}
        </Card>

        {/* Category Breakdown List */}
        <SectionHeader
          title="Category Breakdown"
          subtitle={getMonthLabel(currentMonth)}
        />
        {sortedCategories.length === 0 ? (
          <Card style={styles.emptyCard}>
            <Text style={styles.emptyEmoji}>📭</Text>
            <Text style={styles.emptyText}>No expenses this month</Text>
          </Card>
        ) : (
          sortedCategories.map(([cat, amount]) => {
            const cfg = CATEGORY_CONFIG[cat as ExpenseCategory];
            const pct = selectedTotal > 0 ? (amount / selectedTotal) * 100 : 0;
            return (
              <View key={cat} style={styles.catBreakdownItem}>
                <View
                  style={[styles.catBreakdownIcon, { backgroundColor: cfg?.bg }]}>
                  <Text style={styles.catBreakdownEmoji}>{cfg?.icon}</Text>
                </View>
                <View style={styles.catBreakdownInfo}>
                  <View style={styles.catBreakdownHeader}>
                    <Text style={styles.catBreakdownName}>{cat}</Text>
                    <Text style={styles.catBreakdownAmount}>
                      {formatCurrency(amount, currency)}
                    </Text>
                  </View>
                  <View style={styles.catProgressTrack}>
                    <View
                      style={[
                        styles.catProgressFill,
                        {
                          width: `${pct}%`,
                          backgroundColor: cfg?.color,
                        },
                      ]}
                    />
                  </View>
                  <Text style={styles.catBreakdownPct}>{pct.toFixed(1)}%</Text>
                </View>
              </View>
            );
          })
        )}

        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },
  content: {
    padding: 20,
    paddingTop: 60,
    gap: 16,
  },
  header: {
    marginBottom: 4,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: '800',
    color: COLORS.textPrimary,
    letterSpacing: -0.5,
  },
  headerSub: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginTop: 4,
  },
  summaryRow: {
    flexDirection: 'row',
    gap: 12,
  },
  summaryCard: {
    flex: 1,
    borderRadius: 20,
    padding: 18,
    gap: 4,
    borderWidth: 1,
  },
  summaryCardPurple: {
    backgroundColor: COLORS.bgCardElevated,
    borderColor: COLORS.primaryDark + '60',
  },
  summaryCardCyan: {
    backgroundColor: COLORS.bgCardElevated,
    borderColor: '#06B6D440',
  },
  summaryIcon: {
    fontSize: 24,
    marginBottom: 4,
  },
  summaryValue: {
    fontSize: 20,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  summaryLabel: {
    fontSize: 12,
    color: COLORS.textSecondary,
    fontWeight: '600',
  },
  monthScroll: {
    marginHorizontal: -20,
  },
  monthRow: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 8,
  },
  monthChip: {
    backgroundColor: COLORS.bgCard,
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  monthChipActive: {
    backgroundColor: COLORS.primaryGlow,
    borderColor: COLORS.primaryLight,
  },
  monthChipText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  monthChipTextActive: {
    color: COLORS.primaryLight,
  },
  chartSwitcher: {
    flexDirection: 'row',
    backgroundColor: COLORS.bgCard,
    borderRadius: 16,
    padding: 4,
    borderWidth: 1,
    borderColor: COLORS.border,
    gap: 4,
  },
  switcherBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 12,
    alignItems: 'center',
  },
  switcherBtnActive: {
    backgroundColor: COLORS.primary,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 6,
    elevation: 4,
  },
  switcherText: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textSecondary,
  },
  switcherTextActive: {
    color: '#fff',
  },
  chartCard: {
    overflow: 'hidden',
  },
  emptyCard: {
    alignItems: 'center',
    paddingVertical: 24,
    gap: 8,
  },
  emptyEmoji: {
    fontSize: 40,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  catBreakdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.bgCard,
    borderRadius: 16,
    padding: 14,
    gap: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 8,
  },
  catBreakdownIcon: {
    width: 46,
    height: 46,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  catBreakdownEmoji: {
    fontSize: 22,
  },
  catBreakdownInfo: {
    flex: 1,
    gap: 6,
  },
  catBreakdownHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  catBreakdownName: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  catBreakdownAmount: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  catProgressTrack: {
    height: 4,
    backgroundColor: COLORS.border,
    borderRadius: 2,
    overflow: 'hidden',
  },
  catProgressFill: {
    height: '100%',
    borderRadius: 2,
  },
  catBreakdownPct: {
    fontSize: 11,
    color: COLORS.textMuted,
    fontWeight: '600',
  },
});

export default AnalyticsScreen;
