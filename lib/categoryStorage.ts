'use client';

import { CustomCategory, DEFAULT_CATEGORIES } from '@/types/expense';

const STORAGE_KEY = 'expense-tracker-categories';

// Default categories with icons and colors
const DEFAULT_CATEGORY_CONFIG: CustomCategory[] = [
  { id: 'food', name: 'Food', icon: '🍔', color: '#ef4444', isDefault: true, createdAt: '' },
  { id: 'transportation', name: 'Transportation', icon: '🚗', color: '#f97316', isDefault: true, createdAt: '' },
  { id: 'entertainment', name: 'Entertainment', icon: '🎮', color: '#8b5cf6', isDefault: true, createdAt: '' },
  { id: 'shopping', name: 'Shopping', icon: '🛍️', color: '#ec4899', isDefault: true, createdAt: '' },
  { id: 'bills', name: 'Bills', icon: '📄', color: '#3b82f6', isDefault: true, createdAt: '' },
  { id: 'other', name: 'Other', icon: '📌', color: '#6b7280', isDefault: true, createdAt: '' },
];

function getStoredCategories(): CustomCategory[] {
  if (typeof window === 'undefined') return DEFAULT_CATEGORY_CONFIG;

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error('Error reading categories from storage:', error);
  }

  return DEFAULT_CATEGORY_CONFIG;
}

function saveCategories(categories: CustomCategory[]): void {
  if (typeof window === 'undefined') return;

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(categories));
  } catch (error) {
    console.error('Error saving categories to storage:', error);
  }
}

export const categoryStorage = {
  getAll(): CustomCategory[] {
    return getStoredCategories();
  },

  add(category: Omit<CustomCategory, 'id' | 'createdAt' | 'isDefault'>): CustomCategory {
    const categories = getStoredCategories();

    // Check for duplicate names
    if (categories.some(c => c.name.toLowerCase() === category.name.toLowerCase())) {
      throw new Error(`Category "${category.name}" already exists`);
    }

    const newCategory: CustomCategory = {
      ...category,
      id: `custom-${Date.now()}`,
      createdAt: new Date().toISOString(),
      isDefault: false,
    };

    categories.push(newCategory);
    saveCategories(categories);

    return newCategory;
  },

  update(id: string, updates: Partial<Omit<CustomCategory, 'id' | 'createdAt'>>): CustomCategory | null {
    const categories = getStoredCategories();
    const index = categories.findIndex(c => c.id === id);

    if (index === -1) return null;

    // Check for duplicate names (excluding current category)
    if (updates.name && categories.some(c => c.id !== id && c.name.toLowerCase() === updates.name!.toLowerCase())) {
      throw new Error(`Category "${updates.name}" already exists`);
    }

    categories[index] = { ...categories[index], ...updates };
    saveCategories(categories);

    return categories[index];
  },

  delete(id: string): boolean {
    const categories = getStoredCategories();
    const category = categories.find(c => c.id === id);

    // Cannot delete default categories
    if (category?.isDefault) {
      throw new Error('Cannot delete default categories');
    }

    const filtered = categories.filter(c => c.id !== id);

    if (filtered.length === categories.length) return false;

    saveCategories(filtered);
    return true;
  },

  getByName(name: string): CustomCategory | undefined {
    return getStoredCategories().find(c => c.name.toLowerCase() === name.toLowerCase());
  },

  getCategoryNames(): string[] {
    return getStoredCategories().map(c => c.name);
  },

  getCategoryOptions(): { value: string; label: string }[] {
    return getStoredCategories().map(c => ({
      value: c.name,
      label: `${c.icon} ${c.name}`,
    }));
  },

  reset(): void {
    saveCategories(DEFAULT_CATEGORY_CONFIG);
  },
};
