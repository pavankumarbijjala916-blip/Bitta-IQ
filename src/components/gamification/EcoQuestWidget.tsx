import { motion } from 'framer-motion';
import { Award, Zap, Shield, Crown } from 'lucide-react';
import { useGamification } from '@/hooks/useGamification';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

export const EcoQuestWidget = () => {
    const { level, title, xp, nextLevelXp, progress } = useGamification();

    const badges = [
        { id: 1, icon: Zap, color: 'text-yellow-400', name: 'Early Adopter', earned: true },
        { id: 2, icon: Shield, color: 'text-green-400', name: 'Guardian', earned: level >= 2 },
        { id: 3, icon: Crown, color: 'text-purple-400', name: 'Legend', earned: level >= 5 },
    ];

    return (
        <Card className="border-primary/20 bg-card/50 backdrop-blur-sm overflow-hidden relative group">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

            <CardHeader className="pb-2">
                <CardTitle className="text-lg font-bold flex items-center justify-between">
                    <span className="flex items-center gap-2">
                        <Award className="h-5 w-5 text-primary animate-pulse" />
                        Eco-Quest Profile
                    </span>
                    <span className="text-xs font-mono bg-primary/20 text-primary px-2 py-1 rounded-full border border-primary/30">
                        Lvl {level}
                    </span>
                </CardTitle>
            </CardHeader>

            <CardContent className="space-y-6">
                {/* User Title & XP */}
                <div className="space-y-2">
                    <div className="flex justify-between items-end">
                        <h3 className="font-bold text-xl text-foreground bg-clip-text text-transparent bg-gradient-to-r from-primary to-green-400">
                            {title}
                        </h3>
                        <span className="text-xs text-muted-foreground font-mono">
                            {xp} / {nextLevelXp} XP
                        </span>
                    </div>
                    <div className="relative h-3 w-full bg-secondary/50 rounded-full overflow-hidden">
                        <motion.div
                            className="absolute top-0 left-0 h-full bg-primary shadow-[0_0_10px_rgba(34,197,94,0.6)]"
                            initial={{ width: 0 }}
                            animate={{ width: `${progress}%` }}
                            transition={{ duration: 1.5, ease: "easeOut" }}
                        />
                    </div>
                    <p className="text-xs text-muted-foreground text-right">
                        {Math.round(nextLevelXp - xp)} XP to next level
                    </p>
                </div>

                {/* Badges */}
                <div className="flex justify-between items-center gap-2">
                    {badges.map((badge) => (
                        <div
                            key={badge.id}
                            className={`flex flex-col items-center gap-1 p-2 rounded-lg transition-all duration-300 ${badge.earned ? 'opacity-100 scale-100' : 'opacity-30 scale-90 grayscale'}`}
                        >
                            <div className={`p-2 rounded-full bg-secondary border border-border ${badge.earned ? 'shadow-lg shadow-primary/10' : ''}`}>
                                <badge.icon className={`h-5 w-5 ${badge.color}`} />
                            </div>
                            <span className="text-[10px] font-medium text-muted-foreground">{badge.name}</span>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
};
