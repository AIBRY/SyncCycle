'use client';

// This forces Next.js to skip static generation and handle the dynamic UUID at runtime
export const dynamic = 'force-dynamic';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { 
  ChevronLeft, 
  Plus, 
  CheckCircle2, 
  Circle, 
  Trash2, 
  Loader2, 
  ShoppingBag 
} from 'lucide-react';

export default function ListDetailsPage() {
  const { id } = useParams();
  const router = useRouter();
  
  const [list, setList] = useState<any>(null);
  const [newItemName, setNewItemName] = useState('');
  const [loading, setLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);

  // 1. Fetch the specific list and its items
  useEffect(() => {
    async function fetchList() {
      if (!id) return;
      
      setLoading(true);
      const { data, error } = await supabase
        .from('lists')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        console.error("Error fetching list:", error.message);
        router.push('/lists'); // Redirect if list doesn't exist
      } else {
        setList(data);
      }
      setLoading(false);
    }
    fetchList();
  }, [id, router]);

  // 2. Helper to save the items array back to Supabase
  const saveItems = async (updatedItems: any[]) => {
    setIsUpdating(true);
    const { error } = await supabase
      .from('lists')
      .update({ items: updatedItems })
      .eq('id', id);

    if (error) {
      console.error("Update error:", error.message);
    } else {
      setList((prev: any) => ({ ...prev, items: updatedItems }));
    }
    setIsUpdating(false);
  };

  // 3. Add a new item to the JSONB array
  const addItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemName.trim()) return;
    
    const newItem = {
      id: crypto.randomUUID(),
      text: newItemName.trim(),
      completed: false,
      created_at: new Date().toISOString()
    };
    
    const updated = [...(list.items || []), newItem];
    saveItems(updated);
    setNewItemName('');
  };

  // 4. Toggle completion status
  const toggleItem = (itemId: string) => {
    const updated = list.items.map((item: any) => 
      item.id === itemId ? { ...item, completed: !item.completed } : item
    );
    saveItems(updated);
  };

  // 5. Delete an item from the array
  const deleteItem = (itemId: string) => {
    const updated = list.items.filter((item: any) => item.id !== itemId);
    saveItems(updated);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <Loader2 className="w-10 h-10 text-purple-500 animate-spin" />
        <p className="text-gray-500">Loading your list...</p>
      </div>
    );
  }

  if (!list) return null;

  return (
    <div className="max-w-3xl mx-auto p-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Navigation Header */}
      <button 
        onClick={() => router.push('/lists')} 
        className="group flex items-center text-gray-400 hover:text-white mb-8 transition-colors"
      >
        <ChevronLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" /> 
        <span>Back to Collections</span>
      </button>

      <div className="flex justify-between items-end mb-10">
        <div>
          <h1 className="text-4xl font-black text-white tracking-tight">{list.name}</h1>
          <div className="flex items-center gap-2 mt-2 text-gray-500 text-sm">
            <ShoppingBag className="w-4 h-4" />
            <span>{list.items?.length || 0} items total</span>
          </div>
        </div>
        {isUpdating && <Loader2 className="w-5 h-5 text-purple-500 animate-spin mb-2" />}
      </div>

      {/* Input Form */}
      <div className="bg-gray-800/40 p-2 rounded-2xl border border-gray-700 mb-8 shadow-inner">
        <form onSubmit={addItem} className="flex gap-2">
          <input 
            type="text" 
            value={newItemName}
            onChange={(e) => setNewItemName(e.target.value)}
            placeholder="Add something to the list..."
            className="flex-1 bg-gray-900/50 border border-gray-700 rounded-xl px-5 py-3 text-white outline-none focus:ring-2 focus:ring-purple-600 transition-all placeholder:text-gray-600"
          />
          <button 
            type="submit" 
            disabled={!newItemName.trim() || isUpdating}
            className="bg-purple-600 hover:bg-purple-500 disabled:opacity-50 px-5 rounded-xl text-white font-bold transition-all active:scale-95 shadow-lg shadow-purple-900/20"
          >
            <Plus className="w-6 h-6" />
          </button>
        </form>
      </div>

      {/* Items List */}
      <div className="space-y-3">
        {list.items && list.items.length > 0 ? (
          list.items.map((item: any) => (
            <div 
              key={item.id} 
              className={`flex items-center justify-between p-4 rounded-xl border transition-all duration-300 group ${
                item.completed 
                ? "bg-gray-900/30 border-gray-800 opacity-60" 
                : "bg-gray-800 border-gray-700 hover:border-gray-500 shadow-sm"
              }`}
            >
              <div 
                className="flex items-center gap-4 cursor-pointer flex-1" 
                onClick={() => toggleItem(item.id)}
              >
                <div className="transition-transform active:scale-90">
                  {item.completed ? (
                    <CheckCircle2 className="text-green-500 w-7 h-7" />
                  ) : (
                    <Circle className="text-gray-600 w-7 h-7 hover:text-purple-400 transition-colors" />
                  )}
                </div>
                <span className={`text-lg font-medium transition-all ${
                  item.completed ? "line-through text-gray-600" : "text-gray-200"
                }`}>
                  {item.text}
                </span>
              </div>
              
              <button 
                onClick={() => deleteItem(item.id)}
                className="text-gray-700 hover:text-red-500 transition-colors p-2"
                aria-label="Delete item"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
          ))
        ) : (
          <div className="text-center py-20 border-2 border-dashed border-gray-800 rounded-3xl">
            <div className="bg-gray-800/50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
               <Plus className="w-8 h-8 text-gray-700" />
            </div>
            <p className="text-gray-600 font-medium tracking-wide">Your list is looking a bit empty.</p>
            <p className="text-gray-700 text-sm">Add your first item above!</p>
          </div>
        )}
      </div>
    </div>
  );
}