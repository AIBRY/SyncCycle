import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase';

export const useCopingSkills = () => {
  return useQuery({
    queryKey: ['coping-skills'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('coping_skills')
        .select('*')
        .order('category')
      
      if (error) throw error
      return data
    },
  })
}

export const useCopingLogs = (userId: string) => {
  return useQuery({
    queryKey: ['coping-logs', userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('coping_logs')
        .select('*, skill:coping_skills(*)')
        .eq('user_id', userId)
        .order('used_at', { ascending: false })
      
      if (error) throw error
      return data
    },
    enabled: !!userId,
  })
}

export const useLogCopingSkill = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (log: any) => {
      const { data, error } = await supabase
        .from('coping_logs')
        .insert(log)
        .select()
        .single()
      
      if (error) throw error
      return data
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['coping-logs', variables.user_id] })
    },
  })
}
