'use client';

import { useState, useEffect } from 'react';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import useStore from '@/store/useStore';

interface Transaction {
  id: string;
  date: string;
  description: string;
  category: string;
  amount: number;
}

interface Message {
  id: string;
  content: string;
  type: 'user' | 'ai';
  timestamp: Date;
}

export default function AICoach() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const { user } = useStore();

  useEffect(() => {
    const fetchTransactions = async () => {
      if (!user) return;

      try {
        const transactionsRef = collection(db, 'transactions');
        const q = query(
          transactionsRef,
          where('userId', '==', user.uid),
          orderBy('date', 'desc')
        );
        const querySnapshot = await getDocs(q);
        const transactionsData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Transaction[];
        setTransactions(transactionsData);
      } catch (error) {
        console.error('Error fetching transactions:', error);
      }
    };

    fetchTransactions();
  }, [user]);

  const analyzeSpending = () => {
    const spendingByCategory = transactions.reduce((acc, transaction) => {
      acc[transaction.category] = (acc[transaction.category] || 0) + transaction.amount;
      return acc;
    }, {} as Record<string, number>);

    const totalSpending = transactions.reduce((sum, transaction) => sum + transaction.amount, 0);
    const averageTransaction = totalSpending / transactions.length;

    return {
      spendingByCategory,
      totalSpending,
      averageTransaction,
    };
  };

  const generateAIResponse = async (userMessage: string) => {
    setIsLoading(true);
    const analysis = analyzeSpending();
    
    // Simulate AI processing delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    let response = '';
    
    // Basic response logic based on user message and transaction analysis
    if (userMessage.toLowerCase().includes('spending')) {
      response = `Based on your transaction history, you've spent $${Math.abs(analysis.totalSpending).toFixed(2)} in total. Your highest spending category is ${Object.entries(analysis.spendingByCategory).sort((a, b) => b[1] - a[1])[0]?.[0] || 'N/A'}.`;
    } else if (userMessage.toLowerCase().includes('budget')) {
      response = `Your average transaction amount is $${Math.abs(analysis.averageTransaction).toFixed(2)}. Consider setting a monthly budget of $${(Math.abs(analysis.totalSpending) * 1.2).toFixed(2)} to account for potential increases in expenses.`;
    } else if (userMessage.toLowerCase().includes('save')) {
      response = `To start saving, I recommend setting aside 20% of your income. Based on your spending patterns, you could potentially save $${(Math.abs(analysis.totalSpending) * 0.2).toFixed(2)} monthly.`;
    } else {
      response = "I can help you analyze your spending patterns, suggest budgeting strategies, or provide saving tips. What would you like to know more about?";
    }

    setIsLoading(false);
    return response;
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputMessage,
      type: 'user',
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');

    const aiResponse = await generateAIResponse(inputMessage);
    
    const aiMessage: Message = {
      id: (Date.now() + 1).toString(),
      content: aiResponse,
      type: 'ai',
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, aiMessage]);
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:px-6">
          <h1 className="text-2xl font-bold text-gray-900">AI Budget Coach</h1>
          <p className="mt-1 text-sm text-gray-500">
            Get personalized financial advice and insights based on your spending patterns
          </p>
        </div>

        {/* Chat Messages */}
        <div className="border-t border-gray-200 px-4 py-5 sm:px-6 h-[500px] overflow-y-auto">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${
                message.type === 'user' ? 'justify-end' : 'justify-start'
              } mb-4`}
            >
              <div
                className={`rounded-lg px-4 py-2 max-w-[80%] ${
                  message.type === 'user'
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gray-100 text-gray-900'
                }`}
              >
                <p className="text-sm">{message.content}</p>
                <p className="text-xs mt-1 opacity-70">
                  {message.timestamp.toLocaleTimeString()}
                </p>
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start mb-4">
              <div className="bg-gray-100 rounded-lg px-4 py-2">
                <div className="flex space-x-2">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-100" />
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-200" />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Input Form */}
        <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
          <form onSubmit={handleSendMessage} className="flex space-x-4">
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="Ask for financial advice..."
              className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              disabled={isLoading}
            />
            <button
              type="submit"
              disabled={isLoading}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
            >
              Send
            </button>
          </form>
        </div>
      </div>

      {/* Quick Tips */}
      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="h-6 w-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Spending Analysis</dt>
                  <dd className="text-sm text-gray-900">Get insights into your spending patterns and identify areas for improvement.</dd>
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
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Budget Planning</dt>
                  <dd className="text-sm text-gray-900">Receive personalized budget recommendations based on your financial goals.</dd>
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
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Saving Strategies</dt>
                  <dd className="text-sm text-gray-900">Get personalized tips on how to save more and reach your financial goals faster.</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 