import { create } from 'zustand'
import { api } from '@/lib/api'
import { ws } from '@/lib/websocket'

interface User {
  id: string
  email: string
  role: string
  status: string
  profile?: any
  brokerProfile?: any
}

interface AuthState {
  user: User | null
  token: string | null
  isLoading: boolean
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<void>
  register: (email: string, password: string, role: string) => Promise<void>
  logout: () => void
  loadUser: () => Promise<void>
  setUser: (user: User) => void
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  token: null,
  isLoading: true,
  isAuthenticated: false,

  login: async (email: string, password: string) => {
    try {
      const data = await api.login({ email, password })
      api.setToken(data.token)
      ws.connect(data.token)
      set({
        user: data.user,
        token: data.token,
        isAuthenticated: true,
      })
    } catch (error) {
      throw error
    }
  },

  register: async (email: string, password: string, role: string) => {
    try {
      const data = await api.register({ email, password, role })
      api.setToken(data.token)
      ws.connect(data.token)
      set({
        user: data.user,
        token: data.token,
        isAuthenticated: true,
      })
    } catch (error) {
      throw error
    }
  },

  logout: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token')
    }
    ws.disconnect()
    set({
      user: null,
      token: null,
      isAuthenticated: false,
    })
  },

  loadUser: async () => {
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null
      if (!token) {
        set({ isLoading: false })
        return
      }

      const user = await api.getProfile()
      ws.connect(token)
      set({
        user,
        token,
        isAuthenticated: true,
        isLoading: false,
      })
    } catch (error) {
      set({ isLoading: false })
    }
  },

  setUser: (user: User) => {
    set({ user })
  },
}))
