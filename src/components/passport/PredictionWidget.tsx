import { motion } from 'framer-motion';
import { Clock, AlertTriangle, CheckCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

interface PredictionWidgetProps {
    daysRemaining: number;
    failureDate: Date;
    confidence: number;
}

export const PredictionWidget = ({ daysRemaining, failureDate, confidence }: PredictionWidgetProps) => {
    // Determine status color
    const isCritical = daysRemaining < 30;
    const isWarning = daysRemaining < 90;

    const colorClass = isCritical ? 'text-red-500' : isWarning ? 'text-amber-500' : 'text-primary';
    const bgClass = isCritical ? 'bg-red-500' : isWarning ? 'bg-amber-500' : 'bg-primary';

    return (
        <Card className="border-primary/20 bg-card/50 backdrop-blur-sm overflow-hidden relative">
            <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                    <Clock className="w-4 h-4" />
                    AI Lifecycle Prediction
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="flex flex-col items-center py-4">
                    <div className="relative mb-4">
                        <div className={`text-5xl font-bold ${colorClass}`}>
                            {daysRemaining}
                        </div>
                        <div className="text-sm font-medium text-muted-foreground text-center">Days Remaining</div>
                    </div>

                    <div className="w-full space-y-4">
                        <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Projected Failure:</span>
                            <span className="font-medium">{failureDate.toLocaleDateString()}</span>
                        </div>

                        <div className="space-y-1">
                            <div className="flex justify-between text-xs text-muted-foreground">
                                <span>AI Confidence Score</span>
                                <span>{confidence}%</span>
                            </div>
                            <Progress value={confidence} className="h-1.5" />
                        </div>

                        {isCritical && (
                            <div className="flex items-center gap-2 p-2 rounded bg-red-500/10 text-red-600 text-xs mt-2">
                                <AlertTriangle className="w-3 h-3" />
                                <span>Critical: Plan replacement soon.</span>
                            </div>
                        )}
                        {!isCritical && !isWarning && (
                            <div className="flex items-center gap-2 p-2 rounded bg-green-500/10 text-green-600 text-xs mt-2">
                                <CheckCircle className="w-3 h-3" />
                                <span>Operating efficiently.</span>
                            </div>
                        )}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};
