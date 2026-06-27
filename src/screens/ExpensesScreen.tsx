import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SectionList,
  TouchableOpacity,
  TextInput,
  StatusBar,
  Alert,
  Animated,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { Swipeable } from 'react-native-gesture-handler';
import { useExpenses } from '../hooks/useExpenses';
import { COLORS, CATEGORIES, CATEGORY_CONFIG } from '../constants';
import {
  formatCurrency,
  formatDate,
  groupExpensesByDate,
  filterExpensesByMonth,
} from '../utils/helpers';
import ExpenseItem from '../components/ExpenseItem';
import { SectionHeader } from '../components/Common';
import { Expense, ExpenseCategory, RootStackParamList } from '../types';

type Nav = StackNavigationProp<RootStackParamList>;

const ExpensesScreen: React.FC = () => {
  const navigation = useNavigation<Nav>();
  const { expenses, currency, deleteExpense } = useExpenses();
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<
    ExpenseCategory | null
  >(null);

  const filtered = expenses.filter(e => {
    const matchSearch =
      !search ||
      e.title.toLowerCase().includes(search.toLowerCase()) ||
      e.category.toLowerCase().includes(search.toLowerCase());
    const matchCat = !selectedCategory || e.category === selectedCategory;
    return matchSearch && matchCat;
  });

  const grouped = groupExpensesByDate(filtered);
  const sections = grouped.map(g => ({
    title: g.date,
    data: g.items,
    total: g.items.reduce((s, e) => s + e.amount, 0),
  }));

  const handleDelete = (expense: Expense) => {
    Alert.alert(
      'Delete Expense',
      `Delete "${expense.title}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => deleteExpense(expense.id),
        },
      ]
    );
  };

  const renderRightActions = (expense: Expense) => (
    _: Animated.AnimatedInterpolation<number>,
    dragX: Animated.AnimatedInterpolation<number>
  ) => {
    const scale = dragX.interpolate({
      inputRange: [-80, 0],
      outputRange: [1, 0.5],
      extrapolate: 'clamp',
    });
    return (
      <TouchableOpacity
        style={styles.deleteAction}
        onPress={() => handleDelete(expense)}>
        <Animated.Text style={[styles.deleteIcon, { transform: [{ scale }] }]}>
          🗑️
        </Animated.Text>
        <Text style={styles.deleteLabel}>Delete</Text>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.bg} />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>All Expenses</Text>
        <TouchableOpacity
          style={styles.addBtn}
          onPress={() => navigation.navigate('AddExpense', {})}>
          <Text style={styles.addBtnText}>+</Text>
        </TouchableOpacity>
      </View>

      {/* Search */}
      <View style={styles.searchWrap}>
        <Text style={styles.searchIcon}>🔍</Text>
        <TextInput
          style={styles.searchInput}
          value={search}
          onChangeText={setSearch}
          placeholder="Search expenses..."
          placeholderTextColor={COLORS.textMuted}
        />
        {search ? (
          <TouchableOpacity onPress={() => setSearch('')}>
            <Text style={styles.clearBtn}>✕</Text>
          </TouchableOpacity>
        ) : null}
      </View>

      {/* Category Filter */}
      <View style={styles.filterWrap}>
        <TouchableOpacity
          style={[styles.filterChip, !selectedCategory && styles.filterChipActive]}
          onPress={() => setSelectedCategory(null)}>
          <Text
            style={[
              styles.filterChipText,
              !selectedCategory && styles.filterChipTextActive,
            ]}>
            All
          </Text>
        </TouchableOpacity>
        {CATEGORIES.map(cat => {
          const cfg = CATEGORY_CONFIG[cat];
          const isActive = selectedCategory === cat;
          return (
            <TouchableOpacity
              key={cat}
              style={[
                styles.filterChip,
                isActive && { backgroundColor: cfg.bg, borderColor: cfg.color },
              ]}
              onPress={() =>
                setSelectedCategory(isActive ? null : cat)
              }>
              <Text style={styles.filterChipIcon}>{cfg.icon}</Text>
              {isActive && (
                <Text style={[styles.filterChipText, { color: cfg.color }]}>
                  {cat.split(' ')[0]}
                </Text>
              )}
            </TouchableOpacity>
          );
        })}
      </View>

      {/* List */}
      {sections.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyEmoji}>🔍</Text>
          <Text style={styles.emptyText}>
            {search || selectedCategory
              ? 'No expenses match your filter'
              : 'No expenses yet'}
          </Text>
          <Text style={styles.emptySub}>
            {!search && !selectedCategory
              ? 'Tap + to add your first expense'
              : 'Try changing your search or filter'}
          </Text>
        </View>
      ) : (
        <SectionList
          sections={sections}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          renderSectionHeader={({ section }) => (
            <View style={styles.dateHeader}>
              <Text style={styles.dateLabel}>
                {new Date(section.title).toLocaleDateString('en-US', {
                  weekday: 'long',
                  month: 'long',
                  day: 'numeric',
                })}
              </Text>
              <Text style={styles.dateTotalLabel}>
                {formatCurrency(section.total, currency)}
              </Text>
            </View>
          )}
          renderItem={({ item }) => (
            <Swipeable renderRightActions={renderRightActions(item)}>
              <ExpenseItem
                expense={item}
                currency={currency}
                showDate={false}
                onPress={() => navigation.navigate('ExpenseDetail', { expense: item })}
              />
            </Swipeable>
          )}
          stickySectionHeadersEnabled={false}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 16,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: COLORS.textPrimary,
    letterSpacing: -0.5,
  },
  addBtn: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 8,
  },
  addBtnText: {
    fontSize: 26,
    color: '#fff',
    lineHeight: 30,
    fontWeight: '300',
  },
  searchWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.bgInput,
    borderRadius: 16,
    marginHorizontal: 20,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
    gap: 10,
    marginBottom: 12,
  },
  searchIcon: {
    fontSize: 16,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: COLORS.textPrimary,
  },
  clearBtn: {
    fontSize: 14,
    color: COLORS.textMuted,
    padding: 4,
  },
  filterWrap: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 8,
    marginBottom: 8,
    flexWrap: 'nowrap',
    overflow: 'hidden',
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.bgCard,
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: COLORS.border,
    gap: 4,
  },
  filterChipActive: {
    backgroundColor: COLORS.primaryGlow,
    borderColor: COLORS.primaryLight,
  },
  filterChipText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.textSecondary,
  },
  filterChipTextActive: {
    color: COLORS.primaryLight,
  },
  filterChipIcon: {
    fontSize: 14,
  },
  list: {
    padding: 20,
    paddingTop: 8,
    paddingBottom: 100,
  },
  dateHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 10,
    paddingTop: 16,
  },
  dateLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.textSecondary,
  },
  dateTotalLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.primaryLight,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingBottom: 80,
  },
  emptyEmoji: {
    fontSize: 52,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.textSecondary,
  },
  emptySub: {
    fontSize: 14,
    color: COLORS.textMuted,
  },
  deleteAction: {
    backgroundColor: COLORS.danger + 'CC',
    borderRadius: 16,
    marginBottom: 10,
    marginLeft: 8,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    gap: 4,
  },
  deleteIcon: {
    fontSize: 22,
  },
  deleteLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#fff',
  },
});

export default ExpensesScreen;
