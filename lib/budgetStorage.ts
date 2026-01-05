import { BudgetSettings, SavingsGoal } from '@/types/expense';

const BUDGET_KEY = 'expense-tracker-budgets';
const GOALS_KEY = 'expense-tracker-goals';

export const budgetStorage = {
  getBudgetSettings: (): BudgetSettings => {
    if (typeof window === 'undefined')
      return {
        budgets: {
          Food: 0,
          Transportation: 0,
          Entertainment: 0,
          Shopping: 0,
          Bills: 0,
          Other: 0,
        },
        currency: 'USD',
      };

    try {
      const data = localStorage.getItem(BUDGET_KEY);
      if (!data) {
        return {
          budgets: {
            Food: 0,
            Transportation: 0,
            Entertainment: 0,
            Shopping: 0,
            Bills: 0,
            Other: 0,
          },
          currency: 'USD',
        };
      }
      return JSON.parse(data);
    } catch (error) {
      console.error('Error reading budget settings:', error);
      return {
        budgets: {
          Food: 0,
          Transportation: 0,
          Entertainment: 0,
          Shopping: 0,
          Bills: 0,
          Other: 0,
        },
        currency: 'USD',
      };
    }
  },

  saveBudgetSettings: (settings: BudgetSettings): void => {
    if (typeof window === 'undefined') return;

    try {
      localStorage.setItem(BUDGET_KEY, JSON.stringify(settings));
    } catch (error) {
      console.error('Error saving budget settings:', error);
    }
  },

  getSavingsGoals: (): SavingsGoal[] => {
    if (typeof window === 'undefined') return [];

    try {
      const data = localStorage.getItem(GOALS_KEY);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error reading savings goals:', error);
      return [];
    }
  },

  saveSavingsGoals: (goals: SavingsGoal[]): void => {
    if (typeof window === 'undefined') return;

    try {
      localStorage.setItem(GOALS_KEY, JSON.stringify(goals));
    } catch (error) {
      console.error('Error saving savings goals:', error);
    }
  },

  addSavingsGoal: (goal: SavingsGoal): void => {
    const goals = budgetStorage.getSavingsGoals();
    goals.push(goal);
    budgetStorage.saveSavingsGoals(goals);
  },

  updateSavingsGoal: (id: string, updatedGoal: SavingsGoal): void => {
    const goals = budgetStorage.getSavingsGoals();
    const index = goals.findIndex(g => g.id === id);
    if (index !== -1) {
      goals[index] = updatedGoal;
      budgetStorage.saveSavingsGoals(goals);
    }
  },

  deleteSavingsGoal: (id: string): void => {
    const goals = budgetStorage.getSavingsGoals();
    const filtered = goals.filter(g => g.id !== id);
    budgetStorage.saveSavingsGoals(filtered);
  },
};
