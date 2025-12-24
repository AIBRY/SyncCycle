'use client';

import { useAuthStore } from '@/stores/auth'; //
import Link from 'next/link'; // Next.js version of Link
import { 
  Target, 
  DollarSign, 
  ListChecks, 
  HeartPulse,
  Calendar,
  TrendingUp
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase'; //

export default function DashboardPage() {
  const { user } = useAuthStore(); //

  const { data: recentGoals } = useQuery({
    queryKey: ['recent-goals', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('goals')
        .select('*')
        .or(`user_id.eq.${user?.id},couple_id.in.(select id from couples where partner1_id=${user?.id} or partner2_id=${user?.id})`)
        .order('created_at', { ascending: false })
        .limit(3);
      
      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });

  const { data: recentTransactions } = useQuery({
    queryKey: ['recent-transactions', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .or(`user_id.eq.${user?.id},couple_id.in.(select id from couples where partner1_id=${user?.id} or partner2_id=${user?.id})`)
        .order('transaction_date', { ascending: false })
        .limit(5);
      
      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });

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
        ? (episodeStats.reduce((sum, ep) => sum + ep.intensity, 0) / episodeStats.length).toFixed(1)
        : '0',
      icon: TrendingUp,
      color: 'text-orange-400',
      href: '/bpd-tracker'
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-100">
            Welcome back, {user?.username}!
          </h1>
          <p className="text-gray-400 mt-1">
            Here's your relationship wellness overview
          </p>
        </div>
        <div className="text-sm text-gray-400">
          <Calendar className="w-4 h-4 inline mr-1" />
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
            href={stat.href} // Changed 'to' to 'href' for Next.js Link
            className="card hover:bg-gray-700 transition-colors p-4 block"
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
        {/* Recent Goals */}
        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-100">Recent Goals</h2>
            <Link href="/goals" className="text-purple-400 hover:text-purple-300 text-sm">
              View all
            </Link>
          </div>
          <div className="space-y-3">
            {recentGoals?.map((goal) => (
              <div key={goal.id} className="flex items-center justify-between">
                <div>
                  <p className="text-gray-100">{goal.title}</p>
                  <p className="text-sm text-gray-400">
                    {goal.progress}% complete
                  </p>
                </div>
                <div className="w-16 bg-gray-700 rounded-full h-2">
                  <div 
                    className="bg-purple-600 h-2 rounded-full" 
                    style={{ width: `${goal.progress}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Transactions */}
        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-100">Recent Transactions</h2>
            <Link href="/finance" className="text-purple-400 hover:text-purple-300 text-sm">
              View all
            </Link>
          </div>
          <div className="space-y-3">
            {recentTransactions?.map((transaction) => (
              <div key={transaction.id} className="flex items-center justify-between">
                <div>
                  <p className="text-gray-100">{transaction.description}</p>
                  <p className="text-sm text-gray-400 capitalize">
                    {transaction.category}
                  </p>
                </div>
                <p className={`font-semibold ${
                  transaction.type === 'income' ? 'text-green-400' : 'text-red-400'
                }`}>
                  {transaction.type === 'income' ? '+' : '-'}${transaction.amount}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="card p-6">
        <h2 className="text-lg font-semibold text-gray-100 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Link href="/lists" className="btn-secondary text-center p-3 flex flex-col items-center">
            <ListChecks className="w-5 h-5 mb-1" />
            Add to List
          </Link>
          <Link href="/goals" className="btn-secondary text-center p-3 flex flex-col items-center">
            <Target className="w-5 h-5 mb-1" />
            New Goal
          </Link>
          <Link href="/bpd-tracker" className="btn-secondary text-center p-3 flex flex-col items-center">
            <HeartPulse className="w-5 h-5 mb-1" />
            Log Episode
          </Link>
          <Link href="/finance" className="btn-secondary text-center p-3 flex flex-col items-center">
            <DollarSign className="w-5 h-5 mb-1" />
            Add Expense
          </Link>
        </div>
      </div>
    </div>
  );
}