'use client';

import { useState } from 'react';
import { useAuthStore } from '@/stores/auth'; //
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase'; //
import { Target, Plus, Calendar, Edit2, Trash2 } from 'lucide-react';
import { format } from 'date-fns';

export default function GoalsPage() {
  const { user } = useAuthStore(); //
  const queryClient = useQueryClient();
  const [showAddGoal, setShowAddGoal] = useState(false);
  const [editingGoal, setEditingGoal] = useState<any>(null);

  // Fetch Goals
  const { data: goals } = useQuery({
    queryKey: ['goals', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('goals')
        .select('*')
        .or(`user_id.eq.${user?.id},couple_id.in.(select id from couples where partner1_id=${user?.id} or partner2_id=${user?.id})`)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });

  // Mutations
  const createGoalMutation = useMutation({
    mutationFn: async (goal: any) => {
      const { data, error } = await supabase
        .from('goals')
        .insert({ ...goal, user_id: user?.id })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['goals', user?.id] });
      setShowAddGoal(false);
    },
  });

  const updateGoalMutation = useMutation({
    mutationFn: async (goal: any) => {
      const { data, error } = await supabase
        .from('goals')
        .update(goal)
        .eq('id', goal.id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['goals', user?.id] });
      setEditingGoal(null);
    },
  });

  const deleteGoalMutation = useMutation({
    mutationFn: async (goalId: string) => {
      const { error } = await supabase
        .from('goals')
        .delete()
        .eq('id', goalId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['goals', user?.id] });
    },
  });

  const updateProgress = async (goalId: string, newProgress: number) => {
    const { data, error } = await supabase
      .from('goals')
      .update({ progress: newProgress })
      .eq('id', goalId)
      .select()
      .single();
    
    if (error) throw error;
    queryClient.invalidateQueries({ queryKey: ['goals', user?.id] });
    return data;
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto p-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-100">Goals</h1>
        <button
          onClick={() => setShowAddGoal(true)}
          className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
        >
          <Plus className="w-4 h-4" />
          New Goal
        </button>
      </div>

      {/* Goals Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {goals?.map((goal) => (
          <div key={goal.id} className="bg-gray-800 p-6 rounded-xl border border-gray-700 hover:border-purple-500/50 transition-all">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-100">{goal.title}</h3>
                {goal.is_mutual && (
                  <span className="text-[10px] uppercase tracking-wider bg-purple-900/50 text-purple-300 border border-purple-500/30 px-2 py-0.5 rounded-full mt-1 inline-block">
                    Shared
                  </span>
                )}
              </div>
              <div className="flex gap-2">
                <button onClick={() => setEditingGoal(goal)} className="text-gray-400 hover:text-white transition-colors">
                  <Edit2 className="w-4 h-4" />
                </button>
                <button onClick={() => deleteGoalMutation.mutate(goal.id)} className="text-red-400 hover:text-red-300 transition-colors">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            <p className="text-gray-400 text-sm mb-4 line-clamp-2">{goal.description}</p>

            {goal.target_date && (
              <div className="flex items-center gap-2 text-xs text-gray-500 mb-4">
                <Calendar className="w-3.5 h-3.5" />
                Due: {format(new Date(goal.target_date), 'MMM dd, yyyy')}
              </div>
            )}

            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-gray-500">Progress</span>
                <span className="text-sm font-medium text-purple-400">{goal.progress}%</span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-1.5">
                <div
                  className="bg-purple-600 h-1.5 rounded-full transition-all duration-500"
                  style={{ width: `${goal.progress}%` }}
                />
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => updateProgress(goal.id, Math.min(goal.progress + 10, 100))}
                className="flex-1 bg-gray-700 hover:bg-gray-600 text-gray-200 py-1.5 rounded text-xs transition-colors"
              >
                +10%
              </button>
              <button
                onClick={() => updateProgress(goal.id, Math.max(goal.progress - 10, 0))}
                className="flex-1 bg-gray-700 hover:bg-gray-600 text-gray-200 py-1.5 rounded text-xs transition-colors"
              >
                -10%
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {!goals?.length && (
        <div className="bg-gray-800/50 border border-dashed border-gray-700 rounded-xl text-center py-20">
          <Target className="w-12 h-12 text-gray-600 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-200 mb-2">No goals yet</h3>
          <p className="text-gray-500 mb-6 text-sm">Set your first goal to start tracking progress together</p>
          <button onClick={() => setShowAddGoal(true)} className="bg-purple-600 text-white px-6 py-2 rounded-lg font-medium">
            Create Your First Goal
          </button>
        </div>
      )}

      {/* Modal Logic */}
      {(showAddGoal || editingGoal) && (
        <GoalModal
          goal={editingGoal}
          onClose={() => {
            setShowAddGoal(false);
            setEditingGoal(null);
          }}
          onSave={(goalData: any) => {
            if (editingGoal) {
              updateGoalMutation.mutate({ ...goalData, id: editingGoal.id });
            } else {
              createGoalMutation.mutate(goalData);
            }
          }}
        />
      )}
    </div>
  );
}

// Modal Component
function GoalModal({ goal, onClose, onSave }: { goal?: any; onClose: () => void; onSave: (goal: any) => void }) {
  const [formData, setFormData] = useState({
    title: goal?.title || '',
    description: goal?.description || '',
    category: goal?.category || '',
    target_date: goal?.target_date || '',
    is_mutual: goal?.is_mutual || false,
  });

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 border border-gray-700 w-full max-w-md p-6 rounded-xl shadow-2xl">
        <h2 className="text-xl font-bold text-white mb-6">
          {goal ? 'Edit Goal' : 'Create New Goal'}
        </h2>
        
        <form onSubmit={(e) => { e.preventDefault(); onSave(formData); }} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-400 uppercase mb-1.5">Title</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full bg-gray-900 border border-gray-700 rounded-lg p-2.5 text-white focus:border-purple-500 outline-none"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-400 uppercase mb-1.5">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full bg-gray-900 border border-gray-700 rounded-lg p-2.5 text-white h-24 resize-none outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase mb-1.5">Category</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full bg-gray-900 border border-gray-700 rounded-lg p-2.5 text-white outline-none"
                required
              >
                <option value="">Select...</option>
                <option value="health">Health</option>
                <option value="finance">Finance</option>
                <option value="relationship">Relationship</option>
                <option value="personal">Personal</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase mb-1.5">Target Date</label>
              <input
                type="date"
                value={formData.target_date}
                onChange={(e) => setFormData({ ...formData, target_date: e.target.value })}
                className="w-full bg-gray-900 border border-gray-700 rounded-lg p-2.5 text-white outline-none"
              />
            </div>
          </div>

          <div className="flex items-center gap-3 py-2">
            <input
              type="checkbox"
              id="is_mutual"
              checked={formData.is_mutual}
              onChange={(e) => setFormData({ ...formData, is_mutual: e.target.checked })}
              className="w-4 h-4 rounded border-gray-700 bg-gray-900 text-purple-600 focus:ring-purple-500"
            />
            <label htmlFor="is_mutual" className="text-sm text-gray-300 select-none">
              Shared goal with partner
            </label>
          </div>

          <div className="flex gap-3 mt-6">
            <button type="button" onClick={onClose} className="flex-1 bg-gray-700 text-white py-2.5 rounded-lg font-medium">
              Cancel
            </button>
            <button type="submit" className="flex-1 bg-purple-600 text-white py-2.5 rounded-lg font-medium">
              {goal ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}