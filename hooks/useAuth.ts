// hooks/useAuth.ts
import { useAuthStore } from '@/stores/auth' // Updated path alias

export const useAuth = () => {
  const { user, token, login, logout, register } = useAuthStore()
  
  return {
    user,
    token,
    isAuthenticated: !!user, // Helper for quick auth checks
    login,
    logout,
    register,
  }
}