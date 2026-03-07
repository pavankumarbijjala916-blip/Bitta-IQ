import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from 'sonner';

export interface DatabaseBattery {
  id: string;
  user_id: string;
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
      const { data, error } = await supabase
        .from('batteries')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      console.log('Fetched batteries:', data?.length || 0);
      setBatteries(data || []);
    } catch (error: any) {
      console.error('Error fetching batteries:', error);
      toast.error('Failed to load batteries');
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

    const channel = supabase
      .channel('batteries-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'batteries',
        },
        (payload) => {
          console.log('Battery change:', payload);
          fetchBatteries();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, fetchBatteries]);

  const addBattery = async (batteryData: BatteryFormData) => {
    if (!user) {
      throw new Error('User not authenticated');
    }

    const { data, error } = await supabase
      .from('batteries')
      .insert({
        user_id: user.id,
        battery_id: batteryData.batteryId,
        type: batteryData.type,
        voltage: batteryData.voltage,
        temperature: batteryData.temperature,
        charge_cycles: batteryData.chargeCycles,
        capacity: batteryData.capacity,
        location: batteryData.location,
        soh: batteryData.soh,
        status: batteryData.status,
        image: batteryData.image,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  };

  const deleteBattery = async (id: string) => {
    const { error } = await supabase
      .from('batteries')
      .delete()
      .eq('id', id);

    if (error) throw error;
  };

  const getStats = () => {
    const total = batteries.length;
    const totalSoH = batteries.reduce((sum, b) => sum + b.soh, 0);
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
