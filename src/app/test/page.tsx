'use client';

import { useState } from 'react';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, deleteUser } from 'firebase/auth';
import { doc, setDoc, deleteDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';

export default function Test() {
  const [status, setStatus] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const testSetup = async () => {
    setIsLoading(true);
    setStatus('Starting test setup...');
    setError('');

    try {
      const email = 'test2@example.com';
      const password = 'testpassword123';

      // Try to sign in first
      try {
        await signInWithEmailAndPassword(auth, email, password);
        setStatus('User already exists, proceeding with data setup...');
      } catch (error: any) {
        if (error.code === 'auth/user-not-found') {
          // Create new user if doesn't exist
          const userCredential = await createUserWithEmailAndPassword(auth, email, password);
          setStatus('Created test user...');
        } else {
          throw error;
        }
      }

      // Get current user
      const user = auth.currentUser;
      if (!user) throw new Error('No user found');

      // Add sample transactions
      const transactions = [
        {
          date: new Date().toISOString(),
          description: 'Grocery Shopping',
          category: 'Food',
          amount: -150.50,
          userId: user.uid
        },
        {
          date: new Date(Date.now() - 86400000).toISOString(), // Yesterday
          description: 'Salary Deposit',
          category: 'Income',
          amount: 3000.00,
          userId: user.uid
        },
        {
          date: new Date(Date.now() - 172800000).toISOString(), // 2 days ago
          description: 'Netflix Subscription',
          category: 'Entertainment',
          amount: -15.99,
          userId: user.uid
        },
        {
          date: new Date(Date.now() - 259200000).toISOString(), // 3 days ago
          description: 'Gas Station',
          category: 'Transportation',
          amount: -45.00,
          userId: user.uid
        },
        {
          date: new Date(Date.now() - 345600000).toISOString(), // 4 days ago
          description: 'Restaurant Dinner',
          category: 'Food',
          amount: -85.00,
          userId: user.uid
        }
      ];

      // Add transactions to Firestore
      for (const transaction of transactions) {
        const docRef = doc(collection(db, 'transactions'));
        await setDoc(docRef, transaction);
      }
      setStatus('Added sample transactions...');

      // Add sample budgets
      const budgets = [
        {
          category: 'Food',
          amount: 500.00,
          spent: 235.50,
          userId: user.uid
        },
        {
          category: 'Transportation',
          amount: 200.00,
          spent: 45.00,
          userId: user.uid
        },
        {
          category: 'Entertainment',
          amount: 100.00,
          spent: 15.99,
          userId: user.uid
        },
        {
          category: 'Utilities',
          amount: 300.00,
          spent: 250.00,
          userId: user.uid
        },
        {
          category: 'Shopping',
          amount: 200.00,
          spent: 180.00,
          userId: user.uid
        }
      ];

      // Add budgets to Firestore
      for (const budget of budgets) {
        const docRef = doc(collection(db, 'budgets'));
        await setDoc(docRef, budget);
      }
      setStatus('Added sample budgets...');

      setStatus('Test setup completed successfully! You can now log in with test2@example.com / testpassword123');
    } catch (error: any) {
      console.error('Test setup error:', error);
      setError(error.message || 'An error occurred during test setup');
    } finally {
      setIsLoading(false);
    }
  };

  const deleteTestUser = async () => {
    setIsLoading(true);
    setStatus('Starting cleanup...');
    setError('');

    try {
      const user = auth.currentUser;
      if (!user) {
        setError('No user found to delete');
        return;
      }

      // Delete user's transactions
      const transactionsRef = collection(db, 'transactions');
      const transactionsQuery = query(transactionsRef, where('userId', '==', user.uid));
      const transactionsSnapshot = await getDocs(transactionsQuery);
      for (const doc of transactionsSnapshot.docs) {
        await deleteDoc(doc.ref);
      }

      // Delete user's budgets
      const budgetsRef = collection(db, 'budgets');
      const budgetsQuery = query(budgetsRef, where('userId', '==', user.uid));
      const budgetsSnapshot = await getDocs(budgetsQuery);
      for (const doc of budgetsSnapshot.docs) {
        await deleteDoc(doc.ref);
      }

      // Delete user account
      await deleteUser(user);
      setStatus('Test user and data deleted successfully');
    } catch (error: any) {
      console.error('Cleanup error:', error);
      setError(error.message || 'An error occurred during cleanup');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Test Setup</h1>
      <div className="space-y-4">
        <button
          onClick={testSetup}
          disabled={isLoading}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:opacity-50"
        >
          {isLoading ? 'Running...' : 'Run Test'}
        </button>
        <button
          onClick={deleteTestUser}
          disabled={isLoading}
          className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 disabled:opacity-50 ml-4"
        >
          {isLoading ? 'Deleting...' : 'Delete Test User'}
        </button>
        {status && (
          <div className="mt-4 p-4 bg-gray-100 rounded">
            <p className="text-gray-700">{status}</p>
          </div>
        )}
        {error && (
          <div className="mt-4 p-4 bg-red-100 rounded">
            <p className="text-red-700">{error}</p>
          </div>
        )}
      </div>
    </div>
  );
} 