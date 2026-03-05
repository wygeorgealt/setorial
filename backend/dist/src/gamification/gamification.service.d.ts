import { OnModuleDestroy } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
export declare class GamificationService implements OnModuleDestroy {
    private prisma;
    private redis;
    constructor(prisma: PrismaService);
    onModuleDestroy(): void;
    awardPoints(userId: string, points: number, action: string): Promise<void>;
    incrementStreak(userId: string): Promise<number>;
    applyStreakFreeze(userId: string): Promise<void>;
    getStreak(userId: string): Promise<number>;
    getStarterBadges(): Promise<void>;
    checkAndAwardBadges(userId: string, context: {
        streak: number;
        score?: number;
        total?: number;
    }): Promise<void>;
    getUserBadges(userId: string): Promise<{
        awardedAt: Date;
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        description: string;
        icon: string;
        color: string;
    }[]>;
    getLeaderboard(limit?: number): Promise<string[]>;
}
