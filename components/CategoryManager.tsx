'use client';

import React, { useState, useEffect } from 'react';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { Modal } from './ui/Modal';
import { CustomCategory } from '@/types/expense';
import { categoryStorage } from '@/lib/categoryStorage';

const EMOJI_OPTIONS = ['🏠', '💰', '🎓', '💊', '🏋️', '🎁', '✈️', '🐕', '👶', '💼', '🔧', '📱', '💡', '🎵', '📚', '🍕', '☕', '🎬', '🏥', '💳'];
const COLOR_OPTIONS = ['#ef4444', '#f97316', '#f59e0b', '#84cc16', '#22c55e', '#14b8a6', '#06b6d4', '#3b82f6', '#6366f1', '#8b5cf6', '#a855f7', '#ec4899'];

interface CategoryFormData {
  name: string;
  icon: string;
  color: string;
}

interface CategoryManagerProps {
  onCategoriesChange?: () => void;
}

export const CategoryManager: React.FC<CategoryManagerProps> = ({ onCategoriesChange }) => {
  const [categories, setCategories] = useState<CustomCategory[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<CustomCategory | null>(null);
  const [formData, setFormData] = useState<CategoryFormData>({
    name: '',
    icon: '📌',
    color: '#6b7280',
  });
  const [error, setError] = useState('');

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = () => {
    setCategories(categoryStorage.getAll());
  };

  const handleOpenModal = (category?: CustomCategory) => {
    if (category) {
      setEditingCategory(category);
      setFormData({
        name: category.name,
        icon: category.icon,
        color: category.color,
      });
    } else {
      setEditingCategory(null);
      setFormData({ name: '', icon: '📌', color: '#6b7280' });
    }
    setError('');
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingCategory(null);
    setFormData({ name: '', icon: '📌', color: '#6b7280' });
    setError('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      setError('Category name is required');
      return;
    }

    try {
      if (editingCategory) {
        categoryStorage.update(editingCategory.id, formData);
      } else {
        categoryStorage.add(formData);
      }

      loadCategories();
      handleCloseModal();
      onCategoriesChange?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save category');
    }
  };

  const handleDelete = (category: CustomCategory) => {
    if (category.isDefault) {
      setError('Cannot delete default categories');
      return;
    }

    if (confirm(`Delete category "${category.name}"? Expenses with this category will keep their label but may need to be recategorized.`)) {
      try {
        categoryStorage.delete(category.id);
        loadCategories();
        onCategoriesChange?.();
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to delete category');
      }
    }
  };

  return (
    <Card title="Manage Categories">
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <p className="text-sm text-gray-600">
            {categories.length} categories ({categories.filter(c => !c.isDefault).length} custom)
          </p>
          <Button onClick={() => handleOpenModal()} size="sm">
            + Add Category
          </Button>
        </div>

        {error && !isModalOpen && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {categories.map(category => (
            <div
              key={category.id}
              className="flex items-center justify-between p-3 rounded-lg border border-gray-200 hover:border-gray-300 transition-colors"
              style={{ borderLeftColor: category.color, borderLeftWidth: '4px' }}
            >
              <div className="flex items-center gap-2">
                <span className="text-xl">{category.icon}</span>
                <span className="font-medium">{category.name}</span>
                {category.isDefault && (
                  <span className="text-xs px-1.5 py-0.5 bg-gray-100 text-gray-500 rounded">
                    Default
                  </span>
                )}
              </div>
              <div className="flex gap-1">
                <button
                  onClick={() => handleOpenModal(category)}
                  className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                  title="Edit"
                >
                  ✏️
                </button>
                {!category.isDefault && (
                  <button
                    onClick={() => handleDelete(category)}
                    className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                    title="Delete"
                  >
                    🗑️
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={editingCategory ? 'Edit Category' : 'Add New Category'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
              {error}
            </div>
          )}

          <Input
            label="Category Name"
            type="text"
            value={formData.name}
            onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
            placeholder="e.g., Groceries, Gym, Subscriptions"
            disabled={editingCategory?.isDefault}
            maxLength={30}
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Icon
            </label>
            <div className="flex flex-wrap gap-2">
              {EMOJI_OPTIONS.map(emoji => (
                <button
                  key={emoji}
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, icon: emoji }))}
                  className={`w-10 h-10 text-xl flex items-center justify-center rounded-lg border-2 transition-all ${
                    formData.icon === emoji
                      ? 'border-blue-500 bg-blue-50 scale-110'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Color
            </label>
            <div className="flex flex-wrap gap-2">
              {COLOR_OPTIONS.map(color => (
                <button
                  key={color}
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, color }))}
                  className={`w-8 h-8 rounded-full border-2 transition-all ${
                    formData.color === color
                      ? 'border-gray-800 scale-110 ring-2 ring-offset-2 ring-gray-400'
                      : 'border-transparent hover:scale-105'
                  }`}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
            <span className="text-sm text-gray-600">Preview:</span>
            <div
              className="flex items-center gap-2 px-3 py-1.5 rounded-full text-white font-medium"
              style={{ backgroundColor: formData.color }}
            >
              <span>{formData.icon}</span>
              <span>{formData.name || 'Category Name'}</span>
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <Button type="button" variant="secondary" onClick={handleCloseModal} className="flex-1">
              Cancel
            </Button>
            <Button type="submit" className="flex-1">
              {editingCategory ? 'Save Changes' : 'Add Category'}
            </Button>
          </div>
        </form>
      </Modal>
    </Card>
  );
};
