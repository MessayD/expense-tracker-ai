'use client';

import React, { useState } from 'react';
import { SavingsGoal } from '@/types/expense';
import { Card } from './ui/Card';
import { Input } from './ui/Input';
import { Button } from './ui/Button';
import { Modal } from './ui/Modal';
import { formatCurrency, generateId } from '@/lib/utils';

interface SavingsGoalsProps {
  goals: SavingsGoal[];
  onGoalsUpdate: (goals: SavingsGoal[]) => void;
}

export const SavingsGoals: React.FC<SavingsGoalsProps> = ({ goals, onGoalsUpdate }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState<SavingsGoal | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    targetAmount: '',
    currentAmount: '',
    deadline: '',
  });

  const handleOpenModal = (goal?: SavingsGoal) => {
    if (goal) {
      setEditingGoal(goal);
      setFormData({
        name: goal.name,
        targetAmount: goal.targetAmount.toString(),
        currentAmount: goal.currentAmount.toString(),
        deadline: goal.deadline,
      });
    } else {
      setEditingGoal(null);
      setFormData({
        name: '',
        targetAmount: '',
        currentAmount: '0',
        deadline: '',
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingGoal(null);
    setFormData({
      name: '',
      targetAmount: '',
      currentAmount: '0',
      deadline: '',
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const newGoal: SavingsGoal = {
      id: editingGoal?.id || generateId(),
      name: formData.name,
      targetAmount: parseFloat(formData.targetAmount),
      currentAmount: parseFloat(formData.currentAmount),
      deadline: formData.deadline,
      priority: editingGoal?.priority || 'medium',
      createdAt: editingGoal?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    if (editingGoal) {
      const updated = goals.map(g => (g.id === editingGoal.id ? newGoal : g));
      onGoalsUpdate(updated);
    } else {
      onGoalsUpdate([...goals, newGoal]);
    }

    handleCloseModal();
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this savings goal?')) {
      onGoalsUpdate(goals.filter(g => g.id !== id));
    }
  };

  const handleUpdateProgress = (goal: SavingsGoal, amount: number) => {
    const updated = goals.map(g =>
      g.id === goal.id ? { ...g, currentAmount: amount } : g
    );
    onGoalsUpdate(updated);
  };

  const getProgressPercentage = (goal: SavingsGoal) => {
    return Math.min(100, (goal.currentAmount / goal.targetAmount) * 100);
  };

  const getDaysRemaining = (deadline: string) => {
    const now = new Date();
    const end = new Date(deadline);
    const diff = end.getTime() - now.getTime();
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    return days;
  };

  return (
    <div>
      <Card>
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold text-gray-900">Savings Goals</h3>
            <Button size="sm" onClick={() => handleOpenModal()}>
              Add Goal
            </Button>
          </div>

          {goals.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p className="text-lg">No savings goals yet</p>
              <p className="text-sm mt-2">
                Set financial goals and track your progress toward achieving them
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {goals.map(goal => {
                const progress = getProgressPercentage(goal);
                const daysLeft = getDaysRemaining(goal.deadline);
                const isCompleted = progress >= 100;
                const isOverdue = daysLeft < 0 && !isCompleted;

                return (
                  <div
                    key={goal.id}
                    className={`p-4 rounded-lg border-2 ${
                      isCompleted
                        ? 'bg-green-50 border-green-200'
                        : isOverdue
                          ? 'bg-red-50 border-red-200'
                          : 'bg-gray-50 border-gray-200'
                    }`}
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <h4 className="font-semibold text-gray-900 text-lg">
                            {goal.name}
                          </h4>
                          {isCompleted && <span className="text-2xl">🎉</span>}
                          {isOverdue && <span className="text-2xl">⏰</span>}
                        </div>
                        <p className="text-sm text-gray-600 mt-1">
                          Target: {formatCurrency(goal.targetAmount)} by{' '}
                          {new Date(goal.deadline).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex space-x-2">
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => handleOpenModal(goal)}
                        >
                          Edit
                        </Button>
                        <Button
                          size="sm"
                          variant="danger"
                          onClick={() => handleDelete(goal.id)}
                        >
                          Delete
                        </Button>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">
                          {formatCurrency(goal.currentAmount)} saved
                        </span>
                        <span className="font-semibold text-gray-900">
                          {formatCurrency(goal.targetAmount - goal.currentAmount)} to go
                        </span>
                      </div>

                      <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
                        <div
                          className={`h-4 rounded-full transition-all duration-500 ${
                            isCompleted
                              ? 'bg-green-500'
                              : 'bg-gradient-to-r from-blue-500 to-indigo-600'
                          }`}
                          style={{ width: `${progress}%` }}
                        />
                      </div>

                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">
                          {progress.toFixed(1)}% complete
                        </span>
                        <span
                          className={`text-sm font-semibold ${
                            daysLeft < 0
                              ? 'text-red-600'
                              : daysLeft < 30
                                ? 'text-orange-600'
                                : 'text-gray-600'
                          }`}
                        >
                          {daysLeft >= 0
                            ? `${daysLeft} days left`
                            : `${Math.abs(daysLeft)} days overdue`}
                        </span>
                      </div>
                    </div>

                    {!isCompleted && (
                      <div className="mt-3 pt-3 border-t border-gray-200">
                        <div className="flex items-center space-x-2">
                          <Input
                            type="number"
                            placeholder="Update amount"
                            defaultValue={goal.currentAmount}
                            onBlur={e => {
                              const newAmount = parseFloat(e.target.value) || 0;
                              if (newAmount !== goal.currentAmount) {
                                handleUpdateProgress(goal, newAmount);
                              }
                            }}
                            step="0.01"
                            min="0"
                            className="flex-1"
                          />
                          <span className="text-sm text-gray-600">Update progress</span>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </Card>

      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={editingGoal ? 'Edit Savings Goal' : 'Add Savings Goal'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Goal Name"
            value={formData.name}
            onChange={e => setFormData({ ...formData, name: e.target.value })}
            placeholder="e.g., Emergency Fund, Vacation, New Car"
            required
          />

          <Input
            label="Target Amount ($)"
            type="number"
            value={formData.targetAmount}
            onChange={e => setFormData({ ...formData, targetAmount: e.target.value })}
            placeholder="0.00"
            step="0.01"
            min="0"
            required
          />

          <Input
            label="Current Amount ($)"
            type="number"
            value={formData.currentAmount}
            onChange={e => setFormData({ ...formData, currentAmount: e.target.value })}
            placeholder="0.00"
            step="0.01"
            min="0"
            required
          />

          <Input
            label="Target Date"
            type="date"
            value={formData.deadline}
            onChange={e => setFormData({ ...formData, deadline: e.target.value })}
            required
          />

          <div className="flex space-x-3 pt-4">
            <Button type="submit" className="flex-1">
              {editingGoal ? 'Update Goal' : 'Add Goal'}
            </Button>
            <Button
              type="button"
              variant="secondary"
              className="flex-1"
              onClick={handleCloseModal}
            >
              Cancel
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
