import { useLocation, useNavigate, Navigate } from 'react-router-dom';
import {
  Battery,
  CheckCircle,
  Wrench,
  Recycle,
  ArrowLeft,
  Zap,
  Thermometer,
  RefreshCw,
  Gauge,
  MapPin
} from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/common/StatusBadge';
import { SoHProgressBar } from '@/components/common/SoHProgressBar';
import { BatteryStatus } from '@/types/battery';
import { cn } from '@/lib/utils';

interface ResultState {
  batteryId: string;
  type: string;
  soh: number;
  status: BatteryStatus;
  voltage: number;
  temperature: number;
  chargeCycles: number;
  capacity: number;
  location: string;
  image?: string;
}

const recommendations = {
  healthy: {
    icon: CheckCircle,
    title: 'Battery is in Good Condition',
    message: 'This battery is performing well and can continue to be used. Regular monitoring is recommended to maintain optimal performance.',
    tips: [
      'Continue normal usage patterns',
      'Store in a cool, dry environment',
      'Avoid extreme temperatures',
      'Schedule next health check in 3 months',
    ],
  },
  repairable: {
    icon: Wrench,
    title: 'Battery Needs Attention',
    message: 'This battery shows signs of degradation but can potentially be repaired or reconditioned to extend its lifespan.',
    tips: [
      'Consider professional reconditioning',
      'Reduce heavy discharge cycles',
      'Check for physical damage',
      'Monitor temperature during charging',
    ],
  },
  recyclable: {
    icon: Recycle,
    title: 'Battery Should Be Recycled',
    message: 'This battery has reached the end of its useful life. Please dispose of it properly at an authorized recycling facility.',
    tips: [
      'Do not dispose in regular trash',
      'Find a certified recycling center',
      'Remove from device before recycling',
      'Document disposal for compliance',
    ],
  },
};

const BatteryResults = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const state = location.state as ResultState | null;

  if (!state) {
    return <Navigate to="/register" replace />;
  }

  const rec = recommendations[state.status];
  const RecIcon = rec.icon;

  return (
    <AppLayout>
      <div className="max-w-3xl mx-auto space-y-8">
        {/* Back Button */}
        <Button
          variant="ghost"
          onClick={() => navigate('/register')}
          className="animate-fade-in"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Register Another Battery
        </Button>

        {/* Results Header */}
        <div className="text-center space-y-4 animate-fade-in">
          <div
            className={cn(
              "inline-flex items-center justify-center w-20 h-20 rounded-2xl shadow-elevated mx-auto",
              state.status === 'healthy' && 'bg-status-healthy/10',
              state.status === 'repairable' && 'bg-status-repairable/10',
              state.status === 'recyclable' && 'bg-status-recyclable/10'
            )}
          >
            <RecIcon
              className={cn(
                "h-10 w-10",
                state.status === 'healthy' && 'text-status-healthy',
                state.status === 'repairable' && 'text-status-repairable',
                state.status === 'recyclable' && 'text-status-recyclable'
              )}
            />
          </div>
          <h1 className="text-3xl font-bold text-foreground">{rec.title}</h1>
          <StatusBadge status={state.status} size="lg" />
        </div>

        {/* SoH Progress */}
        <div className="bg-card rounded-xl border border-border p-6 shadow-card animate-fade-in">
          <div className="text-center mb-6">
            <p className="text-5xl font-bold text-foreground">{state.soh}%</p>
            <p className="text-muted-foreground mt-1">State of Health</p>
          </div>
          <SoHProgressBar soh={state.soh} status={state.status} size="lg" showLabel={false} />
        </div>

        {/* Battery Details */}
        <div className="bg-card rounded-xl border border-border p-6 shadow-card animate-fade-in">
          <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
            <Battery className="h-5 w-5 text-primary" />
            Battery Details
          </h2>

          {state.image && (
            <div className="mb-6 rounded-lg overflow-hidden border border-border max-w-sm mx-auto">
              <img
                src={state.image}
                alt="Battery Preview"
                className="w-full h-auto object-cover max-h-64"
              />
            </div>
          )}

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-lg bg-secondary/50">
              <p className="text-sm text-muted-foreground">Battery ID</p>
              <p className="font-semibold text-foreground">{state.batteryId}</p>
            </div>
            <div className="p-4 rounded-lg bg-secondary/50">
              <p className="text-sm text-muted-foreground flex items-center gap-1">
                <Zap className="h-3 w-3" /> Type
              </p>
              <p className="font-semibold text-foreground">{state.type}</p>
            </div>
            <div className="p-4 rounded-lg bg-secondary/50">
              <p className="text-sm text-muted-foreground flex items-center gap-1">
                <Zap className="h-3 w-3" /> Voltage
              </p>
              <p className="font-semibold text-foreground">{state.voltage}V</p>
            </div>
            <div className="p-4 rounded-lg bg-secondary/50">
              <p className="text-sm text-muted-foreground flex items-center gap-1">
                <Thermometer className="h-3 w-3" /> Temperature
              </p>
              <p className="font-semibold text-foreground">{state.temperature}°C</p>
            </div>
            <div className="p-4 rounded-lg bg-secondary/50">
              <p className="text-sm text-muted-foreground flex items-center gap-1">
                <RefreshCw className="h-3 w-3" /> Charge Cycles
              </p>
              <p className="font-semibold text-foreground">{state.chargeCycles}</p>
            </div>
            <div className="p-4 rounded-lg bg-secondary/50">
              <p className="text-sm text-muted-foreground flex items-center gap-1">
                <Gauge className="h-3 w-3" /> Capacity
              </p>
              <p className="font-semibold text-foreground">{state.capacity}%</p>
            </div>
          </div>
          <div className="mt-4 p-4 rounded-lg bg-secondary/50">
            <p className="text-sm text-muted-foreground flex items-center gap-1">
              <MapPin className="h-3 w-3" /> Location
            </p>
            <p className="font-semibold text-foreground">{state.location}</p>
          </div>
        </div>

        {/* Recommendation */}
        <div
          className={cn(
            "rounded-xl border p-6 shadow-card animate-fade-in",
            state.status === 'healthy' && 'bg-status-healthy/5 border-status-healthy/20',
            state.status === 'repairable' && 'bg-status-repairable/5 border-status-repairable/20',
            state.status === 'recyclable' && 'bg-status-recyclable/5 border-status-recyclable/20'
          )}
        >
          <h2 className="text-lg font-semibold text-foreground mb-3">Recommendation</h2>
          <p className="text-muted-foreground mb-4">{rec.message}</p>
          <ul className="space-y-2">
            {rec.tips.map((tip, index) => (
              <li key={index} className="flex items-start gap-2 text-sm">
                <span
                  className={cn(
                    "mt-1 h-1.5 w-1.5 rounded-full flex-shrink-0",
                    state.status === 'healthy' && 'bg-status-healthy',
                    state.status === 'repairable' && 'bg-status-repairable',
                    state.status === 'recyclable' && 'bg-status-recyclable'
                  )}
                />
                <span className="text-foreground">{tip}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4 animate-fade-in">
          <Button
            onClick={() => navigate('/monitor')}
            className="flex-1"
          >
            View All Batteries
          </Button>
          <Button
            variant="outline"
            onClick={() => navigate('/register')}
            className="flex-1"
          >
            Register Another
          </Button>
        </div>
      </div>
    </AppLayout>
  );
};

export default BatteryResults;
