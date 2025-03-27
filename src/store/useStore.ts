import { create } from 'zustand';
import { User } from 'firebase/auth';

export interface Transaction {
  id: string;
  amount: number;
  category: string;
  date: string;
  description: string;
}

export interface Budget {
  category: string;
  amount: number;
  spent: number;
}

interface StoreState {
  user: User | null;
  transactions: Transaction[];
  budgets: Budget[];
  setUser: (user: User | null) => void;
  setTransactions: (transactions: Transaction[]) => void;
  setBudgets: (budgets: Budget[]) => void;
  addTransaction: (transaction: Transaction) => void;
  updateBudget: (category: string, spent: number) => void;
}

const useStore = create<StoreState>((set) => ({
  user: null,
  transactions: [],
  budgets: [],
  setUser: (user) => set({ user }),
  setTransactions: (transactions) => set({ transactions }),
  setBudgets: (budgets) => set({ budgets }),
  addTransaction: (transaction) =>
    set((state) => ({
      transactions: [...state.transactions, transaction],
    })),
  updateBudget: (category, spent) =>
    set((state) => ({
      budgets: state.budgets.map((budget) =>
        budget.category === category
          ? { ...budget, spent: budget.spent + spent }
          : budget
      ),
    })),
}));

export default useStore; 