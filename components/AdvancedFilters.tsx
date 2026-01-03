'use client';

import React, { useState, useEffect } from 'react';
import { ExpenseCategory, ExpenseFilters, DatePreset } from '@/types/expense';
import { Card } from './ui/Card';
import { Input } from './ui/Input';
import { Button } from './ui/Button';
import { getDateRangeFromPreset, getCategoryColor, getCategoryIcon } from '@/lib/utils';

interface AdvancedFiltersProps {
  filters: ExpenseFilters;
  onFiltersChange: (filters: ExpenseFilters) => void;
  amountRange: { min: number; max: number };
}

const ALL_CATEGORIES: ExpenseCategory[] = [
  'Food',
  'Transportation',
  'Entertainment',
  'Shopping',
  'Bills',
  'Other',
];

const DATE_PRESETS: { value: DatePreset; label: string }[] = [
  { value: 'today', label: 'Today' },
  { value: 'yesterday', label: 'Yesterday' },
  { value: 'thisWeek', label: 'This Week' },
  { value: 'lastWeek', label: 'Last Week' },
  { value: 'thisMonth', label: 'This Month' },
  { value: 'lastMonth', label: 'Last Month' },
  { value: 'last7Days', label: 'Last 7 Days' },
  { value: 'last30Days', label: 'Last 30 Days' },
  { value: 'last90Days', label: 'Last 90 Days' },
  { value: 'thisYear', label: 'This Year' },
  { value: 'lastYear', label: 'Last Year' },
  { value: 'custom', label: 'Custom Range' },
];

