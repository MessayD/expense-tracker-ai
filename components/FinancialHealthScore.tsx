'use client';

import React from 'react';
import { FinancialHealth } from '@/types/expense';
import { Card } from './ui/Card';

interface FinancialHealthScoreProps {
  health: FinancialHealth;
}

export const FinancialHealthScore: React.FC<FinancialHealthScoreProps> = ({ health }) => {
  const getLevelColor = (level: FinancialHealth['level']) => {
    switch (level) {
      case 'Excellent':
        return 'text-green-600';
      case 'Good':
        return 'text-blue-600';
      case 'Fair':
        return 'text-yellow-600';
      case 'Poor':
        return 'text-red-600';
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'from-green-500 to-emerald-600';
    if (score >= 60) return 'from-blue-500 to-indigo-600';
    if (score >= 40) return 'from-yellow-500 to-orange-600';
    return 'from-red-500 to-rose-600';
  };

  const getFactorLabel = (key: string) => {
    switch (key) {
      case 'budgetAdherence':
        return 'Budget Adherence';
      case 'savingsRate':
        return 'Savings Rate';
      case 'spendingTrend':
        return 'Spending Trend';
      case 'categoryBalance':
        return 'Category Balance';
      default:
        return key;
    }
  };

  const getFactorDescription = (key: string) => {
    switch (key) {
      case 'budgetAdherence':
        return 'How well you stick to your budgets';
      case 'savingsRate':
        return 'How much you save vs. spend';
      case 'spendingTrend':
        return 'Your spending trend over time';
      case 'categoryBalance':
        return 'Diversity in spending categories';
      default:
        return '';
    }
  };

  return (
    <Card>
      <div className="space-y-6">
        <div className="text-center">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Financial Health Score
          </h3>

          <div className="relative inline-flex items-center justify-center">
            <svg className="transform -rotate-90 w-48 h-48">
              <circle
                cx="96"
                cy="96"
                r="88"
                stroke="currentColor"
                strokeWidth="12"
                fill="none"
                className="text-gray-200"
              />
              <circle
                cx="96"
                cy="96"
                r="88"
                stroke="url(#gradient)"
                strokeWidth="12"
                fill="none"
                strokeDasharray={`${(health.score / 100) * 553} 553`}
                strokeLinecap="round"
                className="transition-all duration-1000"
              />
              <defs>
                <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop
                    offset="0%"
                    className={`${getScoreColor(health.score).split(' ')[0].replace('from-', '')}`}
                    style={{ stopColor: 'currentColor' }}
                  />
                  <stop
                    offset="100%"
                    className={`${getScoreColor(health.score).split(' ')[1].replace('to-', '')}`}
                    style={{ stopColor: 'currentColor' }}
                  />
                </linearGradient>
              </defs>
            </svg>

            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-5xl font-bold text-gray-900">{health.score}</span>
              <span className="text-sm text-gray-600">out of 100</span>
              <span className={`text-xl font-semibold mt-1 ${getLevelColor(health.level)}`}>
                {health.level}
              </span>
            </div>
          </div>

          <p className="text-sm text-gray-600 mt-4">
            {health.level === 'Excellent' &&
              "Outstanding! You're managing your finances exceptionally well."}
            {health.level === 'Good' &&
              "Great job! You're on the right track with your finances."}
            {health.level === 'Fair' &&
              "You're doing okay, but there's room for improvement."}
            {health.level === 'Poor' &&
              "Your finances need attention. Focus on budgeting and reducing expenses."}
          </p>
        </div>

        <div className="space-y-3">
          <h4 className="font-semibold text-gray-900 text-sm">Health Factors</h4>
          {Object.entries(health.factors).map(([key, value]) => (
            <div key={key} className="space-y-2">
              <div className="flex justify-between items-center text-sm">
                <span className="font-medium text-gray-700">{getFactorLabel(key)}</span>
                <span className="text-gray-900 font-semibold">{Math.round(value)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-blue-500 to-indigo-600 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${value}%` }}
                />
              </div>
              <p className="text-xs text-gray-500">{getFactorDescription(key)}</p>
            </div>
          ))}
        </div>

        <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
          <p className="text-sm text-blue-900">
            <span className="font-semibold">💡 How to improve:</span>
            {health.score < 40 &&
              ' Set realistic budgets, track all expenses, and focus on reducing unnecessary spending.'}
            {health.score >= 40 &&
              health.score < 60 &&
              ' Increase your savings rate and stick more closely to your budgets.'}
            {health.score >= 60 &&
              health.score < 80 &&
              ' Fine-tune your spending patterns and set aside more for savings.'}
            {health.score >= 80 &&
              ' Maintain your excellent habits and consider setting new savings goals!'}
          </p>
        </div>
      </div>
    </Card>
  );
};
