import { Injectable, Inject, OnModuleDestroy } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import Redis from 'ioredis';

@Injectable()
export class GamificationService implements OnModuleDestroy {
    private redis: Redis;

    constructor(private prisma: PrismaService) {
        this.redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');
    }

    onModuleDestroy() {
        this.redis.disconnect();
    }

    async awardPoints(userId: string, points: number, action: string) {
        // Transactional Points Ledger entry
        await this.prisma.pointsLedger.create({
            data: { userId, points, action },
        });

        // Update Redis Leaderboard (Sorted Set)
        await this.redis.zincrby('leaderboard:global', points, userId);
    }

    async incrementStreak(userId: string) {
        const key = `streak:${userId}`;
        const today = new Date().toISOString().split('T')[0];
        const lastActive = await this.redis.hget(key, 'lastActive');

        let currentStreak = parseInt(await this.redis.hget(key, 'count') || '0', 10);

        if (lastActive === today) {
            return currentStreak; // Already incremented today
        }

        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = yesterday.toISOString().split('T')[0];

        if (lastActive === yesterdayStr) {
            currentStreak++;
        } else {
            currentStreak = 1; // Reset streak
        }

        await this.redis.hset(key, 'count', currentStreak);
        await this.redis.hset(key, 'lastActive', today);
        return currentStreak;
    }

    async getStreak(userId: string): Promise<number> {
        const count = await this.redis.hget(`streak:${userId}`, 'count');
        return parseInt(count || '0', 10);
    }

    async getLeaderboard(limit: number = 10) {
        return this.redis.zrevrange('leaderboard:global', 0, limit - 1, 'WITHSCORES');
    }
}