export const AdvancedFilters: React.FC<AdvancedFiltersProps> = ({
  filters,
  onFiltersChange,
  amountRange,
}) => {
  const [selectedCategories, setSelectedCategories] = useState<ExpenseCategory[]>(
    filters.categories || []
  );
  const [datePreset, setDatePreset] = useState<DatePreset>(filters.datePreset || 'custom');
  const [customStartDate, setCustomStartDate] = useState(filters.startDate || '');
  const [customEndDate, setCustomEndDate] = useState(filters.endDate || '');
  const [minAmount, setMinAmount] = useState(filters.minAmount ?? amountRange.min);
  const [maxAmount, setMaxAmount] = useState(filters.maxAmount ?? amountRange.max);
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    setMinAmount(filters.minAmount ?? amountRange.min);
    setMaxAmount(filters.maxAmount ?? amountRange.max);
  }, [amountRange, filters.minAmount, filters.maxAmount]);

  const handleCategoryToggle = (category: ExpenseCategory) => {
    const newCategories = selectedCategories.includes(category)
      ? selectedCategories.filter(c => c !== category)
      : [...selectedCategories, category];

    setSelectedCategories(newCategories);
    onFiltersChange({
      ...filters,
      categories: newCategories.length > 0 ? newCategories : undefined,
    });
  };

  const handleSelectAllCategories = () => {
    setSelectedCategories(ALL_CATEGORIES);
    onFiltersChange({
      ...filters,
      categories: undefined,
    });
  };

  const handleClearAllCategories = () => {
    setSelectedCategories([]);
    onFiltersChange({
      ...filters,
      categories: [],
    });
  };

  const handleDatePresetChange = (preset: DatePreset) => {
    setDatePreset(preset);

    if (preset === 'custom') {
      onFiltersChange({
        ...filters,
        datePreset: preset,
        startDate: customStartDate,
        endDate: customEndDate,
      });
    } else {
      const range = getDateRangeFromPreset(preset);
      setCustomStartDate(range.startDate);
      setCustomEndDate(range.endDate);
      onFiltersChange({
        ...filters,
        datePreset: preset,
        startDate: range.startDate,
        endDate: range.endDate,
      });
    }
  };

  const handleCustomDateChange = (start: string, end: string) => {
    setCustomStartDate(start);
    setCustomEndDate(end);
    setDatePreset('custom');
    onFiltersChange({
      ...filters,
      datePreset: 'custom',
      startDate: start,
      endDate: end,
    });
  };

  const handleAmountRangeChange = (min: number, max: number) => {
    setMinAmount(min);
    setMaxAmount(max);
    onFiltersChange({
      ...filters,
      minAmount: min,
      maxAmount: max,
    });
  };

  const handleClearAllFilters = () => {
    setSelectedCategories([]);
    setDatePreset('custom');
    setCustomStartDate('');
    setCustomEndDate('');
    setMinAmount(amountRange.min);
    setMaxAmount(amountRange.max);
    onFiltersChange({
      searchQuery: filters.searchQuery,
    });
  };

  const activeFiltersCount =
    (selectedCategories.length > 0 && selectedCategories.length < ALL_CATEGORIES.length ? 1 : 0) +
    (filters.startDate || filters.endDate ? 1 : 0) +
    (filters.minAmount !== amountRange.min || filters.maxAmount !== amountRange.max ? 1 : 0);

  return (
    <Card>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <h3 className="text-lg font-semibold text-gray-900">Advanced Filters</h3>
            {activeFiltersCount > 0 && (
              <span className="bg-blue-600 text-white text-xs font-semibold px-2 py-1 rounded-full">
                {activeFiltersCount} active
              </span>
            )}
          </div>
          <div className="flex items-center space-x-2">
            {activeFiltersCount > 0 && (
              <Button size="sm" variant="secondary" onClick={handleClearAllFilters}>
                Clear All
              </Button>
            )}
            <Button
              size="sm"
              variant="secondary"
              onClick={() => setIsExpanded(!isExpanded)}
            >
              {isExpanded ? 'Hide Filters' : 'Show Filters'}
            </Button>
          </div>
        </div>

        {isExpanded && (
          <div className="space-y-6 pt-4 border-t">
            {/* Category Filter */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-medium text-gray-900">Categories</h4>
                <div className="flex space-x-2">
                  <button
                    onClick={handleSelectAllCategories}
                    className="text-sm text-blue-600 hover:text-blue-700"
                  >
                    Select All
                  </button>
                  <span className="text-gray-400">|</span>
                  <button
                    onClick={handleClearAllCategories}
                    className="text-sm text-blue-600 hover:text-blue-700"
                  >
                    Clear All
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {ALL_CATEGORIES.map(category => {
                  const isSelected = selectedCategories.includes(category);
                  return (
                    <button
                      key={category}
                      onClick={() => handleCategoryToggle(category)}
                      className={`flex items-center space-x-2 p-3 rounded-lg border-2 transition-all ${
                        isSelected
                          ? 'border-blue-600 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => {}}
                        className="w-4 h-4 text-blue-600 rounded"
                      />
                      <div
                        className={`w-8 h-8 rounded-full ${getCategoryColor(
                          category
                        )} flex items-center justify-center text-lg`}
                      >
                        {getCategoryIcon(category)}
                      </div>
                      <span className="font-medium text-gray-900 text-sm">{category}</span>
                    </button>
                  );
                })}
              </div>

              {selectedCategories.length > 0 && (
                <div className="mt-3 text-sm text-gray-600">
                  {selectedCategories.length} of {ALL_CATEGORIES.length} categories selected
                </div>
              )}
            </div>

            {/* Date Range Filter */}
            <div>
              <h4 className="font-medium text-gray-900 mb-3">Date Range</h4>

              <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2 mb-4">
                {DATE_PRESETS.map(preset => (
                  <button
                    key={preset.value}
                    onClick={() => handleDatePresetChange(preset.value)}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                      datePreset === preset.value
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {preset.label}
                  </button>
                ))}
              </div>

              {datePreset === 'custom' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    type="date"
                    label="Start Date"
                    value={customStartDate}
                    onChange={e => handleCustomDateChange(e.target.value, customEndDate)}
                  />
                  <Input
                    type="date"
                    label="End Date"
                    value={customEndDate}
                    onChange={e => handleCustomDateChange(customStartDate, e.target.value)}
                  />
                </div>
              )}

              {(filters.startDate || filters.endDate) && (
                <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                  <p className="text-sm text-blue-900">
                    <span className="font-medium">Active Range:</span>{' '}
                    {filters.startDate || 'Any'} to {filters.endDate || 'Any'}
                  </p>
                </div>
              )}
            </div>

            {/* Amount Range Filter */}
            <div>
              <h4 className="font-medium text-gray-900 mb-3">Amount Range</h4>

              <div className="space-y-4">
                <div className="px-2">
                  <div className="relative pt-1">
                    <div className="flex justify-between text-sm text-gray-600 mb-2">
                      <span>${minAmount.toFixed(2)}</span>
                      <span>${maxAmount.toFixed(2)}</span>
                    </div>

                    <div className="relative">
                      <input
                        type="range"
                        min={amountRange.min}
                        max={amountRange.max}
                        step="0.01"
                        value={minAmount}
                        onChange={e =>
                          handleAmountRangeChange(parseFloat(e.target.value), maxAmount)
                        }
                        className="absolute w-full h-2 bg-transparent appearance-none pointer-events-none z-20"
                        style={{
                          background: 'transparent',
                        }}
                      />
                      <input
                        type="range"
                        min={amountRange.min}
                        max={amountRange.max}
                        step="0.01"
                        value={maxAmount}
                        onChange={e =>
                          handleAmountRangeChange(minAmount, parseFloat(e.target.value))
                        }
                        className="absolute w-full h-2 bg-transparent appearance-none pointer-events-none z-20"
                        style={{
                          background: 'transparent',
                        }}
                      />
                      <div className="relative w-full h-2 bg-gray-200 rounded-full">
                        <div
                          className="absolute h-2 bg-blue-600 rounded-full"
                          style={{
                            left: `${((minAmount - amountRange.min) / (amountRange.max - amountRange.min)) * 100}%`,
                            right: `${100 - ((maxAmount - amountRange.min) / (amountRange.max - amountRange.min)) * 100}%`,
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    type="number"
                    label="Min Amount"
                    value={minAmount.toString()}
                    onChange={e =>
                      handleAmountRangeChange(parseFloat(e.target.value) || 0, maxAmount)
                    }
                    min={amountRange.min}
                    max={maxAmount}
                    step="0.01"
                  />
                  <Input
                    type="number"
                    label="Max Amount"
                    value={maxAmount.toString()}
                    onChange={e =>
                      handleAmountRangeChange(minAmount, parseFloat(e.target.value) || 0)
                    }
                    min={minAmount}
                    max={amountRange.max}
                    step="0.01"
                  />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
};
