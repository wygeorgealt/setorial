import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { GamificationService } from '../gamification/gamification.service';

@Injectable()
export class StoreService {
    constructor(
        private prisma: PrismaService,
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

    /**
     * Initialize a Paystack transaction for a power-up purchase.
     * Returns authorization_url and reference for the client to open Paystack checkout.
     */
    async initializePurchase(userId: string, powerUpType: string) {
        await this.seedPowerUps();

        const secret = process.env.PAYSTACK_SECRET_KEY;
        if (!secret) throw new BadRequestException('Paystack not configured');

        const powerUp = await this.prisma.powerUp.findUnique({
            where: { type: powerUpType as any },
        });
        if (!powerUp) throw new NotFoundException('Power-up not found');

        const user = await this.prisma.user.findUnique({ where: { id: userId } });
        if (!user) throw new BadRequestException('User not found');

        const amount = Math.round(Number(powerUp.price) * 100); // Convert to kobo

        const response = await fetch('https://api.paystack.co/transaction/initialize', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${secret}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                email: user.email,
                amount,
                metadata: {
                    userId: user.id,
                    powerUpType: powerUp.type,
                    purchaseType: 'POWERUP',
                },
                callback_url: `setorial://payment-callback`,
            }),
        });

        const data = await response.json();
        if (!data.status) throw new BadRequestException(data.message || 'Payment initialization failed');

        return {
            authorization_url: data.data.authorization_url,
            access_code: data.data.access_code,
            reference: data.data.reference,
        };
    }

    /**
     * Verify a Paystack transaction and activate the power-up if successful.
     */
    async verifyPurchase(reference: string) {
        const secret = process.env.PAYSTACK_SECRET_KEY;
        if (!secret) throw new BadRequestException('Paystack not configured');

        const response = await fetch(`https://api.paystack.co/transaction/verify/${reference}`, {
            headers: { 'Authorization': `Bearer ${secret}` },
        });

        const data = await response.json();
        if (!data.status || data.data.status !== 'success') {
            return { status: 'failed', message: 'Payment not verified' };
        }

        const metadata = data.data.metadata;
        if (metadata?.purchaseType === 'POWERUP' && metadata?.userId && metadata?.powerUpType) {
            const powerUp = await this.prisma.powerUp.findUnique({
                where: { type: metadata.powerUpType as any },
            });

            if (powerUp) {
                const expiresAt = powerUp.durationDays
                    ? new Date(Date.now() + powerUp.durationDays * 24 * 60 * 60 * 1000)
                    : null;

                await this.prisma.userPowerUp.create({
                    data: {
                        userId: metadata.userId,
                        powerUpId: powerUp.id,
                        expiresAt,
                    },
                });

                // If it's a streak freeze, apply it immediately
                if (powerUp.type === 'STREAK_FREEZE') {
                    await this.gamification.applyStreakFreeze(metadata.userId);
                }
            }
        }

        return { status: 'success', powerUpType: metadata?.powerUpType };
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
