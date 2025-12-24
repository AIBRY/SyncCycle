'use client';

import { useState, useEffect } from 'react';
import { useAuthStore } from '@/stores/auth'; //
import { supabase } from '@/lib/supabase'; //
import { 
  IconPlus, 
  IconTrendingUp, 
  IconTrendingDown, 
  IconCurrencyDollar 
} from '@tabler/icons-react';

interface Transaction {
  id: string;
  amount: string;
  type: 'income' | 'expense';
  category: string;
  description: string;
  created_at: string;
}

export default function FinancePage() {
  const { user } = useAuthStore(); //
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    amount: '',
    type: 'expense' as 'income' | 'expense',
    category: '',
    description: '',
  });

  // Fetch data on mount or when user changes
  useEffect(() => { 
    if (user?.id) fetchTransactions(); 
  }, [user?.id]);

  async function fetchTransactions() {
    const { data } = await supabase
      .from('transactions')
      .select('*')
      .eq('user_id', user?.id)
      .order('created_at', { ascending: false });
    setTransactions(data || []);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const { error } = await supabase.from('transactions').insert({
      user_id: user?.id,
      ...formData,
    });
    
    if (!error) {
      setFormData({ amount: '', type: 'expense', category: '', description: '' });
      setShowForm(false);
      fetchTransactions();
    }
  }

  // Business Logic for Stats
  const totalExpense: number = transactions
    ?.filter((t: Transaction) => t.type === 'expense')
    .reduce((sum: number, t: Transaction) => sum + parseFloat(t.amount), 0) || 0;

  const totalIncome: number = transactions
    ?.filter((t: Transaction) => t.type === 'income')
    .reduce((sum: number, t: Transaction) => sum + parseFloat(t.amount), 0) || 0;

  const categories = transactions?.reduce((acc: Record<string, number>, transaction: Transaction) => {
    const key = transaction.category || 'Other';
    acc[key] = (acc[key] || 0) + parseFloat(transaction.amount);
    return acc;
  }, {} as Record<string, number>) || {};

  const chartData = Object.entries(categories)
    .sort(([, a], [, b]) => (b as number) - (a as number))
    .slice(0, 5);

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-3xl font-bold text-gray-100 mb-8">Finance Tracker</h1>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="card bg-gray-800 p-6 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">Total Income</p>
              <p className="text-2xl font-bold text-green-400">${totalIncome.toFixed(2)}</p>
            </div>
            <IconTrendingUp className="w-8 h-8 text-green-400" />
          </div>
        </div>
        <div className="card bg-gray-800 p-6 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">Total Expenses</p>
              <p className="text-2xl font-bold text-red-400">${totalExpense.toFixed(2)}</p>
            </div>
            <IconTrendingDown className="w-8 h-8 text-red-400" />
          </div>
        </div>
        <div className="card bg-gray-800 p-6 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">Net Balance</p>
              <p className="text-2xl font-bold text-purple-400">${(totalIncome - totalExpense).toFixed(2)}</p>
            </div>
            <IconCurrencyDollar className="w-8 h-8 text-purple-400" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Transaction Management */}
        <div className="card bg-gray-800 p-6 rounded-lg shadow">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-100">Recent Transactions</h2>
            <button onClick={() => setShowForm(!showForm)} className="btn-primary px-4 py-2 bg-purple-600 rounded hover:bg-purple-700 transition-colors">
              <IconPlus className="w-4 h-4 inline mr-2" />
              {showForm ? 'Cancel' : 'Add Transaction'}
            </button>
          </div>

          {showForm && (
            <form onSubmit={handleSubmit} className="space-y-4 mb-6 p-4 bg-gray-700 rounded-lg">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Amount</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  placeholder="0.00"
                  className="input w-full bg-gray-900 border border-gray-600 rounded p-2 text-white"
                  required
                />
              </div>
              {/* Other inputs remain same as original */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Type</label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value as 'income' | 'expense' })}
                  className="input w-full bg-gray-900 border border-gray-600 rounded p-2 text-white"
                >
                  <option value="expense">Expense</option>
                  <option value="income">Income</option>
                </select>
              </div>
              <button type="submit" className="btn-primary w-full py-2 bg-purple-600 rounded font-bold">
                Save Transaction
              </button>
            </form>
          )}

          <div className="space-y-3 max-h-96 overflow-y-auto mt-6">
            {transactions.map((transaction: Transaction) => (
              <div key={transaction.id} className="flex justify-between items-center bg-gray-700 p-3 rounded">
                <div>
                  <p className="font-medium text-gray-100">{transaction.description || transaction.category}</p>
                  <p className="text-sm text-gray-400">{transaction.category} • {new Date(transaction.created_at).toLocaleDateString()}</p>
                </div>
                <span className={`font-bold ${transaction.type === 'income' ? 'text-green-400' : 'text-red-400'}`}>
                  {transaction.type === 'income' ? '+' : '-'}${parseFloat(transaction.amount).toFixed(2)}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Category Summary */}
        <div className="card bg-gray-800 p-6 rounded-lg shadow h-fit">
          <h2 className="text-xl font-semibold text-gray-100 mb-4">Top Categories</h2>
          <div className="space-y-4">
            {chartData.map(([category, amount]) => (
              <div key={category}>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-gray-300">{category}</span>
                  <span className="text-gray-100 font-medium">${(amount as number).toFixed(2)}</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-1.5">
                  <div 
                    className="bg-purple-600 h-1.5 rounded-full" 
                    style={{ width: `${Math.min(((amount as number) / totalExpense) * 100, 100)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}