'use client';

import React, { useState, useEffect } from 'react';
import { ExpenseCategory, CategoryBudget } from '@/types/expense';
import { Card } from './ui/Card';
import { Input } from './ui/Input';
import { Button } from './ui/Button';
import { formatCurrency, getCategoryColor, getCategoryIcon } from '@/lib/utils';

interface BudgetManagerProps {
  budgets: CategoryBudget[];
  onBudgetsUpdate: (budgets: Record<ExpenseCategory, number>) => void;
}

export const BudgetManager: React.FC<BudgetManagerProps> = ({
  budgets,
  onBudgetsUpdate,
}) => {
  const [editMode, setEditMode] = useState(false);
  const [budgetValues, setBudgetValues] = useState<Record<ExpenseCategory, string>>(() => {
    const initial: Record<ExpenseCategory, string> = {
      Food: '0',
      Transportation: '0',
      Entertainment: '0',
      Shopping: '0',
      Bills: '0',
      Other: '0',
    };
    budgets.forEach(b => {
      initial[b.category] = b.monthlyLimit.toString();
    });
    return initial;
  });

  useEffect(() => {
    const newValues: Record<ExpenseCategory, string> = {
      Food: '0',
      Transportation: '0',
      Entertainment: '0',
      Shopping: '0',
      Bills: '0',
      Other: '0',
    };
    budgets.forEach(b => {
      newValues[b.category] = b.monthlyLimit.toString();
    });
    setBudgetValues(newValues);
  }, [budgets]);

  const handleSave = () => {
    const numericBudgets: Record<ExpenseCategory, number> = {
      Food: 0,
      Transportation: 0,
      Entertainment: 0,
      Shopping: 0,
      Bills: 0,
      Other: 0,
    };

    Object.entries(budgetValues).forEach(([category, value]) => {
      numericBudgets[category as ExpenseCategory] = parseFloat(value) || 0;
    });

    onBudgetsUpdate(numericBudgets);
    setEditMode(false);
  };

  const handleChange = (category: ExpenseCategory, value: string) => {
    setBudgetValues(prev => ({
      ...prev,
      [category]: value,
    }));
  };

  const totalBudget = budgets.reduce((sum, b) => sum + b.monthlyLimit, 0);
  const totalSpent = budgets.reduce((sum, b) => sum + b.spent, 0);
  const totalRemaining = totalBudget - totalSpent;

  const getStatusColor = (percentageUsed: number) => {
    if (percentageUsed >= 100) return 'bg-red-500';
    if (percentageUsed >= 80) return 'bg-orange-500';
    if (percentageUsed >= 60) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const getStatusIcon = (percentageUsed: number) => {
    if (percentageUsed >= 100) return '🚨';
    if (percentageUsed >= 80) return '⚠️';
    return '✅';
  };

  return (
    <Card>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold text-gray-900">Monthly Budget Manager</h3>
          {!editMode ? (
            <Button size="sm" onClick={() => setEditMode(true)}>
              {totalBudget > 0 ? 'Edit Budgets' : 'Set Budgets'}
            </Button>
          ) : (
            <div className="flex space-x-2">
              <Button size="sm" variant="success" onClick={handleSave}>
                Save
              </Button>
              <Button
                size="sm"
                variant="secondary"
                onClick={() => {
                  setEditMode(false);
                  const resetValues: Record<ExpenseCategory, string> = {
                    Food: '0',
                    Transportation: '0',
                    Entertainment: '0',
                    Shopping: '0',
                    Bills: '0',
                    Other: '0',
                  };
                  budgets.forEach(b => {
                    resetValues[b.category] = b.monthlyLimit.toString();
                  });
                  setBudgetValues(resetValues);
                }}
              >
                Cancel
              </Button>
            </div>
          )}
        </div>

        {totalBudget > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg">
            <div>
              <p className="text-sm text-gray-600">Total Budget</p>
              <p className="text-2xl font-bold text-gray-900">
                {formatCurrency(totalBudget)}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Spent</p>
              <p className="text-2xl font-bold text-blue-600">
                {formatCurrency(totalSpent)}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Remaining</p>
              <p
                className={`text-2xl font-bold ${
                  totalRemaining >= 0 ? 'text-green-600' : 'text-red-600'
                }`}
              >
                {formatCurrency(totalRemaining)}
              </p>
            </div>
          </div>
        )}

        <div className="space-y-4">
          {budgets.map(budget => (
            <div
              key={budget.category}
              className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-3">
                  <div
                    className={`w-10 h-10 rounded-full ${getCategoryColor(
                      budget.category
                    )} flex items-center justify-center text-xl`}
                  >
                    {getCategoryIcon(budget.category)}
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">{budget.category}</h4>
                    {!editMode && budget.monthlyLimit > 0 && (
                      <p className="text-sm text-gray-600">
                        {formatCurrency(budget.spent)} of{' '}
                        {formatCurrency(budget.monthlyLimit)}
                      </p>
                    )}
                  </div>
                </div>

                {editMode ? (
                  <div className="w-48">
                    <Input
                      type="number"
                      value={budgetValues[budget.category]}
                      onChange={e => handleChange(budget.category, e.target.value)}
                      placeholder="0.00"
                      min="0"
                      step="0.01"
                      className="text-right font-semibold"
                    />
                  </div>
                ) : (
                  <div className="flex items-center space-x-2">
                    {budget.monthlyLimit > 0 && (
                      <span className="text-2xl">
                        {getStatusIcon(budget.percentageUsed)}
                      </span>
                    )}
                    <span
                      className={`text-lg font-bold ${
                        budget.remaining >= 0 ? 'text-green-600' : 'text-red-600'
                      }`}
                    >
                      {budget.monthlyLimit > 0
                        ? formatCurrency(budget.remaining)
                        : 'No budget set'}
                    </span>
                  </div>
                )}
              </div>

              {!editMode && budget.monthlyLimit > 0 && (
                <div>
                  <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
                    <div
                      className={`h-4 rounded-full transition-all duration-500 ${getStatusColor(
                        budget.percentageUsed
                      )}`}
                      style={{
                        width: `${Math.min(100, budget.percentageUsed)}%`,
                      }}
                    />
                  </div>
                  <div className="flex justify-between mt-2 text-sm">
                    <span className="text-gray-600">
                      {budget.percentageUsed.toFixed(1)}% used
                    </span>
                    {budget.percentageUsed >= 80 && (
                      <span
                        className={`font-semibold ${
                          budget.percentageUsed >= 100 ? 'text-red-600' : 'text-orange-600'
                        }`}
                      >
                        {budget.percentageUsed >= 100
                          ? 'Budget exceeded!'
                          : 'Approaching limit'}
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {totalBudget === 0 && !editMode && (
          <div className="text-center py-8 text-gray-500">
            <p className="text-lg">No budgets set yet</p>
            <p className="text-sm mt-2">
              Set monthly budgets for each category to track your spending better
            </p>
          </div>
        )}
      </div>
    </Card>
  );
};
