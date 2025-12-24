'use client'
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabase';
import { useQuery } from '@tanstack/react-query';

export default function DuoDashboard() {
  const { user } = useAuth(); //

  const { data: duoData, isLoading } = useQuery({
    queryKey: ['duo-episodes', user?.id],
    queryFn: async () => {
      // 1. Get current user's profile to find the partner_id
      const { data: profile } = await supabase
        .from('profiles')
        .select('partner_id')
        .eq('id', user?.id)
        .single();

      // 2. Fetch episodes for both users simultaneously
      const userIds = [user?.id];
      if (profile?.partner_id) userIds.push(profile.partner_id);

      const { data: episodes } = await supabase
        .from('episodes')
        .select('*')
        .in('user_id', userIds)
        .order('occurred_at', { ascending: false })
        .limit(10);

      return {
        myEpisodes: episodes?.filter(e => e.user_id === user?.id) || [],
        partnerEpisodes: episodes?.filter(e => e.user_id === profile?.partner_id) || []
      };
    },
    enabled: !!user?.id
  });

  if (isLoading) return <div>Syncing data...</div>;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6">
      {/* My Section */}
      <section className="bg-white p-4 rounded-xl shadow">
        <h2 className="text-xl font-bold mb-4">My Recent Moods</h2>
        {duoData?.myEpisodes.map(episode => (
          <div key={episode.id} className="border-b py-2">
            <span className="font-bold">Intensity: {episode.intensity}/10</span>
            <p className="text-sm text-gray-600">{new Date(episode.occurred_at).toLocaleDateString()}</p>
          </div>
        ))}
      </section>

      {/* Partner Section */}
      <section className="bg-blue-50 p-4 rounded-xl shadow">
        <h2 className="text-xl font-bold mb-4 text-blue-800">Partner's Recent Moods</h2>
        {duoData?.partnerEpisodes.length ? (
          duoData.partnerEpisodes.map(episode => (
            <div key={episode.id} className="border-b py-2">
              <span className="font-bold">Intensity: {episode.intensity}/10</span>
              <p className="text-sm text-gray-600">{new Date(episode.occurred_at).toLocaleDateString()}</p>
            </div>
          ))
        ) : (
          <p className="text-gray-500 italic">No shared data available.</p>
        )}
      </section>
    </div>
  );
}