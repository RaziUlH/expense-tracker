import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  StatusBar,
  Switch,
  Modal,
  FlatList,
} from 'react-native';
import { useExpenses } from '../hooks/useExpenses';
import { COLORS, CURRENCIES, CURRENCY_SYMBOLS } from '../constants';
import { formatCurrency, getCurrentMonthKey, getMonthLabel } from '../utils/helpers';
import { Card, SectionHeader } from '../components/Common';
import { MonthlyBudget } from '../types';

const SettingsScreen: React.FC = () => {
  const {
    budget,
    setBudget,
    currency,
    setCurrency,
    expenses,
    currentMonth,
  } = useExpenses();

  const [budgetInput, setBudgetInput] = useState(
    budget?.limit ? budget.limit.toString() : ''
  );
  const [showCurrencyPicker, setShowCurrencyPicker] = useState(false);

  const totalExpenses = expenses.reduce((s, e) => s + e.amount, 0);

  const handleSaveBudget = async () => {
    const val = parseFloat(budgetInput);
    if (isNaN(val) || val <= 0) {
      Alert.alert('Invalid Budget', 'Please enter a valid budget amount.');
      return;
    }
    await setBudget({ month: getCurrentMonthKey(), limit: val });
    Alert.alert('✅ Budget saved', `Monthly budget set to ${formatCurrency(val, currency)}`);
  };

  const handleClearData = () => {
    Alert.alert(
      'Clear All Data',
      'This will permanently delete all your expense data. This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete All',
          style: 'destructive',
          onPress: async () => {
            // Data is managed in context; navigation would reset
            Alert.alert('Coming Soon', 'Use the delete button on individual expenses.');
          },
        },
      ]
    );
  };

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.bg} />
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}>

        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Settings</Text>
          <Text style={styles.headerSub}>Customize your experience</Text>
        </View>

        {/* Stats Summary */}
        <View style={styles.statsCard}>
          <View style={styles.statsGlow} />
          <Text style={styles.statsTitle}>Your Data at a Glance</Text>
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statVal}>{expenses.length}</Text>
              <Text style={styles.statLbl}>Total Expenses</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statVal}>
                {formatCurrency(totalExpenses, currency)}
              </Text>
              <Text style={styles.statLbl}>All-Time Spend</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statVal}>{CURRENCY_SYMBOLS[currency] || '$'}</Text>
              <Text style={styles.statLbl}>Currency</Text>
            </View>
          </View>
        </View>

        {/* Budget */}
        <SectionHeader title="Monthly Budget" />
        <Card>
          <Text style={styles.settingDesc}>
            Set a spending limit for {getMonthLabel(currentMonth)} to track your budget.
          </Text>
          <View style={styles.budgetRow}>
            <View style={styles.budgetInput}>
              <Text style={styles.currencyLabel}>
                {CURRENCY_SYMBOLS[currency] || '$'}
              </Text>
              <TextInput
                style={styles.budgetTextInput}
                value={budgetInput}
                onChangeText={setBudgetInput}
                keyboardType="decimal-pad"
                placeholder="0.00"
                placeholderTextColor={COLORS.textMuted}
              />
            </View>
            <TouchableOpacity style={styles.saveBtn} onPress={handleSaveBudget}>
              <Text style={styles.saveBtnText}>Save</Text>
            </TouchableOpacity>
          </View>
          {budget && (
            <Text style={styles.currentBudget}>
              Current: {formatCurrency(budget.limit, currency)} / month
            </Text>
          )}
        </Card>

        {/* Currency */}
        <SectionHeader title="Currency" />
        <Card>
          <Text style={styles.settingDesc}>
            Choose your preferred currency for displaying amounts.
          </Text>
          <TouchableOpacity
            style={styles.currencySelector}
            onPress={() => setShowCurrencyPicker(true)}>
            <View style={styles.currencyDisplay}>
              <Text style={styles.currencySymbolLarge}>
                {CURRENCY_SYMBOLS[currency] || '$'}
              </Text>
              <View>
                <Text style={styles.currencyCode}>{currency}</Text>
                <Text style={styles.currencyName}>Selected currency</Text>
              </View>
            </View>
            <Text style={styles.chevron}>›</Text>
          </TouchableOpacity>
        </Card>

        {/* About */}
        <SectionHeader title="About" />
        <Card>
          <View style={styles.aboutRow}>
            <Text style={styles.aboutIcon}>💸</Text>
            <View style={styles.aboutInfo}>
              <Text style={styles.aboutTitle}>ExpenseTracker</Text>
              <Text style={styles.aboutVersion}>Version 1.0.0</Text>
            </View>
          </View>
          <Text style={styles.aboutDesc}>
            A beautiful, offline-first expense tracker with local storage and
            insightful charts. All your data stays private on your device.
          </Text>
        </Card>

        {/* Danger Zone */}
        <SectionHeader title="Danger Zone" />
        <Card style={styles.dangerCard}>
          <Text style={styles.dangerDesc}>
            Permanently delete all expense data. This cannot be undone.
          </Text>
          <TouchableOpacity style={styles.dangerBtn} onPress={handleClearData}>
            <Text style={styles.dangerBtnText}>🗑️  Clear All Data</Text>
          </TouchableOpacity>
        </Card>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Currency Picker Modal */}
      <Modal
        visible={showCurrencyPicker}
        animationType="slide"
        transparent
        onRequestClose={() => setShowCurrencyPicker(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalSheet}>
            <View style={styles.modalHandle} />
            <Text style={styles.modalTitle}>Select Currency</Text>
            <FlatList
              data={CURRENCIES}
              keyExtractor={item => item}
              renderItem={({ item }) => {
                const isSelected = item === currency;
                return (
                  <TouchableOpacity
                    style={[styles.currOption, isSelected && styles.currOptionSelected]}
                    onPress={async () => {
                      await setCurrency(item);
                      setShowCurrencyPicker(false);
                    }}>
                    <Text style={styles.currOptionSymbol}>
                      {CURRENCY_SYMBOLS[item]}
                    </Text>
                    <Text style={styles.currOptionCode}>{item}</Text>
                    {isSelected && (
                      <View style={styles.currCheck}>
                        <Text style={styles.currCheckTick}>✓</Text>
                      </View>
                    )}
                  </TouchableOpacity>
                );
              }}
            />
            <TouchableOpacity
              style={styles.modalClose}
              onPress={() => setShowCurrencyPicker(false)}>
              <Text style={styles.modalCloseText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
  statsCard: {
    backgroundColor: COLORS.bgCardElevated,
    borderRadius: 24,
    padding: 22,
    borderWidth: 1,
    borderColor: COLORS.primaryDark + '60',
    overflow: 'hidden',
    position: 'relative',
  },
  statsGlow: {
    position: 'absolute',
    top: -30,
    left: -30,
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: COLORS.secondary,
    opacity: 0.1,
  },
  statsTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.textSecondary,
    marginBottom: 16,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
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
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.textPrimary,
    marginBottom: 2,
  },
  statLbl: {
    fontSize: 11,
    color: COLORS.textMuted,
    textAlign: 'center',
  },
  statDivider: {
    width: 1,
    height: 36,
    backgroundColor: COLORS.border,
  },
  settingDesc: {
    fontSize: 13,
    color: COLORS.textSecondary,
    lineHeight: 20,
    marginBottom: 14,
  },
  budgetRow: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'center',
  },
  budgetInput: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.bgInput,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    gap: 8,
  },
  currencyLabel: {
    fontSize: 18,
    color: COLORS.primaryLight,
    fontWeight: '700',
  },
  budgetTextInput: {
    flex: 1,
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  saveBtn: {
    backgroundColor: COLORS.primary,
    borderRadius: 14,
    paddingHorizontal: 20,
    paddingVertical: 12,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 8,
  },
  saveBtnText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#fff',
  },
  currentBudget: {
    fontSize: 12,
    color: COLORS.success,
    fontWeight: '600',
    marginTop: 10,
  },
  currencySelector: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.bgInput,
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  currencyDisplay: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  currencySymbolLarge: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.primaryLight,
    width: 36,
    textAlign: 'center',
  },
  currencyCode: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  currencyName: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  chevron: {
    fontSize: 24,
    color: COLORS.textMuted,
  },
  aboutRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    marginBottom: 12,
  },
  aboutIcon: {
    fontSize: 44,
  },
  aboutInfo: {
    gap: 4,
  },
  aboutTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  aboutVersion: {
    fontSize: 13,
    color: COLORS.textSecondary,
  },
  aboutDesc: {
    fontSize: 13,
    color: COLORS.textSecondary,
    lineHeight: 20,
  },
  dangerCard: {
    borderColor: COLORS.danger + '40',
  },
  dangerDesc: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginBottom: 14,
    lineHeight: 20,
  },
  dangerBtn: {
    backgroundColor: COLORS.danger + '20',
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.danger + '60',
  },
  dangerBtnText: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.danger,
  },
  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    backgroundColor: COLORS.bgModal,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingTop: 12,
    paddingHorizontal: 20,
    paddingBottom: 40,
    borderTopWidth: 1,
    borderColor: COLORS.border,
  },
  modalHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: COLORS.textMuted,
    alignSelf: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: COLORS.textPrimary,
    marginBottom: 16,
    textAlign: 'center',
  },
  currOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 14,
    marginBottom: 6,
    backgroundColor: COLORS.bgCard,
    borderWidth: 1,
    borderColor: COLORS.border,
    gap: 12,
  },
  currOptionSelected: {
    borderColor: COLORS.primaryLight,
    backgroundColor: COLORS.primaryGlow,
  },
  currOptionSymbol: {
    fontSize: 22,
    fontWeight: '700',
    color: COLORS.primaryLight,
    width: 36,
    textAlign: 'center',
  },
  currOptionCode: {
    flex: 1,
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  currCheck: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  currCheckTick: {
    fontSize: 12,
    color: '#fff',
    fontWeight: '800',
  },
  modalClose: {
    backgroundColor: COLORS.bgCard,
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  modalCloseText: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.textSecondary,
  },
});

export default SettingsScreen;
