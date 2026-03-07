import { create } from 'zustand'
import { 
  collection, 
  query, 
  where, 
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  Timestamp
} from 'firebase/firestore'
import { getFirebaseFirestore } from '../services/firebase'
import { useAuthStore } from './authStore'

export interface Battery {
  id: string
  userId: string
  manufacturerId: string
  batteryType: 'Li-ion' | 'Lead-Acid' | 'NiMH' | 'LiFePO4'
  serialNumber: string
  voltage: number
  temperature: number
  chargeCycles: number
  capacity: number
  healthStatus: 'Good' | 'Moderate' | 'Poor'
  lastAssessmentDate: Date
  createdAt: Date
  updatedAt: Date
}

interface BatteryStore {
  batteries: Battery[]
  isLoading: boolean
  error: string | null
  fetchBatteries: () => Promise<void>
  addBattery: (battery: Omit<Battery, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>
  updateBattery: (id: string, updates: Partial<Battery>) => Promise<void>
  deleteBattery: (id: string) => Promise<void>
  clearError: () => void
}

export const useBatteryStore = create<BatteryStore>((set) => ({
  batteries: [],
  isLoading: false,
  error: null,

  fetchBatteries: async () => {
    try {
      set({ isLoading: true, error: null })
      const { user } = useAuthStore.getState()
      
      if (!user) {
        set({ batteries: [], isLoading: false })
        return
      }

      const firestore = getFirebaseFirestore()
      const q = query(
        collection(firestore, 'batteries'),
        where('userId', '==', user.uid)
      )
      
      const snapshot = await getDocs(q)
      const batteries = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data()
      } as Battery))

      set({ batteries, isLoading: false })
    } catch (error: any) {
      set({ 
        error: error.message || 'Failed to fetch batteries',
        isLoading: false 
      })
    }
  },

  addBattery: async (battery) => {
    try {
      set({ isLoading: true, error: null })
      const { user } = useAuthStore.getState()
      
      if (!user) throw new Error('User not authenticated')

      const firestore = getFirebaseFirestore()
      const docRef = await addDoc(collection(firestore, 'batteries'), {
        ...battery,
        userId: user.uid,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      })

      // Fetch updated list
      const batteryStore = useBatteryStore.getState()
      await batteryStore.fetchBatteries()
      
      set({ isLoading: false })
    } catch (error: any) {
      set({ 
        error: error.message || 'Failed to add battery',
        isLoading: false 
      })
    }
  },

  updateBattery: async (id: string, updates) => {
    try {
      set({ isLoading: true, error: null })
      const firestore = getFirebaseFirestore()
      
      await updateDoc(doc(firestore, 'batteries', id), {
        ...updates,
        updatedAt: Timestamp.now()
      })

      // Fetch updated list
      const batteryStore = useBatteryStore.getState()
      await batteryStore.fetchBatteries()
      
      set({ isLoading: false })
    } catch (error: any) {
      set({ 
        error: error.message || 'Failed to update battery',
        isLoading: false 
      })
    }
  },

  deleteBattery: async (id: string) => {
    try {
      set({ isLoading: true, error: null })
      const firestore = getFirebaseFirestore()
      
      await deleteDoc(doc(firestore, 'batteries', id))

      // Fetch updated list
      const batteryStore = useBatteryStore.getState()
      await batteryStore.fetchBatteries()
      
      set({ isLoading: false })
    } catch (error: any) {
      set({ 
        error: error.message || 'Failed to delete battery',
        isLoading: false 
      })
    }
  },

  clearError: () => {
    set({ error: null })
  }
}))
