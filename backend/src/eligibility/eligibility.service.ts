import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../prisma.service';
import { WalletService } from '../wallet/wallet.service';

@Injectable()
export class EligibilityService {
    private readonly logger = new Logger(EligibilityService.name);

    constructor(
        private prisma: PrismaService,
        private wallet: WalletService,
    ) { }

    @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
    async checkInactivityAndDemonetize() {
        this.logger.log('Running daily inactivity demonetization check...');

        const thresholdDate = new Date();
        thresholdDate.setDate(thresholdDate.getDate() - 30);

        const inactiveUsers = await this.prisma.user.findMany({
            where: {
                tier: { in: ['SILVER', 'GOLD'] },
                lastActiveAt: { lt: thresholdDate }
            },
        });

        for (const user of inactiveUsers) {
            this.logger.log(`Demonetizing user ${user.id} due to 30 days of inactivity.`);
            await this.prisma.user.update({
                where: { id: user.id },
                data: {
                    isVerified: false,
                    kycStatus: 'UNVERIFIED',
                    monetizationEligibleAt: null // Restart 12-month cycle
                }
            });
        }
    }

    // Runs on the 1st of every month to move Points to Wallet
    @Cron(CronExpression.EVERY_1ST_DAY_OF_MONTH_AT_MIDNIGHT)
    async moveEligiblePoints() {
        this.logger.log('Moving eligible points to monetizable pool...');

        const twelveMonthsAgo = new Date();
        twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12);

        // Find users who are SILVER or GOLD, have passed assessment, and have been consistent for 12 months
        const eligibleUsers = await this.prisma.user.findMany({
            where: {
                tier: { in: ['SILVER', 'GOLD'] },
                isVerified: true,
                assessmentPassed: true,
                monetizationEligibleAt: { lte: twelveMonthsAgo }
            },
        });

        // ─── Dynamic Conversion Rate (PRD 7.3) ─────────────────────────────
        // Calculate the reward pool from current revenue
        const earnAggregate = await this.prisma.walletLedger.aggregate({
            where: { type: 'EARN' },
            _sum: { amount: true },
        });
        const currentMonthRevenue = Number(earnAggregate._sum.amount ?? 0);
        const rewardPoolCap = currentMonthRevenue * 0.20; // 20% cap

        // Calculate total points across all eligible users to determine pool pressure
        let totalEligiblePoints = 0;
        for (const user of eligibleUsers) {
            const pointsData = await this.prisma.pointsLedger.aggregate({
                where: { userId: user.id },
                _sum: { points: true }
            });
            totalEligiblePoints += (pointsData._sum.points || 0);
        }

        // Base conversion: 10 points = ₦1
        // Dynamic: If total converted value would exceed the pool, adjust the rate
        const baseRate = 10; // points per ₦1
        const baseConvertedValue = totalEligiblePoints / baseRate;

        let effectiveRate = baseRate;
        if (baseConvertedValue > rewardPoolCap && rewardPoolCap > 0) {
            // Scale the rate UP so the total payout fits within the pool
            effectiveRate = totalEligiblePoints / rewardPoolCap;
            this.logger.warn(
                `Dynamic rate adjustment: base=${baseRate}, effective=${effectiveRate.toFixed(2)} ` +
                `(pool pressure: ₦${baseConvertedValue.toFixed(0)} exceeds cap ₦${rewardPoolCap.toFixed(0)})`
            );
        }

        for (const user of eligibleUsers) {
            const pointsData = await this.prisma.pointsLedger.aggregate({
                where: { userId: user.id },
                _sum: { points: true }
            });

            const totalPoints = pointsData._sum.points || 0;
            if (totalPoints > 5000) {
                // Apply dynamic conversion rate
                const monetaryValue = totalPoints / effectiveRate;

                await this.wallet.addTransaction(
                    user.id,
                    'ELIGIBLE_MOVE' as any,
                    monetaryValue,
                    `Monthly Points Conversion (rate: ${effectiveRate.toFixed(2)} pts/₦1)`
                );

                // Deduct points from points ledger (resetting their abstract balance)
                await this.prisma.pointsLedger.create({
                    data: {
                        userId: user.id,
                        action: 'MONTHLY_CONVERSION_DEDUCTION',
                        points: -totalPoints
                    }
                });
            }
        }
    }
}
