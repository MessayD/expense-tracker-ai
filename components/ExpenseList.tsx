'use client';

import React, { useState } from 'react';
import { Expense, ExpenseFilters } from '@/types/expense';
import { Card } from './ui/Card';
import { Input } from './ui/Input';
import { Button } from './ui/Button';
import { AdvancedFilters } from './AdvancedFilters';
import { formatCurrency, formatDate, getCategoryColor, getCategoryIcon, filterExpenses, getAmountRange } from '@/lib/utils';

interface ExpenseListProps {
  expenses: Expense[];
  onEdit: (expense: Expense) => void;
  onDelete: (id: string) => void;
}

export const ExpenseList: React.FC<ExpenseListProps> = ({
  expenses,
  onEdit,
  onDelete,
}) => {
  const [filters, setFilters] = useState<ExpenseFilters>({
    searchQuery: '',
  });

  const handleFilterChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const handleFiltersChange = (newFilters: ExpenseFilters) => {
    setFilters(newFilters);
  };

  const amountRange = getAmountRange(expenses);
  const filteredExpenses = filterExpenses(expenses, filters);

  const sortedExpenses = [...filteredExpenses].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4">
        <Card>
          <Input
            placeholder="Search expenses by description, category, or amount..."
            name="searchQuery"
            value={filters.searchQuery || ''}
            onChange={handleFilterChange}
            className="text-base"
          />
        </Card>

        <AdvancedFilters
          filters={filters}
          onFiltersChange={handleFiltersChange}
          amountRange={amountRange}
        />
      </div>

      <Card title="Expense History">
        <div className="space-y-4">
          {sortedExpenses.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <p className="text-lg">No expenses found</p>
              <p className="text-sm mt-2">
                {expenses.length === 0
                  ? 'Start by adding your first expense'
                  : 'Try adjusting your filters'}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {sortedExpenses.map(expense => (
                <div
                  key={expense.id}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center space-x-4 flex-1">
                    <div
                      className={`w-12 h-12 rounded-full ${getCategoryColor(
                        expense.category
                      )} flex items-center justify-center text-2xl`}
                    >
                      {getCategoryIcon(expense.category)}
                    </div>

                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h4 className="font-semibold text-gray-900">
                          {expense.description}
                        </h4>
                        <span className="text-lg font-bold text-gray-900 ml-4">
                          {formatCurrency(expense.amount)}
                        </span>
                      </div>
                      <div className="flex items-center space-x-3 mt-1 text-sm text-gray-600">
                        <span>{expense.category}</span>
                        <span>•</span>
                        <span>{formatDate(expense.date)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 ml-4">
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => onEdit(expense)}
                    >
                      Edit
                    </Button>
                    <Button
                      size="sm"
                      variant="danger"
                      onClick={() => onDelete(expense.id)}
                    >
                      Delete
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {sortedExpenses.length > 0 && (
            <div className="text-sm text-gray-600 text-center pt-4 border-t">
              Showing {sortedExpenses.length} of {expenses.length} expenses
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};
