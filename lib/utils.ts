import { Expense, ExpenseCategory, ExpenseFilters, ExpenseSummary, DatePreset } from '@/types/expense';

export const formatCurrency = (amount: number): string => {
  // Simple currency formatter without Intl API
  const formatted = amount.toFixed(2);
  const parts = formatted.split('.');
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  return `$${parts.join('.')}`;
};

export const formatDate = (dateString: string): string => {
  // Simple date formatter without Intl API
  const date = new Date(dateString);
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const month = months[date.getMonth()];
  const day = date.getDate();
  const year = date.getFullYear();
  return `${month} ${day}, ${year}`;
};

export const generateId = (): string => {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

export const validateExpenseForm = (
  amount: string,
  description: string,
  date: string
): { isValid: boolean; errors: Record<string, string> } => {
  const errors: Record<string, string> = {};

  if (!amount || parseFloat(amount) <= 0) {
    errors.amount = 'Amount must be greater than 0';
  }

  if (!description || description.trim().length === 0) {
    errors.description = 'Description is required';
  }

  if (!date) {
    errors.date = 'Date is required';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

export const getDateRangeFromPreset = (preset: DatePreset): { startDate: string; endDate: string } => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const getISODate = (date: Date) => date.toISOString().split('T')[0];

  let startDate: Date;
  let endDate: Date = new Date(today);

  switch (preset) {
    case 'today':
      startDate = new Date(today);
      break;

    case 'yesterday':
      startDate = new Date(today);
      startDate.setDate(today.getDate() - 1);
      endDate = new Date(startDate);
      break;

    case 'thisWeek':
      startDate = new Date(today);
      const dayOfWeek = today.getDay();
      startDate.setDate(today.getDate() - dayOfWeek);
      break;

    case 'lastWeek':
      startDate = new Date(today);
      const lastWeekStart = today.getDate() - today.getDay() - 7;
      startDate.setDate(lastWeekStart);
      endDate = new Date(startDate);
      endDate.setDate(startDate.getDate() + 6);
      break;

    case 'thisMonth':
      startDate = new Date(today.getFullYear(), today.getMonth(), 1);
      break;

    case 'lastMonth':
      startDate = new Date(today.getFullYear(), today.getMonth() - 1, 1);
      endDate = new Date(today.getFullYear(), today.getMonth(), 0);
      break;

    case 'last7Days':
      startDate = new Date(today);
      startDate.setDate(today.getDate() - 6);
      break;

    case 'last30Days':
      startDate = new Date(today);
      startDate.setDate(today.getDate() - 29);
      break;

    case 'last90Days':
      startDate = new Date(today);
      startDate.setDate(today.getDate() - 89);
      break;

    case 'thisYear':
      startDate = new Date(today.getFullYear(), 0, 1);
      break;

    case 'lastYear':
      startDate = new Date(today.getFullYear() - 1, 0, 1);
      endDate = new Date(today.getFullYear() - 1, 11, 31);
      break;

    default:
      startDate = new Date(today);
  }

  return {
    startDate: getISODate(startDate),
    endDate: getISODate(endDate),
  };
};

export const getAmountRange = (expenses: Expense[]): { min: number; max: number } => {
  if (expenses.length === 0) {
    return { min: 0, max: 1000 };
  }

  const amounts = expenses.map(exp => exp.amount);
  const min = Math.floor(Math.min(...amounts));
  const max = Math.ceil(Math.max(...amounts));

  return { min, max };
};

export const filterExpenses = (
  expenses: Expense[],
  filters: ExpenseFilters
): Expense[] => {
  return expenses.filter(expense => {
    // Multi-category filter
    if (filters.categories && filters.categories.length > 0) {
      if (!filters.categories.includes(expense.category)) return false;
    }

    // Date range filter
    if (filters.startDate) {
      const expenseDate = new Date(expense.date);
      const startDate = new Date(filters.startDate);
      if (expenseDate < startDate) return false;
    }

    if (filters.endDate) {
      const expenseDate = new Date(expense.date);
      const endDate = new Date(filters.endDate);
      if (expenseDate > endDate) return false;
    }

    // Amount range filter
    if (filters.minAmount !== undefined && expense.amount < filters.minAmount) {
      return false;
    }

    if (filters.maxAmount !== undefined && expense.amount > filters.maxAmount) {
      return false;
    }

    // Search query filter
    if (filters.searchQuery) {
      const query = filters.searchQuery.toLowerCase();
      const matchesDescription = expense.description.toLowerCase().includes(query);
      const matchesCategory = expense.category.toLowerCase().includes(query);
      const matchesAmount = expense.amount.toString().includes(query);

      if (!matchesDescription && !matchesCategory && !matchesAmount) {
        return false;
      }
    }

    return true;
  });
};

export const calculateSummary = (expenses: Expense[]): ExpenseSummary => {
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  const totalSpending = expenses.reduce((sum, exp) => sum + exp.amount, 0);

  const monthlyExpenses = expenses.filter(exp => {
    const expDate = new Date(exp.date);
    return expDate.getMonth() === currentMonth && expDate.getFullYear() === currentYear;
  });

  const monthlySpending = monthlyExpenses.reduce((sum, exp) => sum + exp.amount, 0);

  const categoryBreakdown: Record<ExpenseCategory, number> = {
    Food: 0,
    Transportation: 0,
    Entertainment: 0,
    Shopping: 0,
    Bills: 0,
    Other: 0,
  };

  expenses.forEach(exp => {
    categoryBreakdown[exp.category] += exp.amount;
  });

  return {
    totalSpending,
    monthlySpending,
    categoryBreakdown,
    expenseCount: expenses.length,
    averageExpense: expenses.length > 0 ? totalSpending / expenses.length : 0,
  };
};

export const exportToCSV = (expenses: Expense[]): string => {
  const headers = ['Date', 'Category', 'Amount', 'Description'];
  const rows = expenses.map(exp => [
    formatDate(exp.date),
    exp.category,
    exp.amount.toString(),
    exp.description,
  ]);

  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.map(cell => `"${cell}"`).join(',')),
  ].join('\n');

  return csvContent;
};

export const downloadCSV = (csvContent: string, filename: string = 'expenses.csv'): void => {
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);

  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export const getCategoryColor = (category: ExpenseCategory): string => {
  const colors: Record<ExpenseCategory, string> = {
    Food: 'bg-orange-500',
    Transportation: 'bg-blue-500',
    Entertainment: 'bg-purple-500',
    Shopping: 'bg-pink-500',
    Bills: 'bg-red-500',
    Other: 'bg-gray-500',
  };

  return colors[category];
};

export const getCategoryIcon = (category: ExpenseCategory): string => {
  const icons: Record<ExpenseCategory, string> = {
    Food: '🍔',
    Transportation: '🚗',
    Entertainment: '🎮',
    Shopping: '🛍️',
    Bills: '📄',
    Other: '📌',
  };

  return icons[category];
};
