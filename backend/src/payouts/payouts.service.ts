import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Injectable()
export class PayoutsService {
    constructor(private prisma: PrismaService) { }

    async simulatePayout(month: string, estimatedRevenue: number) {
        const rewardPool = estimatedRevenue * 0.20; // 20% cap

        const balances = await this.prisma.walletLedger.groupBy({
            by: ['userId'],
            _sum: { amount: true },
            having: { amount: { _sum: { gt: 0 } } }
        });

        const totalEligibleBalance = balances.reduce((acc, curr) => acc + Number(curr._sum.amount), 0);

        let distributionRatio = 1; // 100%
        if (totalEligibleBalance > rewardPool && totalEligibleBalance > 0) {
            distributionRatio = rewardPool / totalEligibleBalance;
        }

        const simulatedPayouts = balances.map(b => ({
            userId: b.userId,
            eligibleBalance: Number(b._sum.amount),
            simulatedPayout: Number(b._sum.amount) * distributionRatio
        }));

        return {
            month,
            estimatedRevenue,
            rewardPool,
            totalEligibleBalance,
            distributionRatio,
            safeToExecute: totalEligibleBalance <= rewardPool, // Just informational flag
            simulatedPayoutsCount: simulatedPayouts.length,
            simulatedPayouts,
        };
    }
}
