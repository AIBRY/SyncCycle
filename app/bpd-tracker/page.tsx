'use client'; // Required for interactivity and hooks in the app directory

import { useState, useEffect } from 'react'
import { useAuthStore } from '@/stores/auth' 
import { useCopingSkills, useLogCopingSkill } from '@/hooks/useCoping' 
import { supabase } from '@/lib/supabase'

// Reuse your interfaces
interface Episode {
  id: string
  intensity: number
  effectiveness?: number
  trigger: string
  notes: string
  created_at: string
  coping_skill_id?: string
  coping_skills?: { name: string } // Support for joined data
}

interface CopingSkill {
  id: string
  name: string
  description: string
}

export default function BPDTrackerPage() {
  const { user } = useAuthStore()
  const { data: copingSkills } = useCopingSkills()
  const { mutate: logCopingSkill } = useLogCopingSkill()
  
  const [episodes, setEpisodes] = useState<Episode[]>([])
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    intensity: 5,
    trigger: '',
    notes: '',
    selectedSkill: '',
  })

  // Next.js standard: use absolute path aliases (like @/) defined in tsconfig.json
  useEffect(() => { 
    if (user?.id) fetchEpisodes() 
  }, [user?.id])

  async function fetchEpisodes() {
    const { data } = await supabase
      .from('episodes')
      .select('*, coping_skills(name)')
      .eq('user_id', user?.id)
      .order('created_at', { ascending: false })
    setEpisodes(data || [])
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const { error } = await supabase.from('episodes').insert({
      user_id: user?.id,
      intensity: formData.intensity,
      trigger: formData.trigger,
      notes: formData.notes,
      coping_skill_id: formData.selectedSkill || null,
    })
    
    if (!error) {
      setFormData({ intensity: 5, trigger: '', notes: '', selectedSkill: '' })
      setShowForm(false)
      fetchEpisodes()
    }
  }

  // Logic remains the same as your original file
  const totalEpisodes = episodes.length
  const avgIntensity = episodes.reduce((sum: number, ep) => sum + ep.intensity, 0) / totalEpisodes || 0
  const avgEffectiveness = episodes.reduce((sum: number, ep) => sum + (ep.effectiveness || 0), 0) / totalEpisodes || 0

  return (
    <div className="max-w-4xl mx-auto p-6">
       {/* ... Your existing JSX from BPDTracker.tsx ... */}
       <h1 className="text-3xl font-bold text-gray-100 mb-8">BPD Tracker</h1>
       
       {/* Use the same tailwind classes as before */}
       <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-gray-800 p-4 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-gray-100 mb-2">Total Episodes</h3>
            <p className="text-3xl font-bold text-purple-400">{totalEpisodes}</p>
          </div>
          {/* ... Rest of your UI ... */}
       </div>
    </div>
  )
}