import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Animated,
  TouchableOpacity,
  StatusBar,
  Dimensions,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useExpenses } from '../hooks/useExpenses';
import { COLORS, CATEGORY_CONFIG } from '../constants';
import {
  formatCurrency,
  getCurrentMonthKey,
  getMonthLabel,
  getLast6Months,
  getMonthLabel as getLabel,
  getTotalByCategory,
  groupExpensesByDate,
  formatDateShort,
} from '../utils/helpers';
import { Card, SectionHeader } from '../components/Common';
import { MonthlyBarChart } from '../components/Charts';
import ExpenseItem from '../components/ExpenseItem';
import { RootStackParamList } from '../types';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

type DashboardNav = StackNavigationProp<RootStackParamList, 'MainTabs'>;

const DashboardScreen: React.FC = () => {
  const navigation = useNavigation<DashboardNav>();
  const { monthlyExpenses, monthlyTotal, budget, currency, expenses, currentMonth } =
    useExpenses();

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        speed: 12,
        bounciness: 6,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const budgetLimit = budget?.limit || 0;
  const budgetProgress = budgetLimit > 0 ? Math.min(monthlyTotal / budgetLimit, 1) : 0;
  const budgetRemaining = budgetLimit - monthlyTotal;
  const overBudget = budgetLimit > 0 && monthlyTotal > budgetLimit;

  useEffect(() => {
    Animated.timing(progressAnim, {
      toValue: budgetProgress,
      duration: 800,
      useNativeDriver: false,
    }).start();
  }, [budgetProgress]);

  const recentExpenses = monthlyExpenses.slice(0, 5);

  // Top categories
  const categoryTotals = getTotalByCategory(monthlyExpenses);
  const topCategories = Object.entries(categoryTotals)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 3);

  const monthLabel = getMonthLabel(currentMonth);

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent={true} />
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}>
        {/* Header */}
        <Animated.View
          style={[
            styles.header,
            { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
          ]}>
          <View>
            <Text style={styles.greeting}>Good day! 👋</Text>
            <Text style={styles.headerTitle}>Your Finances</Text>
          </View>
          <TouchableOpacity
            style={styles.addBtn}
            onPress={() => navigation.navigate('AddExpense', {})}>
            <Text style={styles.addBtnIcon}>+</Text>
          </TouchableOpacity>
        </Animated.View>

        {/* Balance Card */}
        <Animated.View
          style={[{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
          <View style={styles.balanceCard}>
            <View style={styles.balanceGlow} />
            <Text style={styles.balanceLabel}>{monthLabel} Total Spent</Text>
            <Text style={styles.balanceAmount}>
              {formatCurrency(monthlyTotal, currency)}
            </Text>

            {/* Budget Progress */}
            {budgetLimit > 0 ? (
              <View style={styles.budgetSection}>
                <View style={styles.budgetRow}>
                  <Text style={styles.budgetLabel}>
                    Budget: {formatCurrency(budgetLimit, currency)}
                  </Text>
                  <Text
                    style={[
                      styles.budgetRemaining,
                      { color: overBudget ? COLORS.danger : COLORS.success },
                    ]}>
                    {overBudget
                      ? `Over by ${formatCurrency(Math.abs(budgetRemaining), currency)}`
                      : `${formatCurrency(budgetRemaining, currency)} left`}
                  </Text>
                </View>
                <View style={styles.progressTrack}>
                  <Animated.View
                    style={[
                      styles.progressFill,
                      {
                        width: progressAnim.interpolate({
                          inputRange: [0, 1],
                          outputRange: ['0%', '100%'],
                        }),
                        backgroundColor: overBudget
                          ? COLORS.danger
                          : budgetProgress > 0.8
                          ? COLORS.warning
                          : COLORS.success,
                      },
                    ]}
                  />
                </View>
              </View>
            ) : null}

            {/* Quick Stats */}
            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <Text style={styles.statVal}>{monthlyExpenses.length}</Text>
                <Text style={styles.statLbl}>Transactions</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={styles.statVal}>
                  {monthlyExpenses.length > 0
                    ? formatCurrency(monthlyTotal / monthlyExpenses.length, currency)
                    : formatCurrency(0, currency)}
                </Text>
                <Text style={styles.statLbl}>Avg / Expense</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={styles.statVal}>{topCategories[0]?.[0]?.split(' ')[0] || '—'}</Text>
                <Text style={styles.statLbl}>Top Category</Text>
              </View>
            </View>
          </View>
        </Animated.View>

        {/* Top Categories */}
        {topCategories.length > 0 && (
          <Animated.View style={{ opacity: fadeAnim }}>
            <SectionHeader title="Top Categories" subtitle={monthLabel} />
            <View style={styles.catRow}>
              {topCategories.map(([cat, amount]) => {
                const config = CATEGORY_CONFIG[cat as any];
                return (
                  <View
                    key={cat}
                    style={[styles.catCard, { borderColor: config?.color + '40' }]}>
                    <Text style={styles.catIcon}>{config?.icon}</Text>
                    <Text style={styles.catName} numberOfLines={1}>
                      {cat.split(' ')[0]}
                    </Text>
                    <Text style={[styles.catAmount, { color: config?.color }]}>
                      {formatCurrency(amount, currency)}
                    </Text>
                  </View>
                );
              })}
            </View>
          </Animated.View>
        )}

        {/* Monthly Chart */}
        <Animated.View style={{ opacity: fadeAnim }}>
          <SectionHeader
            title="6-Month Trend"
            subtitle="Monthly spending overview"
          />
          <Card>
            <MonthlyBarChart expenses={expenses} currency={currency} />
          </Card>
        </Animated.View>

        {/* Recent Expenses */}
        <Animated.View style={{ opacity: fadeAnim }}>
          <SectionHeader
            title="Recent Expenses"
            action={{
              label: 'See All',
              onPress: () => {
                // Navigate to expenses tab
              },
            }}
          />
          {recentExpenses.length === 0 ? (
            <Card style={styles.emptyCard}>
              <Text style={styles.emptyEmoji}>💸</Text>
              <Text style={styles.emptyText}>No expenses this month</Text>
              <Text style={styles.emptySub}>Tap + to add your first expense</Text>
              <TouchableOpacity
                style={styles.emptyBtn}
                onPress={() => navigation.navigate('AddExpense', {})}>
                <Text style={styles.emptyBtnText}>Add Expense</Text>
              </TouchableOpacity>
            </Card>
          ) : (
            recentExpenses.map(expense => (
              <ExpenseItem
                key={expense.id}
                expense={expense}
                currency={currency}
                onPress={() =>
                  navigation.navigate('ExpenseDetail', { expense })
                }
              />
            ))
          )}
        </Animated.View>

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
  scroll: {
    flex: 1,
  },
  content: {
    padding: 20,
    paddingTop: 60,
    gap: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  greeting: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: 2,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: COLORS.textPrimary,
    letterSpacing: -0.5,
  },
  addBtn: {
    width: 52,
    height: 52,
    borderRadius: 18,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.5,
    shadowRadius: 12,
    elevation: 10,
  },
  addBtnIcon: {
    fontSize: 28,
    color: '#fff',
    lineHeight: 34,
    fontWeight: '300',
  },
  balanceCard: {
    backgroundColor: COLORS.bgCardElevated,
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    borderColor: COLORS.primaryDark + '60',
    overflow: 'hidden',
    position: 'relative',
  },
  balanceGlow: {
    position: 'absolute',
    top: -40,
    right: -40,
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: COLORS.primary,
    opacity: 0.12,
  },
  balanceLabel: {
    fontSize: 13,
    color: COLORS.textSecondary,
    fontWeight: '600',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  balanceAmount: {
    fontSize: 42,
    fontWeight: '800',
    color: COLORS.textPrimary,
    letterSpacing: -1,
    marginBottom: 20,
  },
  budgetSection: {
    marginBottom: 20,
  },
  budgetRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  budgetLabel: {
    fontSize: 13,
    color: COLORS.textSecondary,
  },
  budgetRemaining: {
    fontSize: 13,
    fontWeight: '700',
  },
  progressTrack: {
    height: 6,
    backgroundColor: COLORS.border,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statVal: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 2,
  },
  statLbl: {
    fontSize: 11,
    color: COLORS.textMuted,
  },
  statDivider: {
    width: 1,
    height: 32,
    backgroundColor: COLORS.border,
  },
  catRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 4,
  },
  catCard: {
    flex: 1,
    backgroundColor: COLORS.bgCard,
    borderRadius: 16,
    padding: 14,
    alignItems: 'center',
    borderWidth: 1,
  },
  catIcon: {
    fontSize: 24,
    marginBottom: 6,
  },
  catName: {
    fontSize: 11,
    color: COLORS.textSecondary,
    fontWeight: '600',
    marginBottom: 4,
  },
  catAmount: {
    fontSize: 13,
    fontWeight: '800',
  },
  emptyCard: {
    alignItems: 'center',
    paddingVertical: 32,
    gap: 8,
  },
  emptyEmoji: {
    fontSize: 48,
    marginBottom: 4,
  },
  emptyText: {
    fontSize: 17,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  emptySub: {
    fontSize: 14,
    color: COLORS.textMuted,
    marginBottom: 8,
  },
  emptyBtn: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
    marginTop: 4,
  },
  emptyBtnText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 14,
  },
});

export default DashboardScreen;
