import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { BarChart, PieChart } from 'react-native-chart-kit';
import { Expense, ExpenseCategory } from '../types';
import { COLORS, CATEGORY_CONFIG } from '../constants';
import {
  getLast6Months,
  getMonthlyTotals,
  getMonthLabel,
  getTotalByCategory,
  formatCurrency,
} from '../utils/helpers';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CHART_WIDTH = SCREEN_WIDTH - 48;

// ─── Monthly Bar Chart ────────────────────────────────────────────────────────
interface MonthlyChartProps {
  expenses: Expense[];
  currency: string;
}

export const MonthlyBarChart: React.FC<MonthlyChartProps> = ({
  expenses,
  currency,
}) => {
  const months = getLast6Months();
  const totals = getMonthlyTotals(expenses, months);
  const labels = months.map(m => getMonthLabel(m).split(' ')[0]); // Just month name

  const chartConfig = {
    backgroundColor: 'transparent',
    backgroundGradientFrom: COLORS.bgCard,
    backgroundGradientTo: COLORS.bgCard,
    decimalPlaces: 0,
    color: (opacity = 1) => `rgba(124, 58, 237, ${opacity})`,
    labelColor: () => COLORS.textSecondary,
    style: { borderRadius: 16 },
    propsForBackgroundLines: {
      strokeDasharray: '',
      stroke: COLORS.border,
      strokeWidth: 1,
    },
    barPercentage: 0.7,
    fillShadowGradientFrom: COLORS.primary,
    fillShadowGradientTo: COLORS.primaryLight,
    fillShadowGradientOpacity: 1,
  };

  const hasData = totals.some(t => t > 0);

  if (!hasData) {
    return (
      <View style={styles.emptyChart}>
        <Text style={styles.emptyChartEmoji}>📊</Text>
        <Text style={styles.emptyChartText}>No data yet</Text>
        <Text style={styles.emptyChartSub}>Add expenses to see your chart</Text>
      </View>
    );
  }

  return (
    <View>
      <BarChart
        data={{ labels, datasets: [{ data: totals }] }}
        width={CHART_WIDTH}
        height={200}
        chartConfig={chartConfig}
        style={styles.chart}
        fromZero
        showValuesOnTopOfBars={false}
        withInnerLines
        yAxisLabel=""
        yAxisSuffix=""
      />
    </View>
  );
};

// ─── Pie Chart by Category ────────────────────────────────────────────────────
interface CategoryChartProps {
  expenses: Expense[];
  currency: string;
}

export const CategoryPieChart: React.FC<CategoryChartProps> = ({
  expenses,
  currency,
}) => {
  const totals = getTotalByCategory(expenses);
  const entries = Object.entries(totals)
    .filter(([, v]) => v > 0)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 8);

  if (entries.length === 0) {
    return (
      <View style={styles.emptyChart}>
        <Text style={styles.emptyChartEmoji}>🥧</Text>
        <Text style={styles.emptyChartText}>No data yet</Text>
        <Text style={styles.emptyChartSub}>Add expenses to see breakdown</Text>
      </View>
    );
  }

  const chartColors = [
    '#7C3AED', '#06B6D4', '#10B981', '#F59E0B',
    '#EF4444', '#F97316', '#8B5CF6', '#EC4899',
  ];

  const pieData = entries.map(([cat, amount], i) => ({
    name: cat,
    amount,
    color: chartColors[i % chartColors.length],
    legendFontColor: COLORS.textSecondary,
    legendFontSize: 12,
  }));

  const total = entries.reduce((s, [, v]) => s + v, 0);

  const chartConfig = {
    color: (opacity = 1) => `rgba(124, 58, 237, ${opacity})`,
    labelColor: () => COLORS.textSecondary,
    backgroundColor: 'transparent',
    backgroundGradientFrom: COLORS.bgCard,
    backgroundGradientTo: COLORS.bgCard,
  };

  return (
    <View>
      <PieChart
        data={pieData}
        width={CHART_WIDTH}
        height={200}
        chartConfig={chartConfig}
        accessor="amount"
        backgroundColor="transparent"
        paddingLeft="10"
        absolute={false}
      />
      {/* Legend */}
      <View style={styles.legend}>
        {entries.map(([cat, amount], i) => (
          <View key={cat} style={styles.legendItem}>
            <View
              style={[
                styles.legendDot,
                { backgroundColor: chartColors[i % chartColors.length] },
              ]}
            />
            <Text style={styles.legendCat} numberOfLines={1}>
              {CATEGORY_CONFIG[cat as ExpenseCategory]?.icon} {cat}
            </Text>
            <Text style={styles.legendPct}>
              {((amount / total) * 100).toFixed(0)}%
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  chart: {
    borderRadius: 16,
    marginVertical: 4,
  },
  emptyChart: {
    height: 160,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  emptyChartEmoji: {
    fontSize: 40,
  },
  emptyChartText: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.textSecondary,
  },
  emptyChartSub: {
    fontSize: 13,
    color: COLORS.textMuted,
  },
  legend: {
    marginTop: 12,
    gap: 8,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  legendCat: {
    flex: 1,
    fontSize: 13,
    color: COLORS.textSecondary,
  },
  legendPct: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
});
