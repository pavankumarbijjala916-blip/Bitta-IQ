import { useState, useEffect, useCallback } from 'react';
import { collection, query, where, orderBy, getDocs, onSnapshot, addDoc, deleteDoc, doc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from './useAuth';
import { toast } from 'sonner';

export interface DatabaseBattery {
  id: string; // Firestore Document ID
  user_id: string; // Firebase UID
  battery_id: string;
  type: string;
  voltage: number;
  temperature: number;
  charge_cycles: number;
  capacity: number;
  location: string | null;
  soh: number;
  status: string;
  created_at: string;
  updated_at: string;
  image?: string;
}

export interface BatteryFormData {
  batteryId: string;
  type: 'Li-ion' | 'Lead-Acid' | 'NiMH' | 'NiCd' | 'LiFePO4';
  voltage: number;
  temperature: number;
  chargeCycles: number;
  capacity: number;
  location: string;
  soh: number;
  status: 'healthy' | 'repairable' | 'recyclable';
  image?: string;
}

export const useBatteries = () => {
  const { user } = useAuth();
  const [batteries, setBatteries] = useState<DatabaseBattery[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchBatteries = useCallback(async () => {
    if (!user) {
      setBatteries([]);
      setLoading(false);
      return;
    }

    try {
      const q = query(
        collection(db, 'batteries'),
        where('user_id', '==', user.uid),
        orderBy('created_at', 'desc')
      );
      
      const querySnapshot = await getDocs(q);
      const data = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as DatabaseBattery[];

      console.log('Fetched batteries:', data.length);
      setBatteries(data);
    } catch (error: any) {
      console.error('Error fetching batteries:', error);
      // Disable toast for now or check if it's permission error
      if (error.code !== 'permission-denied') {
        toast.error('Failed to load batteries');
      }
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchBatteries();
  }, [fetchBatteries]);

  // Subscribe to realtime updates
  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, 'batteries'),
      where('user_id', '==', user.uid),
      orderBy('created_at', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      console.log('Battery change snapshot size:', snapshot.size);
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as DatabaseBattery[];
      setBatteries(data);
    }, (error) => {
      console.error("Realtime subscription error:", error);
    });

    return () => unsubscribe();
  }, [user]);

  const addBattery = async (batteryData: BatteryFormData) => {
    if (!user) {
      throw new Error('User not authenticated');
    }

    const now = new Date().toISOString();

    const docRef = await addDoc(collection(db, 'batteries'), {
      user_id: user.uid,
      battery_id: batteryData.batteryId,
      type: batteryData.type,
      voltage: batteryData.voltage,
      temperature: batteryData.temperature,
      charge_cycles: batteryData.chargeCycles,
      capacity: batteryData.capacity,
      location: batteryData.location,
      soh: batteryData.soh,
      status: batteryData.status,
      image: batteryData.image || null,
      created_at: now,
      updated_at: now,
    });

    return { id: docRef.id };
  };

  const deleteBattery = async (id: string) => {
    await deleteDoc(doc(db, 'batteries', id));
  };

  const getStats = () => {
    const total = batteries.length;
    const totalSoH = batteries.reduce((sum, b) => sum + (b.soh || 0), 0);
    return {
      total,
      healthy: batteries.filter((b) => b.status === 'healthy').length,
      repairable: batteries.filter((b) => b.status === 'repairable').length,
      recyclable: batteries.filter((b) => b.status === 'recyclable').length,
      avgSoH: total > 0 ? Math.round(totalSoH / total) : 0,
    };
  };

  return {
    batteries,
    loading,
    addBattery,
    deleteBattery,
    refetch: fetchBatteries,
    getStats,
  };
};
