'use client';

import { useState, useEffect } from 'react';
import { Expense } from '@/types/expense';
import { storageUtils } from '@/lib/storage';
import { ExpenseForm } from '@/components/ExpenseForm';
import { ExpenseList } from '@/components/ExpenseList';
import { Dashboard } from '@/components/Dashboard';
import { SpendingChart } from '@/components/SpendingChart';
import { EditExpenseModal } from '@/components/EditExpenseModal';
import { ExportButton } from '@/components/ExportButton';
import { Button } from '@/components/ui/Button';

type View = 'dashboard' | 'expenses' | 'add';

export default function Home() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [currentView, setCurrentView] = useState<View>('dashboard');
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  useEffect(() => {
    const loadedExpenses = storageUtils.getExpenses();
    setExpenses(loadedExpenses);
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <nav className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <span className="text-2xl">💰</span>
              <h1 className="text-2xl font-bold text-gray-900">Expense Tracker</h1>
            </div>

            <div className="flex items-center space-x-2">
              <ExportButton expenses={expenses} />
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
            Dashboard
          </Button>
          <Button
            variant={currentView === 'expenses' ? 'primary' : 'secondary'}
            onClick={() => setCurrentView('expenses')}
          >
            All Expenses
          </Button>
          <Button
            variant={currentView === 'add' ? 'primary' : 'secondary'}
            onClick={() => setCurrentView('add')}
          >
            Add Expense
          </Button>
        </div>

        {currentView === 'dashboard' && (
          <div className="space-y-6">
            <Dashboard expenses={expenses} />
            <SpendingChart expenses={expenses} />
          </div>
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

      <footer className="bg-white border-t mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <p className="text-center text-gray-600 text-sm">
            Built with Next.js 14, TypeScript, and Tailwind CSS
          </p>
        </div>
      </footer>
    </div>
  );
}
