'use client';

import React from 'react';
import { SmartInsight, RecurringExpense } from '@/types/expense';
import { Card } from './ui/Card';
import { formatCurrency, getCategoryColor, getCategoryIcon } from '@/lib/utils';

interface SmartInsightsProps {
  insights: SmartInsight[];
  recurringExpenses: RecurringExpense[];
}

export const SmartInsights: React.FC<SmartInsightsProps> = ({
  insights,
  recurringExpenses,
}) => {
  const getInsightIcon = (type: SmartInsight['type']) => {
    switch (type) {
      case 'warning':
        return '⚠️';
      case 'tip':
        return '💡';
      case 'achievement':
        return '🏆';
      case 'prediction':
        return '🔮';
    }
  };

  const getInsightColor = (type: SmartInsight['type']) => {
    switch (type) {
      case 'warning':
        return 'bg-red-50 border-red-200 text-red-900';
      case 'tip':
        return 'bg-blue-50 border-blue-200 text-blue-900';
      case 'achievement':
        return 'bg-green-50 border-green-200 text-green-900';
      case 'prediction':
        return 'bg-purple-50 border-purple-200 text-purple-900';
    }
  };

  const getConfidenceBadge = (confidence: number) => {
    if (confidence >= 80) return { text: 'High', color: 'bg-green-600' };
    if (confidence >= 60) return { text: 'Medium', color: 'bg-yellow-600' };
    return { text: 'Low', color: 'bg-gray-600' };
  };

  return (
    <div className="space-y-6">
      <Card>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">Smart Insights</h3>
            <span className="bg-blue-600 text-white text-xs font-semibold px-3 py-1 rounded-full">
              {insights.length} insights
            </span>
          </div>

          {insights.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p className="text-lg">No insights yet</p>
              <p className="text-sm mt-2">
                Add more expenses to get personalized insights and recommendations
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {insights.map(insight => (
                <div
                  key={insight.id}
                  className={`p-4 rounded-lg border-2 ${getInsightColor(insight.type)}`}
                >
                  <div className="flex items-start space-x-3">
                    <span className="text-3xl flex-shrink-0">
                      {getInsightIcon(insight.type)}
                    </span>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <h4 className="font-semibold">{insight.title}</h4>
                        {insight.category && (
                          <div
                            className={`w-6 h-6 rounded-full ${getCategoryColor(
                              insight.category
                            )} flex items-center justify-center text-sm`}
                          >
                            {getCategoryIcon(insight.category)}
                          </div>
                        )}
                      </div>
                      <p className="text-sm">{insight.message}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </Card>

      {recurringExpenses.length > 0 && (
        <Card>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">
                Detected Recurring Expenses
              </h3>
              <span className="bg-purple-600 text-white text-xs font-semibold px-3 py-1 rounded-full">
                {recurringExpenses.length} detected
              </span>
            </div>

            <div className="space-y-3">
              {recurringExpenses.map((recurring, index) => {
                const confidenceBadge = getConfidenceBadge(recurring.confidence);
                return (
                  <div
                    key={index}
                    className="p-4 bg-gradient-to-r from-purple-50 to-indigo-50 rounded-lg border border-purple-200"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-3">
                        <div
                          className={`w-10 h-10 rounded-full ${getCategoryColor(
                            recurring.category
                          )} flex items-center justify-center text-xl`}
                        >
                          {getCategoryIcon(recurring.category)}
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900">
                            {recurring.description}
                          </h4>
                          <p className="text-sm text-gray-600">{recurring.category}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-gray-900">
                          {formatCurrency(recurring.averageAmount)}
                        </p>
                        <p className="text-sm text-gray-600 capitalize">
                          {recurring.frequency}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between mt-3 pt-3 border-t border-purple-200">
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-gray-600">Next expected:</span>
                        <span className="text-sm font-semibold text-purple-900">
                          {new Date(recurring.nextExpected).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          })}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-gray-600">Confidence:</span>
                        <span
                          className={`${confidenceBadge.color} text-white text-xs font-semibold px-2 py-1 rounded`}
                        >
                          {confidenceBadge.text} ({recurring.confidence}%)
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-sm text-blue-900">
                <span className="font-semibold">💡 Tip:</span> Recurring expenses are
                automatically detected based on your spending patterns. Plan ahead for these
                upcoming expenses!
              </p>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};
