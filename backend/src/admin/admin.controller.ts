import { Controller, Get, Post, Param, Query, UseGuards, ParseFloatPipe, Body } from '@nestjs/common';
import { PayoutsService } from '../payouts/payouts.service';
import { PrismaService } from '../prisma.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN' as any)
export class AdminController {
    constructor(
        private payoutsService: PayoutsService,
        private prisma: PrismaService,
    ) { }

    @Get('simulate-payout')
    async simulatePayout(
        @Query('month') month: string,
        @Query('revenue', ParseFloatPipe) revenue: number
    ) {
        return this.payoutsService.simulatePayout(month, revenue);
    }

    // ─── Financial Dashboard ─────────────────────────────────────────────────

    @Get('dashboard')
    async getDashboardStats() {
        const currentMonthRevenue = 5000000; // Mocked — replace with real revenue calc
        const rewardPoolCap = currentMonthRevenue * 0.20;

        // Sum all eligible (ELIGIBLE_MOVE) wallet entries
        const eligAggregate = await this.prisma.walletLedger.aggregate({
            where: { type: 'ELIGIBLE_MOVE' },
            _sum: { amount: true },
        });
        // Sum all payouts
        const payoutAggregate = await this.prisma.walletLedger.aggregate({
            where: { type: 'PAYOUT' },
            _sum: { amount: true },
        });
        const totalEarned = Number(eligAggregate._sum.amount ?? 0);
        const totalPaidOut = Number(payoutAggregate._sum.amount ?? 0);
        const totalLiability = totalEarned - totalPaidOut;

        const pendingKycCount = await this.prisma.user.count({ where: { kycStatus: 'PENDING' } });
        const approvedKycCount = await this.prisma.user.count({ where: { kycStatus: 'APPROVED' } });
        const totalUsers = await this.prisma.user.count();

        const latestBatch = await this.prisma.payoutBatch.findFirst({ orderBy: { createdAt: 'desc' } });

        return {
            currentMonthRevenue,
            rewardPoolCap,
            totalLiability,
            liabilityRatio: totalLiability / currentMonthRevenue,
            alert: totalLiability > rewardPoolCap ? 'LIABILITY EXCEEDS SAFE THRESHOLD' : 'SAFE',
            pendingKycCount,
            approvedKycCount,
            totalUsers,
            latestPayoutBatch: latestBatch ?? null,
        };
    }

    // ─── KYC Management ─────────────────────────────────────────────────────

    @Get('kyc')
    async getPendingKyc() {
        return this.prisma.user.findMany({
            where: { kycStatus: 'PENDING' },
            select: { id: true, name: true, email: true, tier: true, payoutMethod: true, payoutAccount: true, createdAt: true },
            orderBy: { updatedAt: 'asc' },
        });
    }

    @Post('kyc/:id/approve')
    async approveKyc(@Param('id') userId: string) {
        return this.prisma.user.update({
            where: { id: userId },
            data: { kycStatus: 'APPROVED', isVerified: true },
            select: { id: true, name: true, email: true, kycStatus: true, isVerified: true },
        });
    }

    @Post('kyc/:id/reject')
    async rejectKyc(@Param('id') userId: string, @Body('reason') reason: string) {
        await this.prisma.user.update({
            where: { id: userId },
            data: { kycStatus: 'REJECTED' },
        });
        return { success: true, userId, reason };
    }

    // ─── User Management ────────────────────────────────────────────────────

    @Get('users')
    async getAllUsers(
        @Query('tier') tier?: string,
        @Query('kycStatus') kycStatus?: string,
    ) {
        const where: any = {};
        if (tier) where.tier = tier.toUpperCase();
        if (kycStatus) where.kycStatus = kycStatus.toUpperCase();
        return this.prisma.user.findMany({
            where,
            select: { id: true, name: true, email: true, tier: true, kycStatus: true, isVerified: true, createdAt: true },
            orderBy: { createdAt: 'desc' },
        });
    }

    @Post('users/:id/freeze')
    async freezeUserWallet(@Param('id') userId: string, @Body('reason') reason: string) {
        await this.prisma.user.update({
            where: { id: userId },
            data: { isVerified: false },
        });
        return { success: true, message: `User ${userId} wallet frozen. Reason: ${reason}` };
    }

    // ─── Payout Batches ─────────────────────────────────────────────────────

    @Get('payout-batches')
    async getPayoutBatches() {
        return this.prisma.payoutBatch.findMany({ orderBy: { createdAt: 'desc' } });
    }

    /** Manual trigger for testing — production version runs on cron */
    @Post('payout/trigger')
    async triggerPayout(
        @Query('month') month: string,
        @Query('revenue', ParseFloatPipe) revenue: number,
    ) {
        return this.payoutsService.processPayout(month, revenue);
    }
}
