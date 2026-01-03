'use client';

import React from 'react';
import { Expense } from '@/types/expense';
import { Card } from './ui/Card';
import { formatCurrency } from '@/lib/utils';

interface SpendingChartProps {
  expenses: Expense[];
}

export const SpendingChart: React.FC<SpendingChartProps> = ({ expenses }) => {
  const getLast7Days = () => {
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      days.push(date);
    }
    return days;
  };

  const last7Days = getLast7Days();

  const dailySpending = last7Days.map(day => {
    const dayStr = day.toISOString().split('T')[0];
    const dayExpenses = expenses.filter(exp => exp.date === dayStr);
    const total = dayExpenses.reduce((sum, exp) => sum + exp.amount, 0);

    return {
      date: day,
      label: day.toLocaleDateString('en-US', { weekday: 'short' }),
      total,
    };
  });

  const maxSpending = Math.max(...dailySpending.map(d => d.total), 1);

  return (
    <Card title="Last 7 Days Spending">
      <div className="space-y-4">
        <div className="flex items-end justify-between h-64 gap-2">
          {dailySpending.map((day, index) => {
            const height = maxSpending > 0 ? (day.total / maxSpending) * 100 : 0;

            return (
              <div key={index} className="flex-1 flex flex-col items-center">
                <div className="w-full flex flex-col justify-end h-full relative group">
                  <div
                    className="bg-blue-500 hover:bg-blue-600 rounded-t-lg transition-all duration-300 cursor-pointer relative"
                    style={{ height: `${height}%`, minHeight: height > 0 ? '4px' : '0' }}
                  >
                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 hidden group-hover:block bg-gray-900 text-white text-xs rounded py-1 px-2 whitespace-nowrap z-10">
                      {formatCurrency(day.total)}
                    </div>
                  </div>
                </div>
                <div className="text-xs text-gray-600 mt-2">{day.label}</div>
              </div>
            );
          })}
        </div>

        {expenses.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <p>No expenses to display</p>
          </div>
        )}
      </div>
    </Card>
  );
};
