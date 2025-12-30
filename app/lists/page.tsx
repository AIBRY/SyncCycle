'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/stores/auth';
import { ListChecks, Plus, Loader2, Trash2 } from 'lucide-react';

export default function ListsPage() {
  const { user } = useAuthStore();
  const [lists, setLists] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [newListName, setNewListName] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  // 1. Fetch lists on mount or when user changes
  useEffect(() => {
    async function getData() {
      if (!user?.id) return;
      
      setLoading(true);
      const { data, error } = await supabase
        .from('lists')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error("Database Error:", error.message);
      } else {
        setLists(data || []);
      }
      setLoading(false);
    }
    
    getData();
  }, [user?.id]);

  // 2. Create a new list
  const handleCreateList = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newListName.trim() || !user?.id) return;

    setIsCreating(true);
    const { data, error } = await supabase
      .from('lists')
      .insert({ 
        name: newListName.trim(), 
        user_id: user.id, 
        items: [] // Matches the JSONB column
      })
      .select()
      .single();

    if (error) {
      console.error("Error creating list:", error.message);
    } else if (data) {
      setLists((prev) => [data, ...prev]);
      setNewListName('');
    }
    setIsCreating(false);
  };

  // 3. Delete a list
  const handleDeleteList = async (id: string) => {
    const { error } = await supabase
      .from('lists')
      .delete()
      .eq('id', id);

    if (error) {
      console.error("Error deleting list:", error.message);
    } else {
      setLists((prev) => prev.filter((list) => list.id !== id));
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      <header>
        <h1 className="text-3xl font-bold text-gray-100">My Lists</h1>
        <p className="text-gray-400 mt-1">Manage your personal checklists for SyncCycle</p>
      </header>

      {/* Create List Input */}
      <div className="bg-gray-800 p-6 rounded-xl border border-gray-700 shadow-xl">
        <form onSubmit={handleCreateList} className="flex gap-4">
          <input 
            type="text"
            value={newListName}
            onChange={(e) => setNewListName(e.target.value)}
            placeholder="e.g., Grocery List, Workout Prep..." 
            className="flex-1 bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-purple-500 outline-none transition-all" 
            disabled={isCreating}
          />
          <button 
            type="submit"
            disabled={isCreating || !newListName.trim()}
            className="bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white px-6 py-2 rounded-lg font-medium flex items-center gap-2 transition-colors"
          >
            {isCreating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
            Create
          </button>
        </form>
      </div>

      {/* Lists Display */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-gray-100 flex items-center gap-2">
          <ListChecks className="w-5 h-5 text-purple-400" />
          Active Lists
        </h2>

        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-8 h-8 text-purple-500 animate-spin" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {lists.length > 0 ? (
              lists.map((list) => (
                <div 
                  key={list.id} 
                  className="bg-gray-800 p-5 rounded-lg border border-gray-700 hover:border-purple-500/50 transition-all group"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold text-gray-100 text-lg">{list.name}</h3>
                      <p className="text-xs text-gray-500 mt-1">
                        Created {new Date(list.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <button 
                      onClick={() => handleDeleteList(list.id)}
                      className="text-gray-500 hover:text-red-400 transition-colors p-1"
                      title="Delete List"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  
                  <div className="mt-4 flex items-center justify-between">
                    <span className="text-xs font-medium bg-purple-900/30 text-purple-300 px-3 py-1 rounded-full border border-purple-700/50">
                      {list.items?.length || 0} items
                    </span>
                    <button className="text-xs text-purple-400 hover:underline">
                      Open List →
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-full text-center py-16 bg-gray-800/20 rounded-xl border border-dashed border-gray-700">
                <p className="text-gray-500 italic">No lists yet. Start by naming one above!</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}