'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/stores/auth';
import { 
  ListChecks, 
  Plus, 
  Loader2, 
  Trash2, 
  ExternalLink, 
  Calendar,
  Layers
} from 'lucide-react';

export default function ListsPage() {
  const { user } = useAuthStore();
  const [lists, setLists] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [newListName, setNewListName] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  // 1. Fetch lists on mount
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
        items: [] 
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
  const handleDeleteList = async (e: React.MouseEvent, id: string) => {
    e.preventDefault(); // Prevent navigating to the list detail page
    e.stopPropagation();

    if (!confirm('Are you sure you want to delete this list?')) return;

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
    <div className="max-w-5xl mx-auto p-6 space-y-8 animate-in fade-in duration-500">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-extrabold text-white tracking-tight">SyncCycle Lists</h1>
          <p className="text-gray-400 mt-2">Create and manage your items, sync across devices.</p>
        </div>
      </header>

      {/* Create List Form */}
      <div className="bg-gray-800/50 p-1 rounded-2xl border border-gray-700 shadow-2xl overflow-hidden backdrop-blur-sm">
        <form onSubmit={handleCreateList} className="flex p-2 gap-2">
          <div className="relative flex-1">
            <input 
              type="text"
              value={newListName}
              onChange={(e) => setNewListName(e.target.value)}
              placeholder="e.g., Weekly Groceries or Project Tasks..." 
              className="w-full bg-gray-900/80 border border-gray-700 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all placeholder:text-gray-600" 
              disabled={isCreating}
            />
          </div>
          <button 
            type="submit"
            disabled={isCreating || !newListName.trim()}
            className="bg-purple-600 hover:bg-purple-500 disabled:opacity-50 disabled:cursor-not-allowed text-white px-8 py-3 rounded-xl font-bold flex items-center gap-2 transition-all active:scale-95 shadow-lg shadow-purple-900/20"
          >
            {isCreating ? <Loader2 className="w-5 h-5 animate-spin" /> : <Plus className="w-5 h-5" />}
            Create
          </button>
        </form>
      </div>

      {/* Lists Grid */}
      <div className="space-y-6">
        <div className="flex items-center gap-2 border-b border-gray-800 pb-4">
          <Layers className="w-5 h-5 text-purple-400" />
          <h2 className="text-xl font-bold text-gray-200">Active Collections</h2>
          <span className="ml-auto bg-gray-800 text-gray-400 text-xs px-2.5 py-1 rounded-full border border-gray-700">
            {lists.length} Total
          </span>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 space-y-4">
            <Loader2 className="w-12 h-8 text-purple-500 animate-spin" />
            <p className="text-gray-500 animate-pulse">Syncing with database...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {lists.length > 0 ? (
              lists.map((list) => (
                <Link 
                  key={list.id} 
                  href={`/lists/${list.id}`}
                  className="group bg-gray-800/40 hover:bg-gray-800/80 p-6 rounded-2xl border border-gray-700 hover:border-purple-500/50 transition-all shadow-sm hover:shadow-purple-500/10 flex flex-col justify-between h-48 relative overflow-hidden"
                >
                  {/* Decorative Gradient Background */}
                  <div className="absolute top-0 right-0 -mr-8 -mt-8 w-24 h-24 bg-purple-600/10 rounded-full blur-3xl group-hover:bg-purple-600/20 transition-all" />

                  <div className="relative">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-bold text-gray-100 text-xl group-hover:text-purple-300 transition-colors line-clamp-1">
                        {list.name}
                      </h3>
                      <button 
                        onClick={(e) => handleDeleteList(e, list.id)}
                        className="text-gray-600 hover:text-red-400 transition-colors p-2 -mr-2"
                        aria-label="Delete List"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                    
                    <div className="flex items-center gap-2 text-gray-500 text-xs">
                      <Calendar className="w-3 h-3" />
                      <span>{new Date(list.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                  
                  <div className="relative mt-auto pt-4 flex items-center justify-between">
                    <div className="flex flex-col">
                      <span className="text-2xl font-black text-gray-200">
                        {list.items?.length || 0}
                      </span>
                      <span className="text-[10px] uppercase tracking-widest text-gray-500 font-bold">
                        Items
                      </span>
                    </div>
                    
                    <div className="bg-gray-900/50 p-2 rounded-lg border border-gray-700 group-hover:border-purple-500 group-hover:bg-purple-600 transition-all text-gray-400 group-hover:text-white">
                      <ExternalLink className="w-4 h-4" />
                    </div>
                  </div>
                </Link>
              ))
            ) : (
              <div className="col-span-full text-center py-20 bg-gray-800/10 rounded-3xl border-2 border-dashed border-gray-800">
                <div className="bg-gray-800/50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <ListChecks className="w-8 h-8 text-gray-600" />
                </div>
                <h3 className="text-gray-300 font-bold text-lg">Empty Workspace</h3>
                <p className="text-gray-500 max-w-xs mx-auto mt-2">You haven't created any lists yet. Type a name above to get started!</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}