'use client';

import { useState, useEffect } from 'react';
import { collection, query, where, getDocs, addDoc, updateDoc, doc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import useStore from '@/store/useStore';

interface Budget {
  id: string;
  category: string;
  amount: number;
  spent: number;
  userId: string;
}

const categories = [
  'Food',
  'Transportation',
  'Entertainment',
  'Utilities',
  'Shopping',
  'Housing',
  'Healthcare',
  'Education',
  'Other'
];

export default function Budget() {
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const { user } = useStore();

  // Form state
  const [newBudget, setNewBudget] = useState({
    category: '',
    amount: '',
    spent: '0'
  });

  useEffect(() => {
    const fetchBudgets = async () => {
      if (!user) return;
      
      try {
        const budgetsRef = collection(db, 'budgets');
        const q = query(budgetsRef, where('userId', '==', user.uid));
        const querySnapshot = await getDocs(q);
        const budgetsData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Budget[];
        setBudgets(budgetsData);
      } catch (error) {
        console.error('Error fetching budgets:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchBudgets();
  }, [user]);

  const handleAddBudget = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      const budgetData = {
        ...newBudget,
        amount: parseFloat(newBudget.amount),
        spent: parseFloat(newBudget.spent),
        userId: user.uid
      };

      const docRef = await addDoc(collection(db, 'budgets'), budgetData);
      setBudgets(prev => [...prev, { id: docRef.id, ...budgetData }]);
      setShowAddForm(false);
      setNewBudget({
        category: '',
        amount: '',
        spent: '0'
      });
    } catch (error) {
      console.error('Error adding budget:', error);
    }
  };

  const handleUpdateSpent = async (budget: Budget, newSpent: number) => {
    try {
      const budgetRef = doc(db, 'budgets', budget.id);
      await updateDoc(budgetRef, { spent: newSpent });
      setBudgets(prev => prev.map(b => 
        b.id === budget.id ? { ...b, spent: newSpent } : b
      ));
    } catch (error) {
      console.error('Error updating budget:', error);
    }
  };

  const totalBudget = budgets.reduce((sum, budget) => sum + budget.amount, 0);
  const totalSpent = budgets.reduce((sum, budget) => sum + budget.spent, 0);
  const totalRemaining = totalBudget - totalSpent;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header and Summary */}
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Budget Overview</h1>
            <p className="mt-1 text-sm text-gray-500">Track and manage your spending</p>
          </div>
          <button
            onClick={() => setShowAddForm(true)}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Add Budget Category
          </button>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-3">
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <svg className="h-6 w-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Total Budget</dt>
                    <dd className="text-lg font-medium text-gray-900">${totalBudget.toFixed(2)}</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <svg className="h-6 w-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Total Spent</dt>
                    <dd className="text-lg font-medium text-red-600">${totalSpent.toFixed(2)}</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <svg className="h-6 w-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Remaining</dt>
                    <dd className={`text-lg font-medium ${totalRemaining >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      ${Math.abs(totalRemaining).toFixed(2)}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Add Budget Form */}
      {showAddForm && (
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-medium mb-4">Add New Budget Category</h2>
          <form onSubmit={handleAddBudget} className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="category" className="block text-sm font-medium text-gray-700">
                  Category
                </label>
                <select
                  id="category"
                  value={newBudget.category}
                  onChange={(e) => setNewBudget(prev => ({ ...prev, category: e.target.value }))}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  required
                >
                  <option value="">Select a category</option>
                  {categories.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="amount" className="block text-sm font-medium text-gray-700">
                  Budget Amount
                </label>
                <input
                  type="number"
                  id="amount"
                  step="0.01"
                  value={newBudget.amount}
                  onChange={(e) => setNewBudget(prev => ({ ...prev, amount: e.target.value }))}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  required
                />
              </div>
            </div>
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Add Category
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Budget Categories */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {budgets.map((budget) => {
          const progress = (budget.spent / budget.amount) * 100;
          const isOverBudget = budget.spent > budget.amount;

          return (
            <div key={budget.id} className="bg-white rounded-lg shadow p-6">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-lg font-semibold">{budget.category}</h3>
                <button
                  onClick={() => handleUpdateSpent(budget, budget.spent + 10)}
                  className="text-sm text-indigo-600 hover:text-indigo-900"
                >
                  +$10
                </button>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Budgeted:</span>
                  <span>${budget.amount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Spent:</span>
                  <span className={isOverBudget ? 'text-red-600' : 'text-green-600'}>
                    ${budget.spent.toFixed(2)}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div
                    className={`h-2.5 rounded-full ${
                      isOverBudget ? 'bg-red-600' : 'bg-green-600'
                    }`}
                    style={{ width: `${Math.min(progress, 100)}%` }}
                  ></div>
                </div>
                <div className="text-sm text-gray-500">
                  {progress.toFixed(1)}% of budget used
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {budgets.length === 0 && (
        <div className="text-center py-12 bg-white rounded-lg shadow">
          <p className="text-gray-500">No budgets found. Create your first budget category to get started!</p>
        </div>
      )}
    </div>
  );
} 