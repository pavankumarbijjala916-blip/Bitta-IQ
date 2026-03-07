import { useEffect, useRef } from 'react';
import { Bell, AlertTriangle, Thermometer, Zap, Activity, Wrench, CheckCircle, XCircle, Battery, Sparkles, Recycle } from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { useAlerts } from '@/hooks/useAlerts';
import { useBatteries } from '@/hooks/useBatteries';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import batteryGlowImage from '@/assets/battery-glow.png';

const alertIcons: Record<string, any> = {
  high_temperature: Thermometer,
  low_voltage: Zap,
  critical_soh: Recycle,
  maintenance_due: Wrench,
};

const Alerts = () => {
  const { alerts, loading, acknowledgeAlert, dismissAlert, acknowledgeAll, getUnacknowledgedCount, generateMissingStatusAlerts, refetch } = useAlerts();
  const { batteries, loading: batteriesLoading } = useBatteries();
  const unacknowledgedCount = getUnacknowledgedCount();
  const generationTimeoutRef = useRef<NodeJS.Timeout>();
  const generationAttemptRef = useRef(false);
  const batteryIdByUuid = batteries.reduce<Record<string, string>>((acc, b) => {
    acc[b.id] = b.battery_id;
    return acc;
  }, {});

  // Generate missing status alerts only after both alerts and batteries have loaded
  useEffect(() => {
    const generateAlerts = async () => {
      const ready = batteries.length >= 0 && !loading && !batteriesLoading && !generationAttemptRef.current;
      if (ready && batteries.length > 0) {
        generationAttemptRef.current = true;
        console.log('Starting alert generation (alerts loaded:', alerts.length, ', batteries:', batteries.length, ')');
        try {
          await generateMissingStatusAlerts(batteries);
          await new Promise(resolve => setTimeout(resolve, 500));
          await refetch();
          console.log('Alert generation and refetch complete');
        } catch (error) {
          console.error('Error during alert generation:', error);
        }
      }
    };

    if (generationTimeoutRef.current) clearTimeout(generationTimeoutRef.current);
    generationTimeoutRef.current = setTimeout(generateAlerts, 200);

    return () => {
      if (generationTimeoutRef.current) clearTimeout(generationTimeoutRef.current);
    };
  }, [loading, batteriesLoading, batteries.length, alerts.length]);

  const handleAcknowledge = async (alertId: string) => {
    try {
      await acknowledgeAlert(alertId);
      toast.success('Alert acknowledged');
    } catch (error) {
      toast.error('Failed to acknowledge alert');
    }
  };

  const handleDismiss = async (alertId: string) => {
    try {
      await dismissAlert(alertId);
      toast.success('Alert dismissed');
    } catch (error) {
      toast.error('Failed to dismiss alert');
    }
  };

  const handleAcknowledgeAll = async () => {
    try {
      await acknowledgeAll();
      toast.success('All alerts acknowledged');
    } catch (error) {
      toast.error('Failed to acknowledge alerts');
    }
  };

  if (loading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-96">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      </AppLayout>
    );
  }

  const displayBatteryId = (batteryUuid: string) =>
    batteryIdByUuid[batteryUuid] ?? `${String(batteryUuid).slice(0, 8)}…`;

  return (
    <AppLayout>
      <div className="space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 animate-fade-in">
          <div className="flex items-start gap-4">
            <div className="relative">
              <div className="w-14 h-14 rounded-2xl gradient-primary flex items-center justify-center shadow-glow animate-pulse-glow ring-2 ring-primary/20">
                <Bell className="h-7 w-7 text-primary-foreground" />
              </div>
              {unacknowledgedCount > 0 && (
                <span className="absolute -top-2 -right-2 min-w-[1.5rem] h-6 px-1.5 rounded-full bg-status-recyclable text-primary-foreground text-xs font-bold flex items-center justify-center animate-bounce-subtle shadow-md">
                  {unacknowledgedCount}
                </span>
              )}
            </div>
            <div>
              <h1 className="text-3xl font-bold text-foreground tracking-tight">Alerts & Notifications</h1>
              <p className="text-muted-foreground mt-1">
                {unacknowledgedCount > 0 ? `${unacknowledgedCount} unacknowledged alert${unacknowledgedCount > 1 ? 's' : ''} require attention` : 'All alerts have been acknowledged'}
              </p>
            </div>
          </div>
          {unacknowledgedCount > 0 && (
            <Button onClick={handleAcknowledgeAll} variant="outline" className="animate-fade-in">
              <CheckCircle className="h-4 w-4 mr-2" />
              Acknowledge All
            </Button>
          )}
        </div>

        <div className="space-y-4">
          {alerts.length > 0 ? (
            alerts.map((alert, index) => {
              const Icon = alertIcons[alert.type] || Activity;
              const isCritical = alert.severity === 'critical';
              return (
                <div
                  key={alert.id}
                  className={cn(
                    'group bg-card/95 backdrop-blur-sm rounded-xl border p-5 shadow-card hover-lift',
                    'animate-fade-in',
                    alert.acknowledged
                      ? 'border-border opacity-75'
                      : isCritical
                        ? 'border-status-recyclable/40 bg-gradient-to-br from-card to-status-recyclable/5'
                        : 'border-status-repairable/40 bg-gradient-to-br from-card to-status-repairable/5'
                  )}
                  style={{ animationDelay: `${index * 0.05}s` }}
                >
                  <div className="flex items-start gap-4">
                    <div
                      className={cn(
                        'w-12 h-12 rounded-xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-105',
                        isCritical ? 'bg-status-recyclable/15 text-status-recyclable' : 'bg-status-repairable/15 text-status-repairable'
                      )}
                    >
                      <Icon className="h-6 w-6" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-2">
                        <span
                          className={cn(
                            'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold',
                            isCritical ? 'bg-status-recyclable/15 text-status-recyclable' : 'bg-status-repairable/15 text-status-repairable'
                          )}
                        >
                          <AlertTriangle className="h-3 w-3 shrink-0" />
                          {isCritical ? 'Critical' : 'Warning'}
                        </span>
                        {alert.acknowledged && (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-secondary text-muted-foreground">
                            <CheckCircle className="h-3 w-3" />
                            Acknowledged
                          </span>
                        )}
                      </div>
                      <p className="font-medium text-foreground leading-snug">{alert.message}</p>
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-2 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Battery className="h-3.5 w-3.5 shrink-0" />
                          {displayBatteryId(alert.battery_id)}
                        </span>
                        <span className="hidden sm:inline">•</span>
                        <span>{new Date(alert.created_at).toLocaleString()}</span>
                      </div>
                    </div>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                      {!alert.acknowledged && (
                        <Button variant="ghost" size="icon" onClick={() => handleAcknowledge(alert.id)} className="h-9 w-9 text-primary hover:bg-primary/10">
                          <CheckCircle className="h-5 w-5" />
                        </Button>
                      )}
                      <Button variant="ghost" size="icon" onClick={() => handleDismiss(alert.id)} className="h-9 w-9 text-muted-foreground hover:text-destructive hover:bg-destructive/10">
                        <XCircle className="h-5 w-5" />
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="bg-card/95 backdrop-blur-sm rounded-2xl border border-border/80 p-16 md:p-20 text-center relative overflow-hidden animate-fade-in hover-lift">
              <div className="absolute inset-0 opacity-[0.06]">
                <img src={batteryGlowImage} alt="" className="w-full h-full object-cover" />
              </div>
              <div className="relative">
                <div className="w-24 h-24 mx-auto rounded-2xl bg-status-healthy/10 flex items-center justify-center mb-6 animate-float shadow-inner">
                  <Sparkles className="h-12 w-12 text-status-healthy" />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-2">No alerts</h3>
                <p className="text-muted-foreground max-w-sm mx-auto">All systems are running smoothly. New recyclable or repairable batteries will appear here and trigger email alerts.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
};

export default Alerts;
