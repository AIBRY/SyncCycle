'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { ChevronLeft, Plus, CheckCircle2, Circle, Trash2, Loader2 } from 'lucide-react';

export default function ListDetailsPage() {
  const { id } = useParams();
  const router = useRouter();
  const [list, setList] = useState<any>(null);
  const [newItemName, setNewItemName] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchList() {
      const { data, error } = await supabase
        .from('lists')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        console.error("Error fetching list:", error);
        router.push('/lists');
      } else {
        setList(data);
      }
      setLoading(false);
    }
    if (id) fetchList();
  }, [id, router]);

  const updateItems = async (updatedItems: any[]) => {
    const { error } = await supabase
      .from('lists')
      .update({ items: updatedItems })
      .eq('id', id);

    if (!error) {
      setList({ ...list, items: updatedItems });
    }
  };

  const addItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemName.trim()) return;
    
    const newItem = {
      id: crypto.randomUUID(),
      text: newItemName.trim(),
      completed: false
    };
    
    updateItems([...(list.items || []), newItem]);
    setNewItemName('');
  };

  const toggleItem = (itemId: string) => {
    const updated = list.items.map((item: any) => 
      item.id === itemId ? { ...item, completed: !item.completed } : item
    );
    updateItems(updated);
  };

  if (loading) return <div className="flex justify-center p-20"><Loader2 className="animate-spin" /></div>;

  return (
    <div className="max-w-2xl mx-auto p-6">
      <button onClick={() => router.back()} className="flex items-center text-gray-400 hover:text-white mb-6">
        <ChevronLeft className="w-4 h-4" /> Back to Lists
      </button>

      <h1 className="text-3xl font-bold text-white mb-8">{list.name}</h1>

      <form onSubmit={addItem} className="flex gap-2 mb-8">
        <input 
          type="text" 
          value={newItemName}
          onChange={(e) => setNewItemName(e.target.value)}
          placeholder="Add an item..."
          className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white outline-none focus:border-purple-500"
        />
        <button type="submit" className="bg-purple-600 p-2 rounded-lg"><Plus /></button>
      </form>

      <div className="space-y-3">
        {list.items?.map((item: any) => (
          <div key={item.id} className="flex items-center justify-between bg-gray-800 p-4 rounded-lg border border-gray-700">
            <div className="flex items-center gap-3 cursor-pointer" onClick={() => toggleItem(item.id)}>
              {item.completed ? <CheckCircle2 className="text-green-500" /> : <Circle className="text-gray-500" />}
              <span className={item.completed ? "line-through text-gray-500" : "text-gray-200"}>{item.text}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}