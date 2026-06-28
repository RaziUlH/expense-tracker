import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  StatusBar,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useExpenses } from '../hooks/useExpenses';
import { COLORS, CATEGORY_CONFIG } from '../constants';
import { formatCurrency, formatDate } from '../utils/helpers';
import { Card } from '../components/Common';
import { RootStackParamList } from '../types';

type DetailRoute = RouteProp<RootStackParamList, 'ExpenseDetail'>;
type Nav = StackNavigationProp<RootStackParamList>;

const ExpenseDetailScreen: React.FC = () => {
  const navigation = useNavigation<Nav>();
  const route = useRoute<DetailRoute>();
  const { deleteExpense, currency } = useExpenses();
  const { expense } = route.params;

  const catConfig = CATEGORY_CONFIG[expense.category];

  const handleDelete = () => {
    Alert.alert('Delete Expense', `Delete "${expense.title}"?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          await deleteExpense(expense.id);
          navigation.goBack();
        },
      },
    ]);
  };

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent={true} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Expense Detail</Text>
        <TouchableOpacity
          style={styles.editBtn}
          onPress={() => navigation.navigate('AddExpense', { expense })}>
          <Text style={styles.editBtnText}>Edit</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* Amount Hero */}
        <View style={styles.heroCard}>
          <View style={styles.heroGlow} />
          <View style={[styles.catIconWrap, { backgroundColor: catConfig?.bg }]}>
            <Text style={styles.catIcon}>{catConfig?.icon}</Text>
          </View>
          <Text style={styles.heroTitle}>{expense.title}</Text>
          <Text style={styles.heroAmount}>
            {formatCurrency(expense.amount, currency)}
          </Text>
          <View style={[styles.categoryPill, { backgroundColor: catConfig?.bg }]}>
            <Text style={[styles.categoryPillText, { color: catConfig?.color }]}>
              {expense.category}
            </Text>
          </View>
        </View>

        {/* Details */}
        <Card>
          <Text style={styles.detailsTitle}>Details</Text>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>📅  Date</Text>
            <Text style={styles.detailValue}>{formatDate(expense.date)}</Text>
          </View>

          <View style={styles.separator} />

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>💰  Amount</Text>
            <Text style={[styles.detailValue, styles.amountValue]}>
              {formatCurrency(expense.amount, currency)}
            </Text>
          </View>

          <View style={styles.separator} />

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>🏷️  Category</Text>
            <Text style={[styles.detailValue, { color: catConfig?.color }]}>
              {expense.category}
            </Text>
          </View>

          {expense.note ? (
            <>
              <View style={styles.separator} />
              <View style={styles.noteRow}>
                <Text style={styles.detailLabel}>📝  Note</Text>
                <Text style={styles.noteValue}>{expense.note}</Text>
              </View>
            </>
          ) : null}
        </Card>

        {/* Actions */}
        <TouchableOpacity
          style={styles.editFullBtn}
          onPress={() => navigation.navigate('AddExpense', { expense })}>
          <Text style={styles.editFullBtnText}>✏️  Edit Expense</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.deleteBtn} onPress={handleDelete}>
          <Text style={styles.deleteBtnText}>🗑️  Delete Expense</Text>
        </TouchableOpacity>

        <View style={{ height: 60 }} />
      </ScrollView>
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
  backBtn: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: COLORS.bgCard,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  backIcon: {
    fontSize: 22,
    color: COLORS.textPrimary,
    lineHeight: 26,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  editBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
    backgroundColor: COLORS.primaryGlow,
    borderWidth: 1,
    borderColor: COLORS.primaryLight + '60',
  },
  editBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.primaryLight,
  },
  content: {
    padding: 20,
    gap: 16,
  },
  heroCard: {
    backgroundColor: COLORS.bgCardElevated,
    borderRadius: 24,
    padding: 28,
    alignItems: 'center',
    gap: 12,
    borderWidth: 1,
    borderColor: COLORS.primaryDark + '60',
    overflow: 'hidden',
    position: 'relative',
  },
  heroGlow: {
    position: 'absolute',
    top: -50,
    right: -50,
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: COLORS.primary,
    opacity: 0.1,
  },
  catIconWrap: {
    width: 72,
    height: 72,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  catIcon: {
    fontSize: 36,
  },
  heroTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: COLORS.textPrimary,
    textAlign: 'center',
  },
  heroAmount: {
    fontSize: 38,
    fontWeight: '800',
    color: COLORS.textPrimary,
    letterSpacing: -1,
  },
  categoryPill: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
  },
  categoryPillText: {
    fontSize: 13,
    fontWeight: '700',
  },
  detailsTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.textPrimary,
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  detailLabel: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  detailValue: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  amountValue: {
    color: COLORS.primaryLight,
    fontSize: 16,
    fontWeight: '800',
  },
  separator: {
    height: 1,
    backgroundColor: COLORS.border,
    marginVertical: 12,
  },
  noteRow: {
    gap: 8,
  },
  noteValue: {
    fontSize: 14,
    color: COLORS.textSecondary,
    lineHeight: 20,
  },
  editFullBtn: {
    backgroundColor: COLORS.primary,
    borderRadius: 18,
    paddingVertical: 16,
    alignItems: 'center',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 10,
  },
  editFullBtnText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#fff',
  },
  deleteBtn: {
    backgroundColor: COLORS.danger + '15',
    borderRadius: 18,
    paddingVertical: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.danger + '50',
  },
  deleteBtnText: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.danger,
  },
});

export default ExpenseDetailScreen;
