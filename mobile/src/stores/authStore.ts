import { create } from 'zustand'
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword,
  signOut,
  User,
  Auth
} from 'firebase/auth'
import { getFirebaseAuth } from '../services/firebase'
import AsyncStorage from '@react-native-async-storage/async-storage'

interface AuthStore {
  user: User | null
  isLoading: boolean
  error: string | null
  initializeAuth: () => Promise<void>
  login: (email: string, password: string) => Promise<void>
  register: (email: string, password: string, displayName: string) => Promise<void>
  logout: () => Promise<void>
  clearError: () => void
}

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  isLoading: true,
  error: null,

  initializeAuth: async () => {
    try {
      set({ isLoading: true })
      const auth = getFirebaseAuth()
      
      // Check if user is already logged in
      const storedUser = await AsyncStorage.getItem('user')
      if (storedUser) {
        const user = JSON.parse(storedUser)
        set({ user, isLoading: false })
      } else {
        set({ user: null, isLoading: false })
      }
    } catch (error: any) {
      set({ 
        error: error.message || 'Failed to initialize auth',
        isLoading: false 
      })
    }
  },

  login: async (email: string, password: string) => {
    try {
      set({ isLoading: true, error: null })
      const auth = getFirebaseAuth()
      
      const userCredential = await signInWithEmailAndPassword(auth, email, password)
      const user = userCredential.user
      
      await AsyncStorage.setItem('user', JSON.stringify(user))
      set({ user, isLoading: false })
    } catch (error: any) {
      const errorMessage = error.message || 'Login failed'
      set({ 
        error: errorMessage,
        isLoading: false,
        user: null 
      })
    }
  },

  register: async (email: string, password: string, displayName: string) => {
    try {
      set({ isLoading: true, error: null })
      const auth = getFirebaseAuth()
      
      const userCredential = await createUserWithEmailAndPassword(auth, email, password)
      const user = userCredential.user
      
      // Store user data in AsyncStorage
      await AsyncStorage.setItem('user', JSON.stringify(user))
      set({ user, isLoading: false })
    } catch (error: any) {
      const errorMessage = error.message || 'Registration failed'
      set({ 
        error: errorMessage,
        isLoading: false,
        user: null 
      })
    }
  },

  logout: async () => {
    try {
      set({ isLoading: true })
      const auth = getFirebaseAuth()
      
      await signOut(auth)
      await AsyncStorage.removeItem('user')
      set({ user: null, isLoading: false, error: null })
    } catch (error: any) {
      set({ 
        error: error.message || 'Logout failed',
        isLoading: false 
      })
    }
  },

  clearError: () => {
    set({ error: null })
  }
}))
