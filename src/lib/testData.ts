import { Transaction, Budget } from '@/store/useStore';

export const sampleTransactions: Transaction[] = [
  {
    id: '1',
    amount: 150.00,
    category: 'Food & Dining',
    date: '2024-03-25',
    description: 'Grocery shopping at Walmart',
  },
  {
    id: '2',
    amount: 45.00,
    category: 'Transportation',
    date: '2024-03-24',
    description: 'Gas station',
  },
  {
    id: '3',
    amount: 1200.00,
    category: 'Housing',
    date: '2024-03-01',
    description: 'Monthly rent',
  },
  {
    id: '4',
    amount: 85.00,
    category: 'Entertainment',
    date: '2024-03-23',
    description: 'Movie night with friends',
  },
  {
    id: '5',
    amount: 200.00,
    category: 'Shopping',
    date: '2024-03-22',
    description: 'New clothes',
  },
];

export const sampleBudgets: Budget[] = [
  {
    category: 'Food & Dining',
    amount: 500.00,
    spent: 150.00,
  },
  {
    category: 'Transportation',
    amount: 200.00,
    spent: 45.00,
  },
  {
    category: 'Housing',
    amount: 1500.00,
    spent: 1200.00,
  },
  {
    category: 'Entertainment',
    amount: 200.00,
    spent: 85.00,
  },
  {
    category: 'Shopping',
    amount: 300.00,
    spent: 200.00,
  },
]; 