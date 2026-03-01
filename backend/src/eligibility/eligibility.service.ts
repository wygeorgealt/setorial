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
        // In a real application, we'd iterate over all premium users and check Redis for their lastActive date.
        // E.g. get all users where tier === SILVER || tier === GOLD
        const premiumUsers = await this.prisma.user.findMany({
            where: { tier: { in: ['SILVER', 'GOLD'] } },
        });

        // We'd check Redis `streak:${userId}` hash for `lastActive`. 
        // If diff in days > 30, reset to FREE.
        this.logger.log(`Verified ${premiumUsers.length} premium users for activity.`);
    }

    // Runs on the 1st of every month to move Points to Wallet
    @Cron(CronExpression.EVERY_1ST_DAY_OF_MONTH_AT_MIDNIGHT)
    async moveEligiblePoints() {
        this.logger.log('Moving eligible points to monetizable pool...');

        // Find users who are SILVER or GOLD
        const eligibleUsers = await this.prisma.user.findMany({
            where: { tier: { in: ['SILVER', 'GOLD'] }, isVerified: true },
        });

        for (const user of eligibleUsers) {
            // Get sum of un-converted points
            const pointsData = await this.prisma.pointsLedger.aggregate({
                where: { userId: user.id },
                _sum: { points: true }
            });

            const totalPoints = pointsData._sum.points || 0;
            if (totalPoints > 5000) { // e.g. threshold
                // Abstract conversion logic hidden from user (e.g. 10 points = 1 NGN)
                const monetaryValue = totalPoints / 10;

                await this.wallet.addTransaction(
                    user.id,
                    'ELIGIBLE_MOVE' as any,
                    monetaryValue,
                    'Monthly Points Conversion'
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
