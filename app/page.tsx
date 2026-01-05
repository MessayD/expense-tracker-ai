'use client';

import { useState, useEffect } from 'react';
import { Expense, BudgetSettings, SavingsGoal, ExpenseCategory } from '@/types/expense';
import { storageUtils } from '@/lib/storage';
import { budgetStorage } from '@/lib/budgetStorage';
import {
  calculateCategoryBudgets,
  detectRecurringExpenses,
  generateInsights,
  calculateFinancialHealth
} from '@/lib/intelligence';
import { ExpenseForm } from '@/components/ExpenseForm';
import { ExpenseList } from '@/components/ExpenseList';
import { Dashboard } from '@/components/Dashboard';
import { SpendingChart } from '@/components/SpendingChart';
import { EditExpenseModal } from '@/components/EditExpenseModal';
import { CloudExportHub } from '@/components/CloudExportHub';
import { BudgetManager } from '@/components/BudgetManager';
import { SmartInsights } from '@/components/SmartInsights';
import { FinancialHealthScore } from '@/components/FinancialHealthScore';
import { SavingsGoals } from '@/components/SavingsGoals';
import { Button } from '@/components/ui/Button';

type View = 'dashboard' | 'expenses' | 'add' | 'budgets' | 'insights' | 'health' | 'goals';

