import { Expense } from '@/types/expense';

const STORAGE_KEY = 'expense-tracker-expenses';

export const storageUtils = {
  getExpenses: (): Expense[] => {
    if (typeof window === 'undefined') return [];

    try {
      const data = localStorage.getItem(STORAGE_KEY);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error reading from localStorage:', error);
      return [];
    }
  },

  saveExpenses: (expenses: Expense[]): void => {
    if (typeof window === 'undefined') return;

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(expenses));
    } catch (error) {
      console.error('Error saving to localStorage:', error);
    }
  },

  addExpense: (expense: Expense): void => {
    const expenses = storageUtils.getExpenses();
    expenses.push(expense);
    storageUtils.saveExpenses(expenses);
  },

  updateExpense: (id: string, updatedExpense: Expense): void => {
    const expenses = storageUtils.getExpenses();
    const index = expenses.findIndex(exp => exp.id === id);

    if (index !== -1) {
      expenses[index] = updatedExpense;
      storageUtils.saveExpenses(expenses);
    }
  },

  deleteExpense: (id: string): void => {
    const expenses = storageUtils.getExpenses();
    const filtered = expenses.filter(exp => exp.id !== id);
    storageUtils.saveExpenses(filtered);
  },

  clearAll: (): void => {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(STORAGE_KEY);
  },
};
