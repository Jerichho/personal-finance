'use client';

import { useState, useEffect } from 'react';
import { collection, query, where, getDocs, addDoc, updateDoc, doc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import useStore from '@/store/useStore';
import { motion, AnimatePresence } from 'framer-motion';
import useNotificationStore from '@/store/useNotificationStore';

interface BudgetCategory {
  id: string;
  name: string;
  amount: number;
  spent: number;
  color: string;
}

export default function Budget() {
  const [categories, setCategories] = useState<BudgetCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [newCategory, setNewCategory] = useState({
    name: '',
    amount: '',
    color: '#4F46E5', // Default indigo color
  });
  const { user } = useStore();
  const { addNotification } = useNotificationStore();

  useEffect(() => {
    if (user) {
      fetchBudgetCategories();
    }
  }, [user]);

  const fetchBudgetCategories = async () => {
    try {
      const budgetRef = collection(db, 'budgets');
      const q = query(budgetRef, where('userId', '==', user?.uid));
      const querySnapshot = await getDocs(q);
      const categoriesData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as BudgetCategory[];
      setCategories(categoriesData);
    } catch (err) {
      setError('Error fetching budget categories');
      console.error('Error fetching budget categories:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      const categoryData = {
        ...newCategory,
        amount: parseFloat(newCategory.amount),
        spent: 0,
        userId: user.uid,
      };

      const docRef = await addDoc(collection(db, 'budgets'), categoryData);
      const newCategoryWithId = {
        id: docRef.id,
        ...categoryData,
        spent: 0,
      };

      setCategories(prev => [...prev, newCategoryWithId]);
      setNewCategory({
        name: '',
        amount: '',
        color: '#4F46E5',
      });

      // Show success notification
      addNotification(
        `Successfully added budget category "${newCategory.name}" with $${newCategory.amount}`,
        'success'
      );
    } catch (err) {
      console.error('Error adding budget category:', err);
      addNotification('Error adding budget category', 'error');
    }
  };

  const updateSpentAmount = async (categoryId: string, newSpent: number) => {
    try {
      const categoryRef = doc(db, 'budgets', categoryId);
      await updateDoc(categoryRef, { spent: newSpent });
      
      setCategories(prev => prev.map(cat => 
        cat.id === categoryId ? { ...cat, spent: newSpent } : cat
      ));

      // Show warning if spending exceeds 80% of budget
      const category = categories.find(cat => cat.id === categoryId);
      if (category && newSpent > category.amount * 0.8) {
        addNotification(
          `Warning: You've spent over 80% of your ${category.name} budget!`,
          'warning'
        );
      }
    } catch (err) {
      console.error('Error updating spent amount:', err);
      addNotification('Error updating spent amount', 'error');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-red-500 text-center p-4">
        {error}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Add Budget Category</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Category Name</label>
            <input
              type="text"
              required
              value={newCategory.name}
              onChange={(e) => setNewCategory(prev => ({ ...prev, name: e.target.value }))}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Budget Amount</label>
            <input
              type="number"
              step="0.01"
              required
              value={newCategory.amount}
              onChange={(e) => setNewCategory(prev => ({ ...prev, amount: e.target.value }))}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Color</label>
            <input
              type="color"
              value={newCategory.color}
              onChange={(e) => setNewCategory(prev => ({ ...prev, color: e.target.value }))}
              className="mt-1 block w-full h-10 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            />
          </div>
          <button
            type="submit"
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Add Category
          </button>
        </form>
      </div>

      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Budget Categories</h2>
        <div className="space-y-4">
          <AnimatePresence>
            {categories.map((category) => (
              <motion.div
                key={category.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="p-4 bg-gray-50 rounded-lg"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center">
                    <div
                      className="w-4 h-4 rounded-full mr-2"
                      style={{ backgroundColor: category.color }}
                    />
                    <h3 className="font-medium text-gray-900">{category.name}</h3>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-500">
                      ${category.spent.toFixed(2)} / ${category.amount.toFixed(2)}
                    </p>
                    <p className="text-sm text-gray-500">
                      {((category.spent / category.amount) * 100).toFixed(1)}%
                    </p>
                  </div>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="h-2 rounded-full"
                    style={{
                      width: `${Math.min((category.spent / category.amount) * 100, 100)}%`,
                      backgroundColor: category.color,
                    }}
                  />
                </div>
                <div className="mt-2 flex justify-end space-x-2">
                  <button
                    onClick={() => updateSpentAmount(category.id, Math.max(0, category.spent - 10))}
                    className="px-2 py-1 text-sm text-gray-600 hover:text-gray-900"
                  >
                    -$10
                  </button>
                  <button
                    onClick={() => updateSpentAmount(category.id, category.spent + 10)}
                    className="px-2 py-1 text-sm text-gray-600 hover:text-gray-900"
                  >
                    +$10
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
} 