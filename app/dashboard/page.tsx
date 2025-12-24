'use client';

import { useAuthStore } from '@/stores/auth'; 
import Link from 'next/link'; 
import { 
  Target, 
  DollarSign, 
  ListChecks, 
  HeartPulse,
  Calendar,
  TrendingUp
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

export default function DashboardPage() {
  const { user } = useAuthStore();

  // 1. Recent Goals Query (Simplified filter)
  const { data: recentGoals, isLoading: goalsLoading } = useQuery({
    queryKey: ['recent-goals', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('goals')
        .select('*')
        .eq('user_id', user?.id) // Simplified for reliability
        .order('created_at', { ascending: false })
        .limit(3);
      
      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });

  // 2. Recent Transactions Query
  const { data: recentTransactions } = useQuery({
    queryKey: ['recent-transactions', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', user?.id)
        .order('transaction_date', { ascending: false })
        .limit(5);
      
      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });

  // 3. Episode Stats Query
  const { data: episodeStats } = useQuery({
    queryKey: ['episode-stats', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('episodes')
        .select('intensity, occurred_at')
        .eq('user_id', user?.id)
        .gte('occurred_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString());
      
      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });

  // Safeguard for initial loading state
  if (!user) {
    return <div className="p-8 text-gray-400">Loading your wellness overview...</div>;
  }

  const stats = [
    {
      name: 'Active Goals',
      value: recentGoals?.length || 0,
      icon: Target,
      color: 'text-blue-400',
      href: '/goals'
    },
    {
      name: 'Weekly Transactions',
      value: recentTransactions?.length || 0,
      icon: DollarSign,
      color: 'text-green-400',
      href: '/finance'
    },
    {
      name: 'Episodes This Week',
      value: episodeStats?.length || 0,
      icon: HeartPulse,
      color: 'text-purple-400',
      href: '/bpd-tracker'
    },
    {
      name: 'Avg Intensity',
      value: episodeStats?.length 
        ? (episodeStats.reduce((sum: number, ep: any) => sum + ep.intensity, 0) / episodeStats.length).toFixed(1)
        : '0',
      icon: TrendingUp,
      color: 'text-orange-400',
      href: '/bpd-tracker'
    }
  ];

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-100">
            Welcome back, {user?.username || 'User'}!
          </h1>
          <p className="text-gray-400 mt-1">
            Here's your relationship wellness overview
          </p>
        </div>
        <div className="text-sm text-gray-400 flex items-center">
          <Calendar className="w-4 h-4 mr-2" />
          {new Date().toLocaleDateString('en-US', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <Link
            key={stat.name}
            href={stat.href}
            className="bg-gray-800 border border-gray-700 rounded-xl hover:bg-gray-700 transition-colors p-4 block"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">{stat.name}</p>
                <p className="text-2xl font-bold text-gray-100 mt-1">{stat.value}</p>
              </div>
              <stat.icon className={`w-8 h-8 ${stat.color}`} />
            </div>
          </Link>
        ))}
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-gray-800 border border-gray-700 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-100">Recent Goals</h2>
            <Link href="/goals" className="text-purple-400 hover:text-purple-300 text-sm">
              View all
            </Link>
          </div>
          <div className="space-y-4">
            {recentGoals?.length ? recentGoals.map((goal) => (
              <div key={goal.id} className="flex items-center justify-between">
                <div>
                  <p className="text-gray-100 font-medium">{goal.title}</p>
                  <p className="text-xs text-gray-400">{goal.progress}% complete</p>
                </div>
                <div className="w-24 bg-gray-700 rounded-full h-2">
                  <div 
                    className="bg-purple-600 h-2 rounded-full transition-all duration-500" 
                    style={{ width: `${goal.progress}%` }}
                  />
                </div>
              </div>
            )) : <p className="text-sm text-gray-500">No recent goals found.</p>}
          </div>
        </div>

        <div className="bg-gray-800 border border-gray-700 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-100">Recent Transactions</h2>
            <Link href="/finance" className="text-purple-400 hover:text-purple-300 text-sm">
              View all
            </Link>
          </div>
          <div className="space-y-4">
            {recentTransactions?.length ? recentTransactions.map((transaction) => (
              <div key={transaction.id} className="flex items-center justify-between">
                <div>
                  <p className="text-gray-100 font-medium">{transaction.description}</p>
                  <p className="text-xs text-gray-400 capitalize">{transaction.category}</p>
                </div>
                <p className={`font-semibold ${
                  transaction.type === 'income' ? 'text-green-400' : 'text-red-400'
                }`}>
                  {transaction.type === 'income' ? '+' : '-'}${transaction.amount}
                </p>
              </div>
            )) : <p className="text-sm text-gray-500">No recent transactions.</p>}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-gray-800 border border-gray-700 rounded-xl p-6">
        <h2 className="text-lg font-semibold text-gray-100 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Add to List', href: '/lists', icon: ListChecks },
            { label: 'New Goal', href: '/goals', icon: Target },
            { label: 'Log Episode', href: '/bpd-tracker', icon: HeartPulse },
            { label: 'Add Expense', href: '/finance', icon: DollarSign },
          ].map((action) => (
            <Link 
              key={action.label}
              href={action.href} 
              className="bg-gray-700 hover:bg-gray-600 text-gray-100 text-sm font-medium rounded-lg p-4 flex flex-col items-center transition-colors"
            >
              <action.icon className="w-6 h-6 mb-2 text-purple-400" />
              {action.label}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}