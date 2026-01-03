'use client';

import React from 'react';
import { Expense } from '@/types/expense';
import { Button } from './ui/Button';
import { exportToCSV, downloadCSV } from '@/lib/utils';

interface ExportButtonProps {
  expenses: Expense[];
}

export const ExportButton: React.FC<ExportButtonProps> = ({ expenses }) => {
  const handleExport = () => {
    if (expenses.length === 0) {
      alert('No expenses to export');
      return;
    }

    const csvContent = exportToCSV(expenses);
    const timestamp = new Date().toISOString().split('T')[0];
    downloadCSV(csvContent, `expenses-${timestamp}.csv`);
  };

  return (
    <Button onClick={handleExport} variant="success" disabled={expenses.length === 0}>
      Export to CSV
    </Button>
  );
};
