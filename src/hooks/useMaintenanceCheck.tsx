
import { useEffect } from 'react';
import { useBatteries } from '@/hooks/useBatteries';
import { useAuth } from '@/hooks/useAuth';
import { notificationService } from '@/services/notificationService';
import { calculateNextCheckDate } from '@/lib/utils';
import { toast } from 'sonner';

export const useMaintenanceCheck = () => {
    const { batteries, loading } = useBatteries();
    const { user } = useAuth();

    useEffect(() => {
        const checkMaintenance = async () => {
            if (loading || !user || !user.email) return;

            const today = new Date();
            // Set to beginning of day for fair comparison
            today.setHours(0, 0, 0, 0);

            for (const battery of batteries) {
                // Calculate due date
                const nextCheck = calculateNextCheckDate(battery.status, battery.updated_at);
                nextCheck.setHours(0, 0, 0, 0);

                // Check if overdue (today >= nextCheck)
                if (today >= nextCheck) {
                    const reminderKey = `reminder_sent_${battery.id}_${today.toDateString()}`;
                    const alreadySent = localStorage.getItem(reminderKey);

                    if (!alreadySent) {
                        console.log(`Sending maintenance reminder for battery ${battery.battery_id}`);

                        // Send email
                        const sent = await notificationService.sendMaintenanceReminder(
                            user.email,
                            user.user_metadata?.full_name || 'User',
                            battery.battery_id,
                            battery.type,
                            battery.status,
                            nextCheck.toLocaleDateString()
                        );

                        if (sent) {
                            // Mark as sent for today to prevent spam
                            localStorage.setItem(reminderKey, 'true');

                            toast.info(`Maintenance reminder sent for Battery ${battery.battery_id}`, {
                                duration: 5000,
                            });
                        }
                    }
                }
            }
        };

        if (batteries.length > 0) {
            checkMaintenance();
        }
    }, [batteries, loading, user]);
};
