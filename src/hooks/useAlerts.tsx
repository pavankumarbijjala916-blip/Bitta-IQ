import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from 'sonner';
import { notificationService } from '@/services/notificationService';

export interface DatabaseAlert {
  id: string;
  user_id: string;
  battery_id: string;
  type: string;
  severity: string;
  message: string;
  acknowledged: boolean;
  created_at: string;
}

export const useAlerts = () => {
  const { user } = useAuth();
  const [alerts, setAlerts] = useState<DatabaseAlert[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAlerts = useCallback(async () => {
    if (!user) {
      setAlerts([]);
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('alerts')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      console.log('Fetched alerts:', data?.length || 0);
      setAlerts(data || []);
    } catch (error: any) {
      console.error('Error fetching alerts:', error);
      toast.error('Failed to load alerts');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchAlerts();
  }, [fetchAlerts]);

  // Subscribe to realtime updates
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel('alerts-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'alerts',
        },
        (payload) => {
          console.log('Alert change:', payload);
          fetchAlerts();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, fetchAlerts]);

  const acknowledgeAlert = async (alertId: string) => {
    const { error } = await supabase
      .from('alerts')
      .update({ acknowledged: true })
      .eq('id', alertId);

    if (error) throw error;
  };

  const dismissAlert = async (alertId: string) => {
    const { error } = await supabase
      .from('alerts')
      .delete()
      .eq('id', alertId);

    if (error) throw error;
  };

  const acknowledgeAll = async () => {
    const unacknowledged = alerts.filter((a) => !a.acknowledged);
    if (unacknowledged.length === 0) return;

    const { error } = await supabase
      .from('alerts')
      .update({ acknowledged: true })
      .in(
        'id',
        unacknowledged.map((a) => a.id)
      );

    if (error) throw error;
  };

  /**
   * Create an alert. batteryId must be the battery row UUID (batteries.id), not the custom battery_id text.
   */
  const createAlert = async (
    batteryId: string,
    type: 'high_temperature' | 'low_voltage' | 'critical_soh' | 'maintenance_due',
    severity: 'warning' | 'critical',
    message: string
  ) => {
    if (!user) throw new Error('User not authenticated');
    if (!batteryId || !type || !severity || !message) {
      throw new Error(`Invalid alert parameters: batteryId=${batteryId}, type=${type}, severity=${severity}, message=${message}`);
    }

    try {
      const { data, error } = await supabase.from('alerts').insert({
        user_id: user.id,
        battery_id: batteryId,
        type,
        severity,
        message,
      });

      if (error) {
        console.error('Supabase insert error:', error);
        throw error;
      }
      
      return data;
    } catch (error: any) {
      console.error('Alert creation failed with details:', {
        batteryId,
        type,
        severity,
        messageLength: message?.length,
        error: error.message || error,
      });
      throw error;
    }
  };

  const getUnacknowledgedCount = () => {
    return alerts.filter((a) => !a.acknowledged).length;
  };

  const generateMissingStatusAlerts = async (batteries: any[]) => {
    if (!user || batteries.length === 0) return;
    
    try {
      // Alerts table uses battery_id = batteries.id (UUID), not custom battery_id text
      const existingBatteryIds = new Set(alerts.map(a => a.battery_id));
      console.log('Existing alerts for batteries:', Array.from(existingBatteryIds));
      
      const batteriesNeedingAlerts = batteries.filter(
        battery => (battery.status === 'repairable' || battery.status === 'recyclable') &&
                   !existingBatteryIds.has(battery.id)
      );
      
      console.log('Batteries needing alerts:', batteriesNeedingAlerts.map(b => ({ id: b.id, battery_id: b.battery_id, status: b.status })));
      
      const displayName = user.user_metadata?.full_name || user.email?.split('@')[0] || 'User';
      let createdCount = 0;
      for (const battery of batteriesNeedingAlerts) {
        const message = battery.status === 'recyclable' 
          ? `${battery.type} battery ${battery.battery_id} registered as RECYCLABLE (SoH: ${battery.soh}%). Location: ${battery.location || 'N/A'}. Ready for proper disposal.`
          : `${battery.type} battery ${battery.battery_id} registered as REPAIRABLE (SoH: ${battery.soh}%). Location: ${battery.location || 'N/A'}. Consider repair or refurbishment.`;
        
        const severity = battery.status === 'recyclable' ? 'critical' : 'warning';
        const type = battery.status === 'recyclable' ? 'critical_soh' : 'maintenance_due';
        
        try {
          await createAlert(battery.id, type, severity, message);
          createdCount++;
          console.log(`✓ Created status alert for ${battery.battery_id} (${battery.status})`);
          // Send email for recyclable/repairable so user gets notified
          if (user.email) {
            try {
              if (battery.status === 'recyclable') {
                await notificationService.sendRecyclableBatteryAlert(
                  user.email,
                  displayName,
                  battery.battery_id,
                  battery.type,
                  battery.soh,
                  battery.location || 'N/A'
                );
              } else {
                await notificationService.sendRepairableBatteryAlert(
                  user.email,
                  displayName,
                  battery.battery_id,
                  battery.type,
                  battery.soh,
                  battery.location || 'N/A'
                );
              }
            } catch (emailErr) {
              console.warn('Email notification failed for alert:', emailErr);
            }
          }
        } catch (error) {
          console.error(`Failed to create status alert for ${battery.battery_id}:`, error);
        }
      }
      
      console.log(`Total status alerts created: ${createdCount}`);
    } catch (error) {
      console.error('Error generating missing status alerts:', error);
    }
  };

  return {
    alerts,
    loading,
    acknowledgeAlert,
    dismissAlert,
    acknowledgeAll,
    createAlert,
    refetch: fetchAlerts,
    getUnacknowledgedCount,
    generateMissingStatusAlerts,
  };
};
