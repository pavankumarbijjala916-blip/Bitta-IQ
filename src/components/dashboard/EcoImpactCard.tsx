import { motion } from 'framer-motion';
import { Leaf, Wind, TreePine } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { calculateEcoImpact } from '@/lib/utils';
import { useBatteries } from '@/hooks/useBatteries';

export const EcoImpactCard = () => {
    const { batteries } = useBatteries();
    const { co2SavedKg, treesPlanted } = calculateEcoImpact(batteries);

    return (
        <Card className="border-green-500/20 bg-gradient-to-br from-green-500/5 to-emerald-500/5 overflow-hidden relative">
            <div className="absolute -right-10 -top-10 w-32 h-32 bg-green-500/10 rounded-full blur-3xl animate-pulse" />

            <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-green-600 dark:text-green-400">
                    <Leaf className="w-5 h-5" />
                    Eco Impact
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                        <div className="flex items-center gap-2 text-muted-foreground text-xs">
                            <Wind className="w-3 h-3" /> CO₂ Offset
                        </div>
                        <p className="text-2xl font-bold text-foreground">
                            {co2SavedKg} <span className="text-sm font-normal text-muted-foreground">kg</span>
                        </p>
                    </div>

                    <div className="space-y-1">
                        <div className="flex items-center gap-2 text-muted-foreground text-xs">
                            <TreePine className="w-3 h-3" /> Trees Equiv.
                        </div>
                        <p className="text-2xl font-bold text-foreground">
                            {treesPlanted} <span className="text-sm font-normal text-muted-foreground">trees</span>
                        </p>
                    </div>
                </div>

                <div className="mt-4 pt-4 border-t border-green-500/20">
                    <p className="text-xs text-center text-muted-foreground">
                        Your battery maintenance has saved the equivalent of planting <span className="font-bold text-green-600 dark:text-green-400">{treesPlanted} trees</span>!
                    </p>
                </div>
            </CardContent>
        </Card>
    );
};
