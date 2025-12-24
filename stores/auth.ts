// src/stores/auth.ts
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { supabase } from '../lib/supabase'

interface User {
  id: string
  email: string
  username?: string
}

interface AuthState {
  user: User | null
  token: string | null
  loading: boolean
  // Add these missing properties to fix the build error
  setUser: (user: any | null) => void
  setLoading: (loading: boolean) => void
  login: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
  register: (email: string, password: string, username: string) => Promise<void>
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      loading: true,

      // Implement the missing setters
      setUser: (user) => set({ user }),
      setLoading: (loading) => set({ loading }),

      login: async (email: string, password: string) => {
        set({ loading: true })
        try {
          const { data, error } = await supabase.auth.signInWithPassword({ email, password })
          if (error) throw error
          set({ 
            user: data.user as User, 
            token: data.session?.access_token || null, 
            loading: false 
          })
        } catch (error) {
          set({ loading: false })
          throw error
        }
      },

      logout: async () => {
        set({ loading: true })
        try {
          await supabase.auth.signOut()
          set({ user: null, token: null, loading: false })
        } catch (error) {
          set({ loading: false })
          throw error
        }
      },

      register: async (email: string, password: string, username: string) => {
        set({ loading: true })
        try {
          const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: { data: { username } },
          })
          if (error) throw error
          set({ 
            user: data.user as User, 
            token: data.session?.access_token || null, 
            loading: false 
          })
        } catch (error) {
          set({ loading: false })
          throw error
        }
      },
    }),
    {
      name: 'auth-storage',
      // Don't persist the loading state
      partialize: (state) => ({ user: state.user, token: state.token }),
    }
  )
)