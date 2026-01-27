'use client';

import React, { useState, useEffect } from 'react';
import { Modal } from './ui/Modal';
import { Input } from './ui/Input';
import { Select } from './ui/Select';
import { Button } from './ui/Button';
import { Expense, ExpenseCategory } from '@/types/expense';
import { validateExpenseForm } from '@/lib/utils';
import { storageUtils } from '@/lib/storage';
import { categoryStorage } from '@/lib/categoryStorage';

interface EditExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  expense: Expense | null;
  onSuccess: () => void;
}

export const EditExpenseModal: React.FC<EditExpenseModalProps> = ({
  isOpen,
  onClose,
  expense,
  onSuccess,
}) => {
  const [categories, setCategories] = useState<{ value: string; label: string }[]>([]);
  const [formData, setFormData] = useState({
    date: '',
    amount: '',
    category: 'Food' as ExpenseCategory,
    description: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    setCategories(categoryStorage.getCategoryOptions());
  }, [isOpen]);

  useEffect(() => {
    if (expense) {
      setFormData({
        date: expense.date,
        amount: expense.amount.toString(),
        category: expense.category,
        description: expense.description,
      });
    }
  }, [expense]);

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

    if (!expense) return;

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
      const updatedExpense: Expense = {
        ...expense,
        date: formData.date,
        amount: parseFloat(formData.amount),
        category: formData.category,
        description: formData.description,
        updatedAt: new Date().toISOString(),
      };

      storageUtils.updateExpense(expense.id, updatedExpense);

      setErrors({});
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error updating expense:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Edit Expense">
      <form onSubmit={handleSubmit} className="space-y-4">
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

        <div className="flex space-x-3 pt-4">
          <Button type="submit" className="flex-1" disabled={isSubmitting}>
            {isSubmitting ? 'Saving...' : 'Save Changes'}
          </Button>
          <Button
            type="button"
            variant="secondary"
            className="flex-1"
            onClick={onClose}
          >
            Cancel
          </Button>
        </div>
      </form>
    </Modal>
  );
};
