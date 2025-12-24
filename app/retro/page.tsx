'use client'; // Required for useEffect and Supabase hooks

import { useState, useEffect } from 'react';
import { useAuthStore } from '@/stores/auth'; //
import { supabase } from '@/lib/supabase'; //
import { 
  IconTrendingUp, 
  IconTarget, 
  IconHeart, 
  IconCurrencyDollar 
} from '@tabler/icons-react';

// Interfaces preserved from your original Retro.tsx
interface Transaction {
  id: string;
  amount: string;
  type: 'income' | 'expense';
  category: string;
  created_at: string;
}

interface Episode {
  id: string;
  intensity: number;
  effectiveness?: number;
  trigger: string;
  created_at: string;
}

interface Goal {
  id: string;
  title: string;
  progress: number;
  created_at: string;
}

interface WeeklyData {
  transactions: Transaction[];
  episodes: Episode[];
  goals: Goal[];
}

export default function RetroPage() {
  const { user } = useAuthStore(); //
  const [weeklyData, setWeeklyData] = useState<WeeklyData>({ 
    transactions: [], 
    episodes: [], 
    goals: [] 
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => { 
    if (user?.id) fetchWeeklyData(); 
  }, [user?.id]);

  async function fetchWeeklyData() {
    setLoading(true);
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);

    // Concurrent fetching for performance
    const [tx, ep, gl] = await Promise.all([
      supabase.from('transactions').select('*').eq('user_id', user?.id).gte('created_at', weekAgo.toISOString()),
      supabase.from('episodes').select('*').eq('user_id', user?.id).gte('created_at', weekAgo.toISOString()),
      supabase.from('goals').select('*').eq('user_id', user?.id).gte('created_at', weekAgo.toISOString()),
    ]);

    setWeeklyData({
      transactions: tx.data || [],
      episodes: ep.data || [],
      goals: gl.data || [],
    });
    setLoading(false);
  }

  // Business Logic for Finance
  const totalExpense = weeklyData.transactions
    ?.filter((t: Transaction) => t.type === 'expense')
    .reduce((sum: number, t: Transaction) => sum + parseFloat(t.amount), 0) || 0;

  const totalIncome = weeklyData.transactions
    ?.filter((t: Transaction) => t.type === 'income')
    .reduce((sum: number, t: Transaction) => sum + parseFloat(t.amount), 0) || 0;

  // Business Logic for BPD Episodes
  const avgIntensity = weeklyData.episodes.length 
    ? weeklyData.episodes.reduce((sum, ep) => sum + ep.intensity, 0) / weeklyData.episodes.length 
    : 0;
  
  const avgEffectiveness = weeklyData.episodes.length 
    ? weeklyData.episodes.reduce((sum, ep) => sum + (ep.effectiveness || 0), 0) / weeklyData.episodes.length 
    : 0;

  // Category Breakdown Logic
  const categories = weeklyData.transactions.reduce((acc: Record<string, number>, t: Transaction) => {
    const key = t.category || 'Other';
    acc[key] = (acc[key] || 0) + parseFloat(t.amount);
    return acc;
  }, {} as Record<string, number>);

  const topExpenseCategories = Object.entries(categories)
    .sort(([, a], [, b]) => (b as number) - (a as number))
    .slice(0, 5);

  const goalStats = {
    total: weeklyData.goals.length,
    completed: weeklyData.goals.filter((g: Goal) => g.progress === 100).length,
    inProgress: weeklyData.goals.filter((g: Goal) => g.progress > 0 && g.progress < 100).length,
    notStarted: weeklyData.goals.filter((g: Goal) => g.progress === 0).length,
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      <header>
        <h1 className="text-3xl font-bold text-gray-100">Weekly Retro</h1>
        <p className="text-gray-400 mt-2">A look back at the last 7 days</p>
      </header>

      {/* High-Level Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gray-800 p-6 rounded-xl border border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">Net Cash Flow</p>
              <p className={`text-2xl font-bold ${totalIncome - totalExpense >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                ${(totalIncome - totalExpense).toFixed(2)}
              </p>
            </div>
            <IconCurrencyDollar className="w-8 h-8 text-purple-400" />
          </div>
        </div>
        
        <div className="bg-gray-800 p-6 rounded-xl border border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">Avg Episode Intensity</p>
              <p className="text-2xl font-bold text-red-400">{avgIntensity.toFixed(1)}</p>
            </div>
            <IconHeart className="w-8 h-8 text-red-400" />
          </div>
        </div>

        <div className="bg-gray-800 p-6 rounded-xl border border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">Goals Completed</p>
              <p className="text-2xl font-bold text-green-400">{goalStats.completed}</p>
            </div>
            <IconTarget className="w-8 h-8 text-green-400" />
          </div>
        </div>
      </div>

      {/* Detailed Breakdown Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Finance Breakdown */}
        <div className="bg-gray-800 p-6 rounded-xl border border-gray-700">
          <h2 className="text-xl font-semibold text-gray-100 mb-6 flex items-center gap-2">
             <IconTrendingUp className="w-5 h-5 text-purple-400" />
             Expense Breakdown
          </h2>
          <div className="space-y-4">
            {topExpenseCategories.map(([category, amount]) => (
              <div key={category}>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-gray-300">{category}</span>
                  <span className="text-gray-100 font-medium">${(amount as number).toFixed(2)}</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-1.5">
                  <div 
                    className="bg-purple-600 h-1.5 rounded-full" 
                    style={{ width: `${totalExpense ? ((amount as number) / totalExpense) * 100 : 0}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Goal Summary */}
        <div className="bg-gray-800 p-6 rounded-xl border border-gray-700">
          <h2 className="text-xl font-semibold text-gray-100 mb-6">Goal Summary</h2>
          <div className="space-y-4">
            <div className="flex justify-between border-b border-gray-700 pb-2">
              <span className="text-gray-400">Total Created</span>
              <span className="text-gray-100 font-bold">{goalStats.total}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Completed</span>
              <span className="text-green-400 font-medium">{goalStats.completed}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">In Progress</span>
              <span className="text-yellow-400 font-medium">{goalStats.inProgress}</span>
            </div>
          </div>
          
          {weeklyData.goals.filter(g => g.progress > 0).length > 0 && (
            <div className="mt-6 pt-6 border-t border-gray-700">
              <h3 className="text-sm font-semibold text-gray-300 uppercase mb-3">Recent Progress</h3>
              <div className="space-y-2">
                {weeklyData.goals.filter(g => g.progress > 0).slice(0, 3).map(goal => (
                  <div key={goal.id} className="flex justify-between bg-gray-900/50 p-2 rounded text-sm">
                    <span className="text-gray-300 truncate mr-4">{goal.title}</span>
                    <span className="text-purple-400 font-mono">{goal.progress}%</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Episode Insights Section */}
      {weeklyData.episodes.length > 0 && (
        <div className="bg-gray-800 p-6 rounded-xl border border-gray-700">
          <h2 className="text-xl font-semibold text-gray-100 mb-6">Weekly Episode Insights</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Total Registered Episodes</span>
                <span className="text-gray-100">{weeklyData.episodes.length}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Avg. Emotional Intensity</span>
                <span className="text-gray-100">{avgIntensity.toFixed(1)}/10</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Coping Effectiveness</span>
                <span className="text-gray-100">{avgEffectiveness.toFixed(1)}/10</span>
              </div>
            </div>
            <div className="bg-gray-900/40 p-4 rounded-lg">
              <p className="text-xs text-gray-500 italic">
                Tip: Higher effectiveness scores usually correlate with consistent use of your listed coping skills.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}