import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { WalletService } from '../wallet/wallet.service';
import { GamificationService } from '../gamification/gamification.service';

@Injectable()
export class StoreService {
    constructor(
        private prisma: PrismaService,
        private wallet: WalletService,
        private gamification: GamificationService,
    ) { }

    /** Seed default power-ups if they don't exist */
    async seedPowerUps() {
        const defaults = [
            {
                type: 'STREAK_FREEZE' as const,
                name: 'Streak Freeze',
                description: 'Protects your streak for 1 day if you miss studying.',
                icon: 'Snowflake',
                price: 50,
                durationDays: 1,
            },
            {
                type: 'DOUBLE_POINTS' as const,
                name: '2x Points Boost',
                description: 'Earn double points on all quizzes for 24 hours.',
                icon: 'Zap',
                price: 100,
                durationDays: 1,
            },
        ];

        for (const p of defaults) {
            await this.prisma.powerUp.upsert({
                where: { type: p.type },
                update: {},
                create: p,
            });
        }
    }

    async getStore() {
        await this.seedPowerUps();
        return this.prisma.powerUp.findMany();
    }

    async purchasePowerUp(userId: string, powerUpType: string) {
        await this.seedPowerUps();

        const powerUp = await this.prisma.powerUp.findUnique({
            where: { type: powerUpType as any },
        });
        if (!powerUp) throw new NotFoundException('Power-up not found');

        const price = Number(powerUp.price);

        // Deduct from wallet
        const success = await this.wallet.deductBalance(userId, price, `Power-up: ${powerUp.name}`);
        if (!success) {
            throw new BadRequestException('Insufficient wallet balance');
        }

        // Create the user's power-up with expiration
        const expiresAt = powerUp.durationDays
            ? new Date(Date.now() + powerUp.durationDays * 24 * 60 * 60 * 1000)
            : null;

        const userPowerUp = await this.prisma.userPowerUp.create({
            data: {
                userId,
                powerUpId: powerUp.id,
                expiresAt,
            },
            include: { powerUp: true },
        });

        // If it's a streak freeze, apply it immediately in Redis
        if (powerUp.type === 'STREAK_FREEZE') {
            await this.gamification.applyStreakFreeze(userId);
        }

        return userPowerUp;
    }

    async getMyPowerUps(userId: string) {
        return this.prisma.userPowerUp.findMany({
            where: {
                userId,
                isActive: true,
                OR: [
                    { expiresAt: null },
                    { expiresAt: { gt: new Date() } },
                ],
            },
            include: { powerUp: true },
            orderBy: { activatedAt: 'desc' },
        });
    }

    /** Check if user has an active double points boost */
    async hasActiveBoost(userId: string): Promise<boolean> {
        const boost = await this.prisma.userPowerUp.findFirst({
            where: {
                userId,
                isActive: true,
                expiresAt: { gt: new Date() },
                powerUp: { type: 'DOUBLE_POINTS' },
            },
        });
        return !!boost;
    }
}
