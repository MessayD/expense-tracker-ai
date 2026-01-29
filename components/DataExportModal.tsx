'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Modal } from './ui/Modal';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { Expense } from '@/types/expense';
import { categoryStorage } from '@/lib/categoryStorage';
import {
  ExportFormat,
  ExportOptions,
  exportExpenses,
  getExportPreview,
  filterExpenses,
} from '@/lib/exportUtils';

interface DataExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  expenses: Expense[];
}

const FORMAT_INFO: Record<ExportFormat, { icon: string; name: string; description: string }> = {
  csv: {
    icon: '📊',
    name: 'CSV',
    description: 'Spreadsheet format for Excel, Google Sheets',
  },
  json: {
    icon: '🔧',
    name: 'JSON',
    description: 'Structured data for developers, APIs',
  },
  pdf: {
    icon: '📄',
    name: 'PDF',
    description: 'Print-ready report with summary',
  },
};

export const DataExportModal: React.FC<DataExportModalProps> = ({
  isOpen,
  onClose,
  expenses,
}) => {
  const [format, setFormat] = useState<ExportFormat>('csv');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [includeHeaders, setIncludeHeaders] = useState(true);
  const [showPreview, setShowPreview] = useState(false);
  const [categories, setCategories] = useState<string[]>([]);

  useEffect(() => {
    if (isOpen) {
      setCategories(categoryStorage.getCategoryNames());
    }
  }, [isOpen]);

  const options: ExportOptions = useMemo(() => ({
    format,
    startDate: startDate || undefined,
    endDate: endDate || undefined,
    categories: selectedCategories.length > 0 ? selectedCategories : undefined,
    includeHeaders,
  }), [format, startDate, endDate, selectedCategories, includeHeaders]);

  const filteredExpenses = useMemo(
    () => filterExpenses(expenses, options),
    [expenses, options]
  );

  const preview = useMemo(
    () => showPreview ? getExportPreview(expenses, options) : '',
    [expenses, options, showPreview]
  );

  const handleExport = () => {
    exportExpenses(expenses, options);
    if (format !== 'pdf') {
      onClose();
    }
  };

  const handleCategoryToggle = (category: string) => {
    setSelectedCategories(prev =>
      prev.includes(category)
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };

  const handleSelectAllCategories = () => {
    if (selectedCategories.length === categories.length) {
      setSelectedCategories([]);
    } else {
      setSelectedCategories([...categories]);
    }
  };

  const handleReset = () => {
    setFormat('csv');
    setStartDate('');
    setEndDate('');
    setSelectedCategories([]);
    setIncludeHeaders(true);
    setShowPreview(false);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Export Data">
      <div className="space-y-6">
        {/* Format Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Export Format
          </label>
          <div className="grid grid-cols-3 gap-3">
            {(Object.keys(FORMAT_INFO) as ExportFormat[]).map((fmt) => (
              <button
                key={fmt}
                type="button"
                onClick={() => setFormat(fmt)}
                className={`p-4 rounded-lg border-2 text-left transition-all ${
                  format === fmt
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="text-2xl mb-1">{FORMAT_INFO[fmt].icon}</div>
                <div className="font-semibold text-gray-900">{FORMAT_INFO[fmt].name}</div>
                <div className="text-xs text-gray-500 mt-1">{FORMAT_INFO[fmt].description}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Date Range */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Date Range (Optional)
          </label>
          <div className="grid grid-cols-2 gap-3">
            <Input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              label="From"
            />
            <Input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              label="To"
            />
          </div>
        </div>

        {/* Category Filter */}
        <div>
          <div className="flex justify-between items-center mb-3">
            <label className="block text-sm font-medium text-gray-700">
              Categories (Optional)
            </label>
            <button
              type="button"
              onClick={handleSelectAllCategories}
              className="text-sm text-blue-600 hover:text-blue-700"
            >
              {selectedCategories.length === categories.length ? 'Deselect All' : 'Select All'}
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <button
                key={category}
                type="button"
                onClick={() => handleCategoryToggle(category)}
                className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                  selectedCategories.includes(category)
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        {/* Options */}
        {format === 'csv' && (
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="includeHeaders"
              checked={includeHeaders}
              onChange={(e) => setIncludeHeaders(e.target.checked)}
              className="w-4 h-4 text-blue-600 rounded border-gray-300"
            />
            <label htmlFor="includeHeaders" className="text-sm text-gray-700">
              Include column headers
            </label>
          </div>
        )}

        {/* Summary */}
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex justify-between items-center">
            <div>
              <span className="text-sm text-gray-600">Ready to export: </span>
              <span className="font-semibold text-gray-900">
                {filteredExpenses.length} expense{filteredExpenses.length !== 1 ? 's' : ''}
              </span>
              {filteredExpenses.length > 0 && (
                <span className="text-sm text-gray-600 ml-2">
                  (${filteredExpenses.reduce((s, e) => s + e.amount, 0).toFixed(2)} total)
                </span>
              )}
            </div>
            <button
              type="button"
              onClick={() => setShowPreview(!showPreview)}
              className="text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              {showPreview ? 'Hide Preview' : 'Show Preview'}
            </button>
          </div>

          {showPreview && preview && (
            <pre className="mt-3 p-3 bg-gray-800 text-green-400 rounded text-xs overflow-x-auto max-h-48">
              {preview}
            </pre>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-2">
          <Button
            type="button"
            variant="secondary"
            onClick={handleReset}
            className="flex-1"
          >
            Reset
          </Button>
          <Button
            type="button"
            variant="secondary"
            onClick={onClose}
            className="flex-1"
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleExport}
            disabled={filteredExpenses.length === 0}
            className="flex-1"
          >
            {FORMAT_INFO[format].icon} Export {FORMAT_INFO[format].name}
          </Button>
        </div>
      </div>
    </Modal>
  );
};
