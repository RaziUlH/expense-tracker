import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Switch,
  Alert,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
  Modal,
  FlatList,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useExpenses } from '../hooks/useExpenses';
import { COLORS, CATEGORIES, CATEGORY_CONFIG } from '../constants';
import { generateId } from '../utils/helpers';
import { Expense, ExpenseCategory, RootStackParamList } from '../types';

type AddRoute = RouteProp<RootStackParamList, 'AddExpense'>;

const AddExpenseScreen: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute<AddRoute>();
  const { addExpense, updateExpense, currency } = useExpenses();
  const editExpense = route.params?.expense;
  const isEdit = !!editExpense;

  const [title, setTitle] = useState(editExpense?.title || '');
  const [amount, setAmount] = useState(editExpense ? editExpense.amount.toString() : '');
  const [category, setCategory] = useState<ExpenseCategory>(
    editExpense?.category || 'Food & Dining'
  );
  const [note, setNote] = useState(editExpense?.note || '');
  const [date, setDate] = useState(
    editExpense ? new Date(editExpense.date) : new Date()
  );
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showCategoryPicker, setShowCategoryPicker] = useState(false);
  const [saving, setSaving] = useState(false);

  const selectedCat = CATEGORY_CONFIG[category];

  const handleSave = async () => {
    if (!title.trim()) {
      Alert.alert('Required', 'Please enter a title for this expense.');
      return;
    }
    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      Alert.alert('Invalid Amount', 'Please enter a valid amount greater than 0.');
      return;
    }
    setSaving(true);
    try {
      const expense: Expense = {
        id: editExpense?.id || generateId(),
        title: title.trim(),
        amount: parsedAmount,
        category,
        date: date.toISOString(),
        note: note.trim() || undefined,
      };
      if (isEdit) {
        await updateExpense(expense);
      } else {
        await addExpense(expense);
      }
      navigation.goBack();
    } catch {
      Alert.alert('Error', 'Failed to save expense.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.bg} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{isEdit ? 'Edit Expense' : 'Add Expense'}</Text>
        <View style={{ width: 44 }} />
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled">

        {/* Amount Input */}
        <View style={styles.amountCard}>
          <View style={styles.amountGlow} />
          <Text style={styles.amountLabel}>Amount</Text>
          <View style={styles.amountRow}>
            <Text style={styles.currencySymbol}>
              {currency === 'USD' ? '$' : currency === 'EUR' ? '€' : currency === 'GBP' ? '£' : currency === 'INR' ? '₹' : '$'}
            </Text>
            <TextInput
              style={styles.amountInput}
              value={amount}
              onChangeText={setAmount}
              keyboardType="decimal-pad"
              placeholder="0.00"
              placeholderTextColor={COLORS.textMuted}
              autoFocus={!isEdit}
            />
          </View>
        </View>

        {/* Title */}
        <View style={styles.field}>
          <Text style={styles.fieldLabel}>Title</Text>
          <TextInput
            style={styles.input}
            value={title}
            onChangeText={setTitle}
            placeholder="What did you spend on?"
            placeholderTextColor={COLORS.textMuted}
          />
        </View>

        {/* Category */}
        <View style={styles.field}>
          <Text style={styles.fieldLabel}>Category</Text>
          <TouchableOpacity
            style={styles.categoryBtn}
            onPress={() => setShowCategoryPicker(true)}>
            <View
              style={[styles.catIconWrap, { backgroundColor: selectedCat.bg }]}>
              <Text style={styles.catIcon}>{selectedCat.icon}</Text>
            </View>
            <Text style={styles.categoryText}>{category}</Text>
            <Text style={styles.chevron}>›</Text>
          </TouchableOpacity>
        </View>

        {/* Date */}
        <View style={styles.field}>
          <Text style={styles.fieldLabel}>Date</Text>
          <TouchableOpacity
            style={styles.input}
            onPress={() => setShowDatePicker(true)}>
            <Text style={styles.dateText}>
              📅{'  '}
              {date.toLocaleDateString('en-US', {
                weekday: 'short',
                year: 'numeric',
                month: 'short',
                day: 'numeric',
              })}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Note */}
        <View style={styles.field}>
          <Text style={styles.fieldLabel}>Note (optional)</Text>
          <TextInput
            style={[styles.input, styles.noteInput]}
            value={note}
            onChangeText={setNote}
            placeholder="Add a note..."
            placeholderTextColor={COLORS.textMuted}
            multiline
            numberOfLines={3}
            textAlignVertical="top"
          />
        </View>

        {/* Save Button */}
        <TouchableOpacity
          style={[styles.saveBtn, saving && styles.saveBtnDisabled]}
          onPress={handleSave}
          disabled={saving}>
          <Text style={styles.saveBtnText}>
            {saving ? 'Saving...' : isEdit ? 'Save Changes' : 'Add Expense'}
          </Text>
        </TouchableOpacity>

        <View style={{ height: 40 }} />
      </ScrollView>

      {/* Date Picker */}
      {showDatePicker && (
        <DateTimePicker
          value={date}
          mode="date"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={(_, selected) => {
            setShowDatePicker(false);
            if (selected) setDate(selected);
          }}
          maximumDate={new Date()}
          themeVariant="dark"
        />
      )}

      {/* Category Picker Modal */}
      <Modal
        visible={showCategoryPicker}
        animationType="slide"
        transparent
        onRequestClose={() => setShowCategoryPicker(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalSheet}>
            <View style={styles.modalHandle} />
            <Text style={styles.modalTitle}>Select Category</Text>
            <FlatList
              data={CATEGORIES}
              keyExtractor={item => item}
              numColumns={2}
              columnWrapperStyle={styles.catGrid}
              renderItem={({ item }) => {
                const cfg = CATEGORY_CONFIG[item];
                const isSelected = item === category;
                return (
                  <TouchableOpacity
                    style={[
                      styles.catOption,
                      isSelected && styles.catOptionSelected,
                      isSelected && { borderColor: cfg.color },
                    ]}
                    onPress={() => {
                      setCategory(item);
                      setShowCategoryPicker(false);
                    }}>
                    <View
                      style={[styles.catOptionIcon, { backgroundColor: cfg.bg }]}>
                      <Text style={styles.catOptionEmoji}>{cfg.icon}</Text>
                    </View>
                    <Text
                      style={[
                        styles.catOptionLabel,
                        isSelected && { color: cfg.color },
                      ]}
                      numberOfLines={2}>
                      {item}
                    </Text>
                    {isSelected && (
                      <View
                        style={[styles.catCheck, { backgroundColor: cfg.color }]}>
                        <Text style={styles.catCheckTick}>✓</Text>
                      </View>
                    )}
                  </TouchableOpacity>
                );
              }}
            />
            <TouchableOpacity
              style={styles.modalClose}
              onPress={() => setShowCategoryPicker(false)}>
              <Text style={styles.modalCloseText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </KeyboardAvoidingView>
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
  content: {
    padding: 20,
    gap: 16,
  },
  amountCard: {
    backgroundColor: COLORS.bgCardElevated,
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    borderColor: COLORS.primaryDark + '60',
    overflow: 'hidden',
    position: 'relative',
    alignItems: 'center',
    marginBottom: 4,
  },
  amountGlow: {
    position: 'absolute',
    top: -40,
    right: -40,
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: COLORS.primary,
    opacity: 0.15,
  },
  amountLabel: {
    fontSize: 12,
    color: COLORS.textSecondary,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 12,
  },
  amountRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  currencySymbol: {
    fontSize: 32,
    fontWeight: '300',
    color: COLORS.primaryLight,
  },
  amountInput: {
    fontSize: 48,
    fontWeight: '800',
    color: COLORS.textPrimary,
    minWidth: 120,
    textAlign: 'center',
    letterSpacing: -1,
  },
  field: {
    gap: 8,
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginLeft: 4,
  },
  input: {
    backgroundColor: COLORS.bgInput,
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 15,
    color: COLORS.textPrimary,
    borderWidth: 1,
    borderColor: COLORS.border,
    justifyContent: 'center',
  },
  noteInput: {
    height: 90,
    paddingTop: 14,
  },
  dateText: {
    fontSize: 15,
    color: COLORS.textPrimary,
  },
  categoryBtn: {
    backgroundColor: COLORS.bgInput,
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
    gap: 12,
  },
  catIconWrap: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  catIcon: {
    fontSize: 20,
  },
  categoryText: {
    flex: 1,
    fontSize: 15,
    color: COLORS.textPrimary,
    fontWeight: '500',
  },
  chevron: {
    fontSize: 22,
    color: COLORS.textMuted,
  },
  saveBtn: {
    backgroundColor: COLORS.primary,
    borderRadius: 18,
    paddingVertical: 18,
    alignItems: 'center',
    marginTop: 8,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 12,
  },
  saveBtnDisabled: {
    opacity: 0.6,
  },
  saveBtnText: {
    fontSize: 17,
    fontWeight: '800',
    color: '#fff',
    letterSpacing: 0.3,
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
    maxHeight: '80%',
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
  catGrid: {
    gap: 10,
    marginBottom: 10,
  },
  catOption: {
    flex: 1,
    backgroundColor: COLORS.bgCard,
    borderRadius: 16,
    padding: 14,
    alignItems: 'center',
    gap: 8,
    borderWidth: 2,
    borderColor: 'transparent',
    position: 'relative',
  },
  catOptionSelected: {
    borderWidth: 2,
  },
  catOptionIcon: {
    width: 48,
    height: 48,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  catOptionEmoji: {
    fontSize: 24,
  },
  catOptionLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  catCheck: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 18,
    height: 18,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
  },
  catCheckTick: {
    fontSize: 10,
    color: '#fff',
    fontWeight: '800',
  },
  modalClose: {
    backgroundColor: COLORS.bgCard,
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  modalCloseText: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.textSecondary,
  },
});

export default AddExpenseScreen;