export default function Home() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [currentView, setCurrentView] = useState<View>('dashboard');
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isCloudExportOpen, setIsCloudExportOpen] = useState(false);
  const [budgetSettings, setBudgetSettings] = useState<BudgetSettings>({
    budgets: {
      Food: 0,
      Transportation: 0,
      Entertainment: 0,
      Shopping: 0,
      Bills: 0,
      Other: 0,
    },
    currency: 'USD'
  });
  const [savingsGoals, setSavingsGoals] = useState<SavingsGoal[]>([]);

  useEffect(() => {
    const loadedExpenses = storageUtils.getExpenses();
    setExpenses(loadedExpenses);

    const loadedBudgets = budgetStorage.getBudgetSettings();
    setBudgetSettings(loadedBudgets);

    const loadedGoals = budgetStorage.getSavingsGoals();
    setSavingsGoals(loadedGoals);
  }, []);

  const refreshExpenses = () => {
    const loadedExpenses = storageUtils.getExpenses();
    setExpenses(loadedExpenses);
  };

  const handleAddSuccess = () => {
    refreshExpenses();
    setCurrentView('expenses');
  };

  const handleEdit = (expense: Expense) => {
    setEditingExpense(expense);
    setIsEditModalOpen(true);
  };

  const handleEditSuccess = () => {
    refreshExpenses();
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this expense?')) {
      storageUtils.deleteExpense(id);
      refreshExpenses();
    }
  };

  const handleBudgetsUpdate = (budgets: Record<ExpenseCategory, number>) => {
    const newSettings: BudgetSettings = {
      ...budgetSettings,
      budgets,
    };
    budgetStorage.saveBudgetSettings(newSettings);
    setBudgetSettings(newSettings);
  };

  const handleGoalsUpdate = () => {
    const loadedGoals = budgetStorage.getSavingsGoals();
    setSavingsGoals(loadedGoals);
  };

  // Calculate intelligent data
  const categoryBudgets = calculateCategoryBudgets(expenses, budgetSettings);
  const recurringExpenses = detectRecurringExpenses(expenses);
  const insights = generateInsights(expenses, categoryBudgets, recurringExpenses);
  const financialHealth = calculateFinancialHealth(expenses, categoryBudgets, savingsGoals);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-green-50">
      <nav className="bg-white shadow-md border-b-4 border-gradient-to-r from-purple-500 to-blue-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <span className="text-2xl">🧠</span>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                Intelligent Expense Tracker
              </h1>
            </div>

            <div className="flex items-center space-x-2">
              <div className="hidden sm:flex items-center space-x-2 mr-4">
                <span className="text-sm font-medium text-gray-600">Health Score:</span>
                <span className={`text-lg font-bold ${
                  financialHealth.score >= 80 ? 'text-green-600' :
                  financialHealth.score >= 60 ? 'text-blue-600' :
                  financialHealth.score >= 40 ? 'text-yellow-600' : 'text-red-600'
                }`}>
                  {financialHealth.score}
                </span>
              </div>
              <Button
                onClick={() => setIsCloudExportOpen(true)}
                variant="secondary"
                size="sm"
                className="!bg-gradient-to-r !from-indigo-600 !via-purple-600 !to-pink-600 !text-white hover:!from-indigo-700 hover:!via-purple-700 hover:!to-pink-700"
              >
                ☁️ Cloud Export
              </Button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6 flex flex-wrap gap-3">
          <Button
            variant={currentView === 'dashboard' ? 'primary' : 'secondary'}
            onClick={() => setCurrentView('dashboard')}
          >
            📊 Dashboard
          </Button>
          <Button
            variant={currentView === 'budgets' ? 'primary' : 'secondary'}
            onClick={() => setCurrentView('budgets')}
          >
            💰 Smart Budgets
          </Button>
          <Button
            variant={currentView === 'insights' ? 'primary' : 'secondary'}
            onClick={() => setCurrentView('insights')}
          >
            🧠 Insights
          </Button>
          <Button
            variant={currentView === 'health' ? 'primary' : 'secondary'}
            onClick={() => setCurrentView('health')}
          >
            ❤️ Health
          </Button>
          <Button
            variant={currentView === 'goals' ? 'primary' : 'secondary'}
            onClick={() => setCurrentView('goals')}
          >
            🎯 Goals
          </Button>
          <Button
            variant={currentView === 'expenses' ? 'primary' : 'secondary'}
            onClick={() => setCurrentView('expenses')}
          >
            📝 All Expenses
          </Button>
          <Button
            variant={currentView === 'add' ? 'primary' : 'secondary'}
            onClick={() => setCurrentView('add')}
          >
            ➕ Add Expense
          </Button>
        </div>

        {currentView === 'dashboard' && (
          <div className="space-y-6">
            <Dashboard expenses={expenses} />
            <SpendingChart expenses={expenses} />

            {insights.length > 0 && (
              <div className="bg-gradient-to-r from-purple-100 to-blue-100 rounded-lg p-6 border-2 border-purple-300">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  💡 Quick Insights
                </h3>
                <div className="space-y-2">
                  {insights.slice(0, 3).map(insight => (
                    <div key={insight.id} className="text-sm text-gray-700">
                      • {insight.title}
                    </div>
                  ))}
                </div>
                <Button
                  variant="secondary"
                  size="sm"
                  className="mt-4"
                  onClick={() => setCurrentView('insights')}
                >
                  View All Insights →
                </Button>
              </div>
            )}
          </div>
        )}

        {currentView === 'budgets' && (
          <BudgetManager
            budgets={categoryBudgets}
            onBudgetsUpdate={handleBudgetsUpdate}
          />
        )}

        {currentView === 'insights' && (
          <SmartInsights
            insights={insights}
            recurringExpenses={recurringExpenses}
          />
        )}

        {currentView === 'health' && (
          <FinancialHealthScore health={financialHealth} />
        )}

        {currentView === 'goals' && (
          <SavingsGoals
            goals={savingsGoals}
            onGoalsUpdate={handleGoalsUpdate}
          />
        )}

        {currentView === 'expenses' && (
          <ExpenseList
            expenses={expenses}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        )}

        {currentView === 'add' && <ExpenseForm onSuccess={handleAddSuccess} />}
      </div>

      <EditExpenseModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        expense={editingExpense}
        onSuccess={handleEditSuccess}
      />

      <CloudExportHub
        isOpen={isCloudExportOpen}
        onClose={() => setIsCloudExportOpen(false)}
        expenses={expenses}
      />

      <footer className="bg-white border-t mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <p className="text-center text-gray-600 text-sm">
            🧠 Intelligent Expense Tracker - Built with Next.js 14, TypeScript, and AI-Powered Insights
          </p>
        </div>
      </footer>
    </div>
  );
}
