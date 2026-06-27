import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
} from 'react-native';
import { Expense } from '../types';
import { COLORS, CATEGORY_CONFIG } from '../constants';
import { formatCurrency, formatDate } from '../utils/helpers';

interface ExpenseItemProps {
  expense: Expense;
  currency: string;
  onPress?: () => void;
  onDelete?: () => void;
  showDate?: boolean;
}

const ExpenseItem: React.FC<ExpenseItemProps> = ({
  expense,
  currency,
  onPress,
  showDate = true,
}) => {
  const catConfig = CATEGORY_CONFIG[expense.category];
  const scaleAnim = React.useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.97,
      useNativeDriver: true,
      speed: 20,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      speed: 20,
    }).start();
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      activeOpacity={1}>
      <Animated.View style={[styles.container, { transform: [{ scale: scaleAnim }] }]}>
        {/* Category icon */}
        <View style={[styles.iconWrap, { backgroundColor: catConfig.bg }]}>
          <Text style={styles.icon}>{catConfig.icon}</Text>
        </View>

        {/* Info */}
        <View style={styles.info}>
          <Text style={styles.title} numberOfLines={1}>
            {expense.title}
          </Text>
          <View style={styles.meta}>
            <Text style={[styles.category, { color: catConfig.color }]}>
              {expense.category}
            </Text>
            {showDate && (
              <>
                <Text style={styles.dot}>·</Text>
                <Text style={styles.date}>{formatDate(expense.date)}</Text>
              </>
            )}
          </View>
        </View>

        {/* Amount */}
        <Text style={styles.amount}>
          {formatCurrency(expense.amount, currency)}
        </Text>
      </Animated.View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.bgCard,
    borderRadius: 16,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  iconWrap: {
    width: 46,
    height: 46,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  icon: {
    fontSize: 22,
  },
  info: {
    flex: 1,
  },
  title: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: 4,
  },
  meta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  category: {
    fontSize: 12,
    fontWeight: '600',
  },
  dot: {
    fontSize: 12,
    color: COLORS.textMuted,
  },
  date: {
    fontSize: 12,
    color: COLORS.textMuted,
  },
  amount: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginLeft: 8,
  },
});

export default ExpenseItem;
