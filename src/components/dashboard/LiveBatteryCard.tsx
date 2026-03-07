import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, Activity, Battery, Laptop, Wifi, WifiOff, Sparkles } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface TelemetryData {
    percent: number;
    power_plugged: boolean;
    seconds_left: number;
    device: string;
    serverTime: string;
    ai_seconds_left?: number;
}

export const LiveBatteryCard = () => {
    const [data, setData] = useState<TelemetryData | null>(null);
    const [connected, setConnected] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const pollTelemetry = async () => {
            try {
                // Use relative path (proxied by Vite) to support both local and tunneled access
                const TELEMETRY_API_URL = import.meta.env.VITE_TELEMETRY_API_URL || '/api/telemetry';
                console.log(`🔌 Polling Telemetry from ${TELEMETRY_API_URL}`);

                const res = await fetch(TELEMETRY_API_URL);
                if (res.ok) {
                    const json = await res.json();
                    setConnected(json.connected);
                    if (json.success && json.data) {
                        setData(json.data);
                    }
                }
            } catch (err) {
                console.error('❌ Telemetry Poll Error:', err);
                setConnected(false);
            } finally {
                setLoading(false);
            }
        };

        // Poll every 2 seconds
        pollTelemetry();
        const interval = setInterval(pollTelemetry, 2000);
        return () => clearInterval(interval);
    }, []);

    // While loading for the first time, show a subtle spinner instead of the offline card
    if (loading) {
        return (
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-6"
            >
                <Card className="border-border/60">
                    <CardContent className="p-6">
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-full bg-muted animate-pulse" />
                            <div className="space-y-2 flex-1">
                                <div className="h-4 w-40 bg-muted rounded animate-pulse" />
                                <div className="h-3 w-60 bg-muted rounded animate-pulse" />
                            </div>
                            <div className="h-8 w-16 bg-muted rounded animate-pulse" />
                        </div>
                    </CardContent>
                </Card>
            </motion.div>
        );
    }

    // If not connected and no cached data, show an offline state
    if (!connected && !data) {

        return (
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-6"
            >
                <Card className="border-dashed border-red-200 bg-red-50/50">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="p-3 rounded-full bg-red-100 text-red-600">
                                    <WifiOff className="w-6 h-6" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-lg flex items-center gap-2 text-red-900">
                                        Battery Monitor Offline
                                        <Badge variant="outline" className="text-red-600 border-red-200">
                                            OFFLINE
                                        </Badge>
                                    </h3>
                                    <p className="text-sm text-red-700/80">
                                        Service not running. Run <code>start_batt_iq.bat</code> to enable.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </motion.div>
        );
    }

    return (
        <AnimatePresence>
            {(connected || data) && (
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="mb-6"
                >
                    <Card className="border-primary/20 bg-gradient-to-r from-primary/5 to-transparent overflow-hidden relative">
                        {/* Animated Pulse Background */}
                        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl -mr-16 -mt-16 animate-pulse" />

                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className={`p-3 rounded-full ${connected ? 'bg-green-100 text-green-600' : 'bg-yellow-100 text-yellow-600'}`}>
                                        {connected ? <Wifi className="w-6 h-6" /> : <WifiOff className="w-6 h-6" />}
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-lg flex items-center gap-2">
                                            {data?.device || 'Local Device'}
                                            <Badge variant={connected ? "default" : "outline"} className={connected ? "bg-green-500 hover:bg-green-600" : "text-yellow-600 border-yellow-200"}>
                                                {connected ? 'LIVE' : 'OFFLINE'}
                                            </Badge>
                                        </h3>
                                        <p className="text-sm text-muted-foreground flex items-center gap-1">
                                            <Laptop className="w-3 h-3" /> Real-time System Telemetry
                                        </p>
                                    </div>
                                </div>

                                {data && (
                                    <div className="flex items-center gap-8">
                                        <div className="text-right hidden sm:block">
                                            <p className="text-sm text-muted-foreground">AI Prediction</p>
                                            <div className="font-medium flex items-center gap-1 justify-end">
                                                {data.ai_seconds_left ? (
                                                    <span className="text-purple-600 dark:text-purple-400 flex items-center gap-1 animate-pulse font-mono">
                                                        <Sparkles className="h-3 w-3" />
                                                        {Math.floor(data.ai_seconds_left / 60)}m
                                                    </span>
                                                ) : (
                                                    <span className="text-muted-foreground text-xs">Learning...</span>
                                                )}
                                            </div>
                                        </div>

                                        <div className="text-right hidden sm:block">
                                            <p className="text-sm text-muted-foreground">Status</p>
                                            <p className="font-medium flex items-center gap-1 justify-end">
                                                {data.power_plugged ? (
                                                    <span className="text-green-600 flex items-center gap-1"><Zap className="w-4 h-4 fill-current" /> Charging</span>
                                                ) : (
                                                    <span className="text-orange-600 flex items-center gap-1"><Activity className="w-4 h-4" /> Draining</span>
                                                )}
                                            </p>
                                        </div>

                                        <div className="text-right">
                                            <p className="text-sm text-muted-foreground">Charge</p>
                                            <div className="flex items-end gap-2 justify-end">
                                                <span className="text-3xl font-bold text-primary">{Math.round(data.percent)}%</span>
                                                <Battery className="w-6 h-6 mb-1 text-primary" />
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>
            )}
        </AnimatePresence>
    );
};
