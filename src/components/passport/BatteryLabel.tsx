import React from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Battery, ShieldCheck, Recycle } from 'lucide-react';
import type { Battery as BatteryType } from '@/types/battery';

interface BatteryLabelProps {
    battery: BatteryType;
}

export const BatteryLabel: React.FC<BatteryLabelProps> = ({ battery }) => {
    const passportUrl = `${window.location.origin}/passport/${battery.id}`;

    return (
        <div className="w-[400px] h-[250px] bg-white border-2 border-black p-4 flex flex-col justify-between print:break-inside-avoid print:border-2 font-mono">
            {/* Header */}
            <div className="flex justify-between items-start border-b-2 border-black pb-2">
                <div className="flex items-center gap-2">
                    <Battery className="w-8 h-8" />
                    <div>
                        <h1 className="text-xl font-bold uppercase tracking-wider">BATT IQ</h1>
                        <p className="text-[10px] uppercase">Official Battery Passport</p>
                    </div>
                </div>
                <div className="text-right">
                    <p className="text-xs font-bold">ID: {battery.id}</p>
                    <p className="text-[10px]">{new Date().toLocaleDateString()}</p>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex gap-4 py-2">
                <div className="border-2 border-black p-1">
                    <QRCodeSVG value={passportUrl} size={100} level="H" />
                </div>
                <div className="flex-1 space-y-1 text-sm">
                    <p><strong>Type:</strong> {battery.type}</p>
                    <p><strong>Capacity:</strong> {battery.capacity} kWh</p>
                    <p><strong>Mfg Date:</strong> {new Date(battery.createdAt).toLocaleDateString()}</p>
                    <div className="flex items-center gap-1 mt-2">
                        {battery.status === 'healthy' ? (
                            <ShieldCheck className="w-4 h-4 text-green-600" />
                        ) : (
                            <Recycle className="w-4 h-4 text-orange-600" />
                        )}
                        <span className="uppercase font-bold text-xs">{battery.status}</span>
                    </div>
                </div>
            </div>

            {/* Footer */}
            <div className="border-t-2 border-black pt-2 text-center">
                <p className="text-[10px] uppercase tracking-widest">Scan for full history & diagnostics</p>
                <p className="text-[8px] mt-1">Property of BATT IQ System • Do Not Remove</p>
            </div>
        </div>
    );
};
