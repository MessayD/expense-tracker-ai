// Default categories that ship with the app
export const DEFAULT_CATEGORIES = [
  'Food',
  'Transportation',
  'Entertainment',
  'Shopping',
  'Bills',
  'Other',
] as const;

export type DefaultCategory = typeof DEFAULT_CATEGORIES[number];

// Category can be a default or custom string
export type ExpenseCategory = string;

export interface CustomCategory {
  id: string;
  name: string;
  icon: string;
  color: string;
  createdAt: string;
  isDefault?: boolean;
}

export interface Expense {
  id: string;
  date: string; // ISO date string
  amount: number;
  category: ExpenseCategory;
  description: string;
  createdAt: string; // ISO date string
  updatedAt: string; // ISO date string
}

export interface ExpenseFormData {
  date: string;
  amount: string;
  category: ExpenseCategory;
  description: string;
}

export type DatePreset =
  | 'today'
  | 'yesterday'
  | 'thisWeek'
  | 'lastWeek'
  | 'thisMonth'
  | 'lastMonth'
  | 'last7Days'
  | 'last30Days'
  | 'last90Days'
  | 'thisYear'
  | 'lastYear'
  | 'custom';

export interface ExpenseFilters {
  categories?: ExpenseCategory[];
  startDate?: string;
  endDate?: string;
  searchQuery?: string;
  datePreset?: DatePreset;
  minAmount?: number;
  maxAmount?: number;
}

export interface ExpenseSummary {
  totalSpending: number;
  monthlySpending: number;
  categoryBreakdown: Record<ExpenseCategory, number>;
  expenseCount: number;
  averageExpense: number;
}

// ========== INTELLIGENT BUDGET TYPES ==========

export interface CategoryBudget {
  category: ExpenseCategory;
  monthlyLimit: number;
  spent: number;
  remaining: number;
  percentageUsed: number;
}

export interface BudgetSettings {
  budgets: Record<ExpenseCategory, number>;
  currency: string;
}

export interface RecurringExpense {
  description: string;
  category: ExpenseCategory;
  averageAmount: number;
  frequency: 'daily' | 'weekly' | 'monthly';
  occurrences: number;
  confidence: number;
  lastOccurrence: string;
  nextExpected: string;
}

export interface SmartInsight {
  id: string;
  type: 'warning' | 'tip' | 'achievement' | 'prediction';
  title: string;
  message: string;
  category?: ExpenseCategory;
  amount?: number;
  date: string;
  priority: number;
}

export interface FinancialHealth {
  score: number;
  level: 'Excellent' | 'Good' | 'Fair' | 'Poor';
  factors: {
    budgetAdherence: number;
    savingsRate: number;
    spendingTrend: number;
    categoryBalance: number;
  };
  recommendations: string[];
}

export interface SavingsGoal {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  deadline: string;
  category?: ExpenseCategory;
  priority: 'high' | 'medium' | 'low';
  createdAt: string;
  updatedAt: string;
}
