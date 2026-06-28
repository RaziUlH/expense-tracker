import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { NavigationContainer } from '@react-navigation/native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import DashboardScreen from '../screens/DashboardScreen';
import ExpensesScreen from '../screens/ExpensesScreen';
import AnalyticsScreen from '../screens/AnalyticsScreen';
import SettingsScreen from '../screens/SettingsScreen';
import AddExpenseScreen from '../screens/AddExpenseScreen';
import ExpenseDetailScreen from '../screens/ExpenseDetailScreen';

import { COLORS } from '../constants';
import { RootStackParamList, TabParamList } from '../types';
import { ExpenseProvider } from '../hooks/useExpenses';

const Tab = createBottomTabNavigator<TabParamList>();
const Stack = createStackNavigator<RootStackParamList>();

const TAB_ICONS: Record<string, string> = {
  Dashboard: '🏠',
  Expenses: '💳',
  Analytics: '📊',
  Settings: '⚙️',
};

function TabBar({ state, descriptors, navigation }: any) {
  return (
    <View style={tabStyles.container}>
      {state.routes.map((route: any, index: number) => {
        const isFocused = state.index === index;
        const icon = TAB_ICONS[route.name] || '•';
        return (
          <TouchableOpacity
            key={route.key}
            style={[tabStyles.tab, isFocused && tabStyles.tabActive]}
            onPress={() => navigation.navigate(route.name)}
            activeOpacity={0.7}
          >
            <Text style={tabStyles.icon}>{icon}</Text>
            <Text style={[tabStyles.label, isFocused && tabStyles.labelActive]}>
              {route.name}
            </Text>
            {isFocused && <View style={tabStyles.activeDot} />}
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const tabStyles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: COLORS.bgCardElevated,
    paddingBottom: 20,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
    paddingVertical: 6,
    borderRadius: 14,
    marginHorizontal: 4,
    position: 'relative',
  },
  tabActive: {
    backgroundColor: COLORS.primaryGlow,
  },
  icon: {
    fontSize: 22,
  },
  label: {
    fontSize: 10,
    fontWeight: '600',
    color: COLORS.textMuted,
  },
  labelActive: {
    color: COLORS.primaryLight,
    fontWeight: '800',
  },
  activeDot: {
    position: 'absolute',
    bottom: 2,
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: COLORS.primaryLight,
  },
});

function MainTabs() {
  return (
    <Tab.Navigator
      tabBar={props => <TabBar {...props} />}
      screenOptions={{ headerShown: false }}
    >
      <Tab.Screen name="Dashboard" component={DashboardScreen} />
      <Tab.Screen name="Expenses" component={ExpensesScreen} />
      <Tab.Screen name="Analytics" component={AnalyticsScreen} />
      <Tab.Screen name="Settings" component={SettingsScreen} />
    </Tab.Navigator>
  );
}

export default function AppNavigator() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ExpenseProvider>
        <NavigationContainer>
          <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen name="MainTabs" component={MainTabs} />
            <Stack.Screen
              name="AddExpense"
              component={AddExpenseScreen}
              options={{ presentation: 'modal' }}
            />
            <Stack.Screen
              name="ExpenseDetail"
              component={ExpenseDetailScreen}
            />
          </Stack.Navigator>
        </NavigationContainer>
      </ExpenseProvider>
    </GestureHandlerRootView>
  );
}
