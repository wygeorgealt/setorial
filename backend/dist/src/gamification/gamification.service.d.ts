import { OnModuleDestroy } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
export declare class GamificationService implements OnModuleDestroy {
    private prisma;
    private redis;
    constructor(prisma: PrismaService);
    onModuleDestroy(): void;
    awardPoints(userId: string, points: number, action: string): Promise<void>;
    incrementStreak(userId: string): Promise<number>;
    getLeaderboard(limit?: number): Promise<string[]>;
}
