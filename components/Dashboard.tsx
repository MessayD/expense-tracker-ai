'use client';

import React from 'react';
import { Expense, ExpenseCategory } from '@/types/expense';
import { Card } from './ui/Card';
import { formatCurrency, calculateSummary, getCategoryColor } from '@/lib/utils';

interface DashboardProps {
  expenses: Expense[];
}

export const Dashboard: React.FC<DashboardProps> = ({ expenses }) => {
  const summary = calculateSummary(expenses);

  const topCategories = Object.entries(summary.categoryBreakdown)
    .filter(([_, amount]) => amount > 0)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 3);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <div className="text-center">
            <p className="text-sm font-medium text-gray-600 mb-2">Total Spending</p>
            <p className="text-3xl font-bold text-blue-600">
              {formatCurrency(summary.totalSpending)}
            </p>
          </div>
        </Card>

        <Card>
          <div className="text-center">
            <p className="text-sm font-medium text-gray-600 mb-2">This Month</p>
            <p className="text-3xl font-bold text-green-600">
              {formatCurrency(summary.monthlySpending)}
            </p>
          </div>
        </Card>

        <Card>
          <div className="text-center">
            <p className="text-sm font-medium text-gray-600 mb-2">Total Expenses</p>
            <p className="text-3xl font-bold text-purple-600">{summary.expenseCount}</p>
          </div>
        </Card>

        <Card>
          <div className="text-center">
            <p className="text-sm font-medium text-gray-600 mb-2">Average Expense</p>
            <p className="text-3xl font-bold text-orange-600">
              {formatCurrency(summary.averageExpense)}
            </p>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card title="Top Categories">
          {topCategories.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p>No expenses yet</p>
            </div>
          ) : (
            <div className="space-y-4">
              {topCategories.map(([category, amount], index) => {
                const percentage =
                  summary.totalSpending > 0
                    ? (amount / summary.totalSpending) * 100
                    : 0;

                return (
                  <div key={category}>
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-medium text-gray-900">{category}</span>
                      <span className="text-gray-900 font-semibold">
                        {formatCurrency(amount)}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div
                        className={`${getCategoryColor(
                          category as ExpenseCategory
                        )} h-3 rounded-full transition-all duration-500`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    <div className="text-sm text-gray-600 mt-1">
                      {percentage.toFixed(1)}% of total spending
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </Card>

        <Card title="Category Breakdown">
          {summary.expenseCount === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p>No expenses yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {Object.entries(summary.categoryBreakdown)
                .filter(([_, amount]) => amount > 0)
                .sort(([, a], [, b]) => b - a)
                .map(([category, amount]) => (
                  <div
                    key={category}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <div className="flex items-center space-x-3">
                      <div
                        className={`w-10 h-10 rounded-full ${getCategoryColor(
                          category as ExpenseCategory
                        )}`}
                      />
                      <span className="font-medium text-gray-900">{category}</span>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-gray-900">
                        {formatCurrency(amount)}
                      </p>
                      <p className="text-sm text-gray-600">
                        {((amount / summary.totalSpending) * 100).toFixed(1)}%
                      </p>
                    </div>
                  </div>
                ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};
