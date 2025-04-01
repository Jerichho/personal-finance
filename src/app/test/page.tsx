'use client';

import { useState } from 'react';
import { auth, db } from '@/lib/firebase';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, deleteUser } from 'firebase/auth';
import { collection, addDoc, query, where, getDocs, deleteDoc, doc } from 'firebase/firestore';
import useStore from '@/store/useStore';

export default function Test() {
  const [isLoading, setIsLoading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const { setUser } = useStore();

  const testSetup = async () => {
    setIsLoading(true);
    try {
      // Try to sign in first
      const userCredential = await signInWithEmailAndPassword(auth, 'test2@example.com', 'testpassword123');
      setUser(userCredential.user);
    } catch (error: any) {
      // If user doesn't exist, create new user
      if (error.code === 'auth/user-not-found') {
        const userCredential = await createUserWithEmailAndPassword(auth, 'test2@example.com', 'testpassword123');
        setUser(userCredential.user);

        // Add sample transactions
        const transactions = [
          {
            date: new Date().toISOString().split('T')[0],
            description: 'Grocery Shopping',
            category: 'Food',
            amount: -150.50,
            userId: userCredential.user.uid
          },
          {
            date: new Date().toISOString().split('T')[0],
            description: 'Salary Deposit',
            category: 'Income',
            amount: 5000.00,
            userId: userCredential.user.uid
          },
          {
            date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            description: 'Netflix Subscription',
            category: 'Entertainment',
            amount: -15.99,
            userId: userCredential.user.uid
          },
          {
            date: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            description: 'Gas Station',
            category: 'Transportation',
            amount: -45.00,
            userId: userCredential.user.uid
          },
          {
            date: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            description: 'Amazon Purchase',
            category: 'Shopping',
            amount: -89.99,
            userId: userCredential.user.uid
          }
        ];

        // Add sample budgets
        const budgets = [
          {
            category: 'Food',
            amount: 500.00,
            spent: 150.50,
            userId: userCredential.user.uid
          },
          {
            category: 'Transportation',
            amount: 200.00,
            spent: 45.00,
            userId: userCredential.user.uid
          },
          {
            category: 'Entertainment',
            amount: 100.00,
            spent: 15.99,
            userId: userCredential.user.uid
          },
          {
            category: 'Shopping',
            amount: 300.00,
            spent: 89.99,
            userId: userCredential.user.uid
          },
          {
            category: 'Utilities',
            amount: 250.00,
            spent: 0.00,
            userId: userCredential.user.uid
          }
        ];

        // Add transactions to Firestore
        for (const transaction of transactions) {
          await addDoc(collection(db, 'transactions'), transaction);
        }

        // Add budgets to Firestore
        for (const budget of budgets) {
          await addDoc(collection(db, 'budgets'), budget);
        }
      } else {
        throw error;
      }
    } finally {
      setIsLoading(false);
    }
  };

  const deleteTestUser = async () => {
    setIsDeleting(true);
    try {
      const user = auth.currentUser;
      if (!user) {
        throw new Error('No user found');
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
      setUser(null);
    } catch (error) {
      console.error('Error deleting test user:', error);
      alert('Error deleting test user. Please try again.');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Test Setup
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Create or delete test account with sample data
          </p>
        </div>
        <div className="mt-8 space-y-4">
          <button
            onClick={testSetup}
            disabled={isLoading}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
          >
            {isLoading ? 'Setting up...' : 'Run Test'}
          </button>
          <button
            onClick={deleteTestUser}
            disabled={isDeleting}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
          >
            {isDeleting ? 'Deleting...' : 'Delete Test User'}
          </button>
        </div>
      </div>
    </div>
  );
} 