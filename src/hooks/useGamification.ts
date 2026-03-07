import { useState, useEffect } from 'react';
import { useBatteries } from './useBatteries';

export interface LevelInfo {
    level: number;
    title: string;
    xp: number;
    nextLevelXp: number;
    progress: number;
}

export const useGamification = () => {
    const { getStats } = useBatteries();
    const [levelInfo, setLevelInfo] = useState<LevelInfo>({
        level: 1,
        title: 'Battery Novice',
        xp: 0,
        nextLevelXp: 100,
        progress: 0,
    });

    useEffect(() => {
        const stats = getStats();

        // XP Calculation Logic
        // +50 XP per registered battery
        // +100 XP per HEALTHY battery
        // +20 XP per REPAIRABLE (encouraging tracking)
        // +50 XP per RECYCLABLE (encouraging proper disposal tracking)

        let xp = 0;
        xp += stats.total * 50;
        xp += stats.healthy * 100;
        xp += stats.repairable * 20;
        xp += stats.recyclable * 50;

        // Level Calculation
        // Level 1: 0-200 XP
        // Level 2: 201-500 XP
        // Level 3: 501-1000 XP
        // ... geometric progression

        let level = 1;
        let nextLevelXp = 200;
        let title = 'Battery Novice';

        if (xp > 200) { level = 2; nextLevelXp = 500; title = 'Eco-Conscious User'; }
        if (xp > 500) { level = 3; nextLevelXp = 1000; title = 'Green Guardian'; }
        if (xp > 1000) { level = 4; nextLevelXp = 2000; title = 'Planetary Protector'; }
        if (xp > 2000) { level = 5; nextLevelXp = 5000; title = 'Sustainability Legend'; }

        // Calculate progress percentage for current level
        // (Current XP - Previous Level Max) / (Next Level Max - Previous Level Max)
        // Simplified for this version: just raw percentage of next level target
        // A better formula would be: (xp - prevLevelXp) / (nextLevelXp - prevLevelXp)

        const prevLevelThresholds = [0, 200, 500, 1000, 2000, 5000];
        const prevXp = prevLevelThresholds[level - 1];
        const levelRange = nextLevelXp - prevXp;
        const progress = Math.min(100, Math.max(0, ((xp - prevXp) / levelRange) * 100));

        setLevelInfo({
            level,
            title,
            xp,
            nextLevelXp,
            progress,
        });
    }, [getStats]); // Re-calculate when stats change

    return levelInfo;
};
