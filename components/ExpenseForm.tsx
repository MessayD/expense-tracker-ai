'use client';

import React, { useState, useEffect } from 'react';
import { Input } from './ui/Input';
import { Select } from './ui/Select';
import { Button } from './ui/Button';
import { Card } from './ui/Card';
import { ExpenseFormData } from '@/types/expense';
import { validateExpenseForm, generateId } from '@/lib/utils';
import { storageUtils } from '@/lib/storage';
import { categoryStorage } from '@/lib/categoryStorage';

interface ExpenseFormProps {
  onSuccess?: () => void;
  refreshCategories?: number; // Trigger to refresh categories
}

export const ExpenseForm: React.FC<ExpenseFormProps> = ({ onSuccess, refreshCategories }) => {
  const [categories, setCategories] = useState<{ value: string; label: string }[]>([]);
  const [formData, setFormData] = useState<ExpenseFormData>({
    date: new Date().toISOString().split('T')[0],
    amount: '',
    category: 'Food',
    description: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    setCategories(categoryStorage.getCategoryOptions());
  }, [refreshCategories]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const validation = validateExpenseForm(
      formData.amount,
      formData.description,
      formData.date
    );

    if (!validation.isValid) {
      setErrors(validation.errors);
      return;
    }

    setIsSubmitting(true);

    try {
      const newExpense = {
        id: generateId(),
        date: formData.date,
        amount: parseFloat(formData.amount),
        category: formData.category,
        description: formData.description,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      storageUtils.addExpense(newExpense);

      setFormData({
        date: new Date().toISOString().split('T')[0],
        amount: '',
        category: 'Food',
        description: '',
      });

      setErrors({});

      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error('Error adding expense:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card title="Add New Expense">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Date"
            type="date"
            name="date"
            value={formData.date}
            onChange={handleChange}
            error={errors.date}
            max={new Date().toISOString().split('T')[0]}
          />

          <Input
            label="Amount ($)"
            type="number"
            name="amount"
            value={formData.amount}
            onChange={handleChange}
            error={errors.amount}
            placeholder="0.00"
            step="0.01"
            min="0"
          />
        </div>

        <Select
          label="Category"
          name="category"
          value={formData.category}
          onChange={handleChange}
          options={categories}
        />

        <Input
          label="Description"
          type="text"
          name="description"
          value={formData.description}
          onChange={handleChange}
          error={errors.description}
          placeholder="Enter expense description"
          maxLength={100}
        />

        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? 'Adding...' : 'Add Expense'}
        </Button>
      </form>
    </Card>
  );
};
