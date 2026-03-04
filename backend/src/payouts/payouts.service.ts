import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { PrismaService } from '../prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class PayoutsService {
    private readonly logger = new Logger(PayoutsService.name);

    constructor(private prisma: PrismaService) { }

    /**
     * Preview-only simulation — does NOT write any changes.
     * Returns how much each eligible user would receive given a revenue figure.
     */
    async simulatePayout(month: string, estimatedRevenue: number) {
        const rewardPool = estimatedRevenue * 0.20; // 20% cap per PRD §7.1

        // Only count ELIGIBLE_MOVE credits minus PAYOUT debits per user
        const credits = await this.prisma.walletLedger.groupBy({
            by: ['userId'],
            where: { type: 'ELIGIBLE_MOVE' },
            _sum: { amount: true },
        });
        const debits = await this.prisma.walletLedger.groupBy({
            by: ['userId'],
            where: { type: 'PAYOUT' },
            _sum: { amount: true },
        });

        const debitMap = new Map(debits.map(d => [d.userId, Number(d._sum.amount ?? 0)]));

        const balances = credits
            .map(c => ({
                userId: c.userId,
                eligibleBalance: Number(c._sum.amount ?? 0) - (debitMap.get(c.userId) ?? 0),
            }))
            .filter(b => b.eligibleBalance > 0);

        const totalEligibleBalance = balances.reduce((acc, b) => acc + b.eligibleBalance, 0);
        const distributionRatio = totalEligibleBalance > rewardPool && totalEligibleBalance > 0
            ? rewardPool / totalEligibleBalance
            : 1;

        const simulatedPayouts = balances.map(b => ({
            userId: b.userId,
            eligibleBalance: b.eligibleBalance,
            simulatedPayout: parseFloat((b.eligibleBalance * distributionRatio).toFixed(2)),
        }));

        return {
            month,
            estimatedRevenue,
            rewardPool,
            totalEligibleBalance,
            distributionRatio,
            safeToExecute: totalEligibleBalance <= rewardPool,
            simulatedPayoutsCount: simulatedPayouts.length,
            simulatedPayouts,
        };
    }

    /**
     * REAL payout — writes PAYOUT ledger entries and records a PayoutBatch.
     * Called by the cron on the 28th or manually via admin trigger.
     */
    async processPayout(month: string, estimatedRevenue: number) {
        this.logger.log(`📤 Processing payout batch for ${month} with revenue ₦${estimatedRevenue}`);

        const rewardPool = estimatedRevenue * 0.20;

        // Get verified (KYC-approved) users only
        const verifiedUsers = await this.prisma.user.findMany({
            where: { kycStatus: 'APPROVED', isVerified: true, tier: { in: ['SILVER', 'GOLD'] } },
            select: { id: true },
        });
        const verifiedIds = verifiedUsers.map(u => u.id);

        if (verifiedIds.length === 0) {
            this.logger.warn('No verified eligible users found for payout.');
            return { message: 'No eligible verified users found', month, totalPaid: 0 };
        }

        // Calculate net eligible balance per user
        const credits = await this.prisma.walletLedger.groupBy({
            by: ['userId'],
            where: { type: 'ELIGIBLE_MOVE', userId: { in: verifiedIds } },
            _sum: { amount: true },
        });
        const debits = await this.prisma.walletLedger.groupBy({
            by: ['userId'],
            where: { type: 'PAYOUT', userId: { in: verifiedIds } },
            _sum: { amount: true },
        });

        const debitMap = new Map(debits.map(d => [d.userId, Number(d._sum.amount ?? 0)]));
        const balances = credits
            .map(c => ({
                userId: c.userId,
                eligibleBalance: Number(c._sum.amount ?? 0) - (debitMap.get(c.userId) ?? 0),
            }))
            .filter(b => b.eligibleBalance > 0);

        const totalEligibleBalance = balances.reduce((acc, b) => acc + b.eligibleBalance, 0);
        const distributionRatio = totalEligibleBalance > rewardPool ? rewardPool / totalEligibleBalance : 1;

        let totalPaid = 0;
        const batchRef = `BATCH-${month}-${Date.now()}`;

        // Write payout ledger entries in a transaction
        await this.prisma.$transaction(async (tx) => {
            for (const { userId, eligibleBalance } of balances) {
                const payAmount = parseFloat((eligibleBalance * distributionRatio).toFixed(2));
                totalPaid += payAmount;
                await (tx as any).walletLedger.create({
                    data: {
                        userId,
                        type: 'PAYOUT',
                        amount: new Prisma.Decimal(-payAmount),  // debit
                        reference: batchRef,
                    },
                });
            }
        });

        // Record the batch
        const batch = await (this.prisma as any).payoutBatch.create({
            data: {
                month,
                totalLiability: new Prisma.Decimal(totalEligibleBalance),
                totalPaid: new Prisma.Decimal(totalPaid),
                status: 'COMPLETED',
            },
        });

        this.logger.log(`✅ Payout batch complete. Total paid: ₦${totalPaid}. Users paid: ${balances.length}`);

        return {
            batchId: batch.id,
            month,
            rewardPool,
            totalEligibleBalance,
            distributionRatio,
            totalPaid,
            usersPaid: balances.length,
        };
    }

    /**
     * Cron job — runs at 00:00 on the 28th of every month automatically.
     * Revenue is mocked here; in production pull from a RevenueService or config.
     */
    @Cron('0 0 28 * *')
    async handleMonthlyPayout() {
        const now = new Date();
        const month = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
        const mockedMonthlyRevenue = 5_000_000; // ₦5,000,000 — replace with real revenue source
        this.logger.log(`⏰ Cron: 28th-of-month payout triggered for ${month}`);
        await this.processPayout(month, mockedMonthlyRevenue);
    }
}
