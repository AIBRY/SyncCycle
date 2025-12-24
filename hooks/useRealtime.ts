import { useEffect } from 'react'
import { supabase } from '@/lib/supabase';

export const useRealtime = (table: string, callback: (payload: any) => void) => {
  useEffect(() => {
    const channel = supabase
      .channel(`${table}-changes`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table,
        },
        callback
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [table, callback])
}
