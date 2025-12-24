'use client'
import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'react-hot-toast';

export default function PartnerInvite() {
  const { user } = useAuth(); //
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // 1. Find the user by email in the profiles table
      const { data: partnerProfile, error: findError } = await supabase
        .from('profiles')
        .select('id, username')
        .eq('email_lookup', email) // Note: Add an email_lookup column to profiles if needed
        .single();

      if (findError || !partnerProfile) throw new Error('User not found.');

      // 2. Update the current user's partner_id
      // This triggers our 'handle_partner_sync' database function!
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ partner_id: partnerProfile.id })
        .eq('id', user?.id);

      if (updateError) throw updateError;

      toast.success(`Connected with ${partnerProfile.username}!`);
      setEmail('');
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md border border-gray-100">
      <h3 className="text-lg font-semibold mb-2">Connect with your Partner</h3>
      <p className="text-sm text-gray-500 mb-4">Enter your partner's email to sync your dashboards.</p>
      <form onSubmit={handleInvite} className="flex gap-2">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="partner@example.com"
          className="flex-1 p-2 border rounded border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        />
        <button 
          disabled={loading}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:bg-gray-400"
        >
          {loading ? 'Connecting...' : 'Connect'}
        </button>
      </form>
    </div>
  );
}