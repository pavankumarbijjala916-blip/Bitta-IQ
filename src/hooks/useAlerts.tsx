import { useState, useEffect, useCallback } from 'react';
import { collection, query, where, orderBy, getDocs, onSnapshot, addDoc, deleteDoc, doc, updateDoc, writeBatch } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from './useAuth';
import { toast } from 'sonner';
import { notificationService } from '@/services/notificationService';

export interface DatabaseAlert {
  id: string;
  user_id: string; // Firebase UID
  battery_id: string; // Firestore battery document ID
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
      const q = query(
        collection(db, 'alerts'),
        where('user_id', '==', user.uid),
        orderBy('created_at', 'desc')
      );
      
      const querySnapshot = await getDocs(q);
      const data = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as DatabaseAlert[];

      console.log('Fetched alerts:', data.length);
      setAlerts(data);
    } catch (error: any) {
      console.error('Error fetching alerts:', error);
      if (error.code !== 'permission-denied') {
        toast.error('Failed to load alerts');
      }
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

    const q = query(
      collection(db, 'alerts'),
      where('user_id', '==', user.uid),
      orderBy('created_at', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      console.log('Alert change snapshot size:', snapshot.size);
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as DatabaseAlert[];
      setAlerts(data);
    }, (error) => {
      console.error("Realtime subscription error:", error);
    });

    return () => unsubscribe();
  }, [user]);

  const acknowledgeAlert = async (alertId: string) => {
    await updateDoc(doc(db, 'alerts', alertId), {
      acknowledged: true
    });
  };

  const dismissAlert = async (alertId: string) => {
    await deleteDoc(doc(db, 'alerts', alertId));
  };

  const acknowledgeAll = async () => {
    const unacknowledged = alerts.filter((a) => !a.acknowledged);
    if (unacknowledged.length === 0) return;

    const batch = writeBatch(db);
    unacknowledged.forEach(a => {
      const alertRef = doc(db, 'alerts', a.id);
      batch.update(alertRef, { acknowledged: true });
    });

    await batch.commit();
  };

  /**
   * Create an alert. batteryId must be the battery row UUID.
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
      const docRef = await addDoc(collection(db, 'alerts'), {
        user_id: user.uid,
        battery_id: batteryId,
        type,
        severity,
        message,
        acknowledged: false,
        created_at: new Date().toISOString()
      });
      return { id: docRef.id };
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
      const existingBatteryIds = new Set(alerts.map(a => a.battery_id));
      console.log('Existing alerts for batteries:', Array.from(existingBatteryIds));
      
      const batteriesNeedingAlerts = batteries.filter(
        battery => (battery.status === 'repairable' || battery.status === 'recyclable') &&
                   !existingBatteryIds.has(battery.id)
      );
      
      console.log('Batteries needing alerts:', batteriesNeedingAlerts.map(b => ({ id: b.id, battery_id: b.battery_id, status: b.status })));
      
      const displayName = user.displayName || user.email?.split('@')[0] || 'User';
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
