import React, { useRef } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { useReactToPrint } from 'react-to-print';
import {
    Battery, Calendar, MapPin, Activity, Zap, HardDrive,
    Printer, Share2, ExternalLink, ShieldCheck, Trash2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import type { Battery as BatteryType } from '@/types/battery';
import { BatteryLabel } from './BatteryLabel';
import { calculateNextCheckDate, calculateEcoImpact, predictBatteryLife } from '@/lib/utils';
import { Leaf, Award } from 'lucide-react';
import { PredictionWidget } from './PredictionWidget';

interface BatteryPassportProps {
    battery: BatteryType;
    onDelete?: () => void;
}

export const BatteryPassport: React.FC<BatteryPassportProps> = ({ battery, onDelete }) => {
    const componentRef = useRef<HTMLDivElement>(null);
    // Use configured local IP or fallback to window.location.origin
    const localIp = import.meta.env.VITE_LOCAL_IP;
    const port = window.location.port;
    const baseUrl = localIp ? `http://${localIp}:${port}` : window.location.origin;
    const passportUrl = `${baseUrl}/passport/${battery.id}`;

    const handlePrint = useReactToPrint({
        // @ts-ignore - react-to-print types mismatch with some versions
        content: () => componentRef.current,
        documentTitle: `Battery-Label-${battery.id}`,
    });

    const getHealthColor = (soh: number) => {
        if (soh >= 80) return 'text-green-500';
        if (soh >= 60) return 'text-yellow-500';
        return 'text-red-500';
    };

    return (
        <div className="max-w-4xl mx-auto space-y-8 animate-fade-in">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/60">
                            Digital Battery Passport
                        </h1>
                        <Badge variant="outline" className="text-xs uppercase tracking-widest border-primary/20 bg-primary/5">
                            Verified Asset
                        </Badge>
                    </div>
                    <p className="text-muted-foreground">
                        Official digital record and lifecycle tracking for Asset #{battery.id}
                    </p>
                </div>
                <div className="flex gap-3">
                    {onDelete && (
                        <Button variant="destructive" onClick={onDelete} className="gap-2">
                            <Trash2 className="w-4 h-4" /> Delete
                        </Button>
                    )}
                    <Button variant="outline" className="gap-2" onClick={() => navigator.share?.({ title: 'Battery Passport', url: passportUrl })}>
                        <Share2 className="w-4 h-4" /> Share
                    </Button>
                    <Button className="gap-2" onClick={handlePrint}>
                        <Printer className="w-4 h-4" /> Print Label
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Info Card */}
                <Card className="lg:col-span-2 shadow-lg border-primary/10">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <ShieldCheck className="w-5 h-5 text-primary" />
                            Identity & Specifications
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="grid grid-cols-2 gap-6">
                            <div className="space-y-1">
                                <p className="text-sm font-medium text-muted-foreground">Manufacturer ID</p>
                                <p className="text-lg font-semibold font-mono">{battery.id}</p>
                            </div>
                            <div className="space-y-1">
                                <p className="text-sm font-medium text-muted-foreground">Technology</p>
                                <p className="text-lg font-semibold">{battery.type}</p>
                            </div>
                            <div className="space-y-1">
                                <p className="text-sm font-medium text-muted-foreground">Nominal Voltage</p>
                                <p className="text-lg font-semibold flex items-center gap-1">
                                    <Zap className="w-4 h-4 text-yellow-500" />
                                    {battery.voltage}V
                                </p>
                            </div>
                            <div className="space-y-1">
                                <p className="text-sm font-medium text-muted-foreground">Capacity</p>
                                <p className="text-lg font-semibold flex items-center gap-1">
                                    <HardDrive className="w-4 h-4 text-blue-500" />
                                    {battery.capacity} kWh
                                </p>
                            </div>
                        </div>

                        <Separator />

                        {/* AI Prediction Section */}
                        <div className="mb-6">
                            <PredictionWidget
                                {...predictBatteryLife(battery.type, battery.chargeCycles, battery.soh)}
                            />
                        </div>

                        {/* Green Certificate Section */}
                        <div className="space-y-4">
                            <h3 className="font-semibold flex items-center gap-2">
                                <Activity className="w-4 h-4" /> Real-time Diagnostics
                            </h3>
                            <div className="flex items-center justify-between p-4 bg-secondary/30 rounded-lg">
                                <div className="text-center">
                                    <p className="text-sm text-muted-foreground mb-1">State of Health</p>
                                    <p className={`text-2xl font-bold ${getHealthColor(battery.soh)}`}>{battery.soh}%</p>
                                </div>
                                <div className="h-10 w-px bg-border" />
                                <div className="text-center">
                                    <p className="text-sm text-muted-foreground mb-1">Temperature</p>
                                    <p className="text-2xl font-bold">{battery.temperature}°C</p>
                                </div>
                                <div className="h-10 w-px bg-border" />
                                <div className="text-center">
                                    <p className="text-sm text-muted-foreground mb-1">Cycles</p>
                                    <p className="text-2xl font-bold">{battery.chargeCycles}</p>
                                </div>
                            </div>

                            <div className="mt-4 p-3 bg-primary/5 rounded-lg border border-primary/10">
                                <div className="flex justify-between items-center">
                                    <span className="text-sm font-medium text-foreground flex items-center gap-2">
                                        <Calendar className="w-4 h-4 text-primary" />
                                        Next Scheduled Check:
                                    </span>
                                    <span className="font-bold text-primary">
                                        {calculateNextCheckDate(battery.status, battery.lastUpdated).toLocaleDateString(undefined, {
                                            weekday: 'long',
                                            year: 'numeric',
                                            month: 'long',
                                            day: 'numeric'
                                        })}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4 text-sm">
                            <div className="flex items-center gap-2 text-muted-foreground">
                                <MapPin className="w-4 h-4" />
                                Current Location: <span className="text-foreground font-medium">{battery.location}</span>
                            </div>
                            <div className="flex items-center gap-2 text-muted-foreground">
                                <Calendar className="w-4 h-4" />
                                Commissioned: <span className="text-foreground font-medium">{new Date(battery.createdAt).toLocaleDateString()}</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* QR Code Card */}
                <Card className="shadow-lg border-primary/10">
                    <CardHeader>
                        <CardTitle>Digital Identity</CardTitle>
                        <CardDescription>Scan to verify authenticity</CardDescription>
                    </CardHeader>
                    <CardContent className="flex flex-col items-center gap-6">
                        <div className="flex flex-col items-center w-full">
                            {battery.image ? (
                                <div className="w-32 h-32 mb-4 rounded-xl overflow-hidden border-2 border-primary/20 shadow-lg">
                                    <img src={battery.image} alt="Battery Product" className="w-full h-full object-cover" />
                                </div>
                            ) : (
                                <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                                    <Battery className="w-12 h-12 text-primary animate-pulse" />
                                </div>
                            )}

                            <div className="p-4 bg-white rounded-xl shadow-inner border mb-4">
                                <QRCodeSVG value={passportUrl} size={180} level="H" includeMargin />
                            </div>
                        </div>
                        <div className="text-center space-y-2 w-full">
                            <p className="text-xs text-muted-foreground font-mono bg-secondary py-1 px-3 rounded-full inline-block">
                                {baseUrl.replace('http://', '')}/passport/{battery.id}
                            </p>
                            <div>
                                <Button variant="ghost" size="sm" className="text-xs" onClick={() => window.open(passportUrl, '_blank')}>
                                    Open Public View <ExternalLink className="w-3 h-3 ml-2" />
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Hidden Print Component */}
            <div style={{ overflow: "hidden", height: 0, width: 0 }}>
                <div ref={componentRef}>
                    <style type="text/css" media="print">
                        {`
              @page { size: auto; margin: 0mm; }
              body { margin: 20px; }
            `}
                    </style>
                    <BatteryLabel battery={battery} />
                </div>
            </div>
        </div >
    );
};
