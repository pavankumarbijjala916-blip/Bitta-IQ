import { useParams, Link, useNavigate } from 'react-router-dom';
import { useBatteries } from '@/hooks/useBatteries';
import { AppLayout } from '@/components/layout/AppLayout';
import { BatteryPassport } from '@/components/passport/BatteryPassport';
import { Button } from '@/components/ui/button';
import { ArrowLeft, SearchX, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

const PassportView = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { batteries, loading, deleteBattery } = useBatteries();

    const battery = batteries.find(b => b.id === id || b.battery_id === id);

    if (loading) {
        return (
            <AppLayout>
                <div className="flex flex-col items-center justify-center min-h-[60vh]">
                    <Loader2 className="w-8 h-8 animate-spin text-primary mb-4" />
                    <p className="text-muted-foreground">Retrieving digital passport...</p>
                </div>
            </AppLayout>
        );
    }

    if (!battery) {
        return (
            <AppLayout>
                <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
                    <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center">
                        <SearchX className="w-8 h-8 text-muted-foreground" />
                    </div>
                    <h1 className="text-2xl font-bold">Passport Not Found</h1>
                    <p className="text-muted-foreground text-center max-w-md">
                        The battery ID "{id}" does not exist in our registry. Please check the ID or scan a valid QR code.
                    </p>
                    <Link to="/dashboard">
                        <Button>Return to Dashboard</Button>
                    </Link>
                </div>
            </AppLayout>
        );
    }

    // Map DatabaseBattery to Application Battery Type
    const mappedBattery = {
        ...battery,
        chargeCycles: battery.charge_cycles,
        createdAt: new Date(battery.created_at),
        lastUpdated: new Date(battery.updated_at),
        // Ensure status is typed correctly
        status: battery.status as 'healthy' | 'repairable' | 'recyclable',
        type: battery.type as 'Li-ion' | 'Lead-Acid' | 'NiMH' | 'NiCd' | 'LiFePO4'
    };

    const handleDelete = async () => {
        if (window.confirm('Are you sure you want to delete this battery? This action cannot be undone.')) {
            try {
                await deleteBattery(battery.id);
                toast.success('Battery deleted successfully');
                navigate('/dashboard');
            } catch (error) {
                console.error('Failed to delete battery:', error);
                toast.error('Failed to delete battery');
            }
        }
    };

    return (
        <AppLayout>
            <div className="mb-6">
                <Link to="/monitor">
                    <Button variant="ghost" size="sm" className="gap-2">
                        <ArrowLeft className="w-4 h-4" /> Back to Fleet
                    </Button>
                </Link>
            </div>
            <BatteryPassport battery={mappedBattery} onDelete={handleDelete} />
        </AppLayout>
    );
};

export default PassportView;
