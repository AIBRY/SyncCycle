'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase'; //
import { useAuthStore } from '@/stores/auth'; //
import { ListChecks, Plus, Loader2 } from 'lucide-react';

export default function ListsPage() {
  const { user } = useAuthStore(); //
  const [lists, setLists] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [newListName, setNewListName] = useState('');

  useEffect(() => {
    async function getData() {
      setLoading(true);
      const { data, error } = await supabase
        .from('lists')
        .select('*')
        .eq('user_id', user?.id) // Ensure we only get the user's lists
        .order('created_at', { ascending: false });

      if (error) console.error("Database Error:", error);
      if (data) setLists(data);
      setLoading(false);
    }
    
    if (user?.id) getData();
  }, [user?.id]);

  const handleCreateList = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newListName.trim()) return;

    const { error } = await supabase.from('lists').insert({ 
      name: newListName, 
      user_id: user?.id, 
      items: [] 
    });

    if (!error) {
      setNewListName('');
      // In Next.js, we can refresh the list data without a full page reload
      const { data } = await supabase.from('lists').select('*').eq('user_id', user?.id).order('created_at', { ascending: false });
      if (data) setLists(data);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-100">My Lists</h1>
          <p className="text-gray-400 mt-1">Manage your shared and personal checklists</p>
        </div>
      </header>

      {/* Create List Section */}
      <div className="card bg-gray-800 p-6 rounded-xl border border-gray-700">
        <form onSubmit={handleCreateList} className="flex gap-4">
          <input 
            type="text"
            value={newListName}
            onChange={(e) => setNewListName(e.target.value)}
            placeholder="Enter list name..." 
            className="flex-1 bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 text-white focus:border-purple-500 outline-none transition-all" 
          />
          <button 
            type="submit"
            className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg font-medium flex items-center gap-2 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Create List
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
              lists.map(list => (
                <div 
                  key={list.id} 
                  className="bg-gray-800 p-4 rounded-lg border border-gray-700 hover:border-purple-500/50 transition-all flex justify-between items-center"
                >
                  <div>
                    <h3 className="font-medium text-gray-100">{list.name}</h3>
                    <p className="text-xs text-gray-500 mt-1">ID: {list.id.split('-')[0]}...</p>
                  </div>
                  <span className="text-xs bg-gray-700 text-gray-400 px-2 py-1 rounded">
                    {list.items?.length || 0} items
                  </span>
                </div>
              ))
            ) : (
              <div className="col-span-full text-center py-12 bg-gray-800/30 rounded-xl border border-dashed border-gray-700">
                <p className="text-gray-500">No lists found. Create your first one above!</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}