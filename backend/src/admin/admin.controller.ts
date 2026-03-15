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


    // ─── Financial Dashboard ─────────────────────────────────────────────────

    @Get('dashboard')
    async getDashboardStats() {
        // Real revenue = sum of all EARN wallet entries
        const earnAggregate = await this.prisma.walletLedger.aggregate({
            where: { type: 'EARN' },
            _sum: { amount: true },
        });
        const currentMonthRevenue = Number(earnAggregate._sum.amount ?? 0);
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
        const totalUsers = await this.prisma.user.count({ where: { role: 'STUDENT' } });

        const latestBatch = await this.prisma.payoutBatch.findFirst({ orderBy: { createdAt: 'desc' } });

        // ─── NEW: PRD Section 7.7 Metrics ─────────────────────────────────────

        // Active monetized user count (Silver/Gold, verified, passed assessment)
        const activeMonetizedUsers = await this.prisma.user.count({
            where: {
                tier: { in: ['SILVER', 'GOLD'] },
                isVerified: true,
                assessmentPassed: true,
            },
        });

        // Projected Payout Exposure: total wallet balance across ALL monetized users
        const projectedExposure = await this.prisma.walletLedger.aggregate({
            where: {
                type: { in: ['ELIGIBLE_MOVE', 'PAYOUT'] },
            },
            _sum: { amount: true },
        });
        const projectedPayoutExposure = Number(projectedExposure._sum.amount ?? 0);

        // Distribution ratio (PRD 7.4): what % of eligible balance can we actually pay?
        const distributionRatio = totalLiability > 0
            ? Math.min(1, rewardPoolCap / totalLiability)
            : 1;

        // Dynamic Conversion Rate (PRD 7.3): adjust points-to-cash ratio
        // Base: 10 pts = ₦1. Modified by pool pressure.
        const baseConversionRate = 10; // 10 points per ₦1
        const dynamicConversionRate = baseConversionRate / distributionRatio;

        // Fraud Flags: users with suspicious activity patterns
        // Flag 1: Users with > 50,000 points earned in a single day (point farming)
        const oneDayAgo = new Date();
        oneDayAgo.setDate(oneDayAgo.getDate() - 1);
        const suspiciousHighEarners = await this.prisma.pointsLedger.groupBy({
            by: ['userId'],
            where: { createdAt: { gte: oneDayAgo } },
            _sum: { points: true },
            having: { points: { _sum: { gt: 50000 } } },
        });

        // Flag 2: Mock exam cheaters (CHEATED status)
        const cheatedAttempts = await this.prisma.mockAttempt.count({
            where: { status: 'CHEATED' },
        });

        // Sustainability tier
        const sustainabilityTier = rewardPoolCap <= currentMonthRevenue * 0.20
            ? 'YEAR_1 (20% cap)'
            : rewardPoolCap <= currentMonthRevenue * 0.25
                ? 'YEAR_2 (25% cap)'
                : 'HARD_CAP (30% — board review required)';

        const liabilityRatio = currentMonthRevenue > 0
            ? totalLiability / currentMonthRevenue
            : 0;

        const riskLevel = liabilityRatio > 0.3
            ? 'CRITICAL'
            : liabilityRatio > 0.2
                ? 'WARNING'
                : 'SAFE';

        return {
            currentMonthRevenue,
            rewardPoolCap,
            totalLiability,
            liabilityRatio: Math.round(liabilityRatio * 10000) / 100, // as percentage
            projectedPayoutExposure,
            distributionRatio: Math.round(distributionRatio * 10000) / 100,
            dynamicConversionRate: Math.round(dynamicConversionRate * 100) / 100,
            riskLevel,
            sustainabilityTier,
            activeMonetizedUsers,
            fraudFlags: {
                suspiciousHighEarners: suspiciousHighEarners.length,
                cheatedMockAttempts: cheatedAttempts,
                flaggedUserIds: suspiciousHighEarners.map(u => u.userId),
            },
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
        const where: any = { role: 'STUDENT' };
        if (tier) where.tier = tier.toUpperCase();
        if (kycStatus) where.kycStatus = kycStatus.toUpperCase();
        return this.prisma.user.findMany({
            where,
            select: { id: true, name: true, email: true, tier: true, kycStatus: true, isVerified: true, createdAt: true },
            orderBy: { createdAt: 'desc' },
        });
    }

    @Post('users/:id/freeze')
    async freezeUser(@Param('id') userId: string, @Body('isFrozen') isFrozen: boolean) {
        return this.prisma.user.update({
            where: { id: userId },
            data: { isFrozen },
            select: { id: true, email: true, isFrozen: true },
        });
    }

    @Post('users/:id/flag')
    async flagUser(@Param('id') userId: string, @Body('isFlagged') isFlagged: boolean) {
        return this.prisma.user.update({
            where: { id: userId },
            data: { isFlagged },
            select: { id: true, email: true, isFlagged: true },
        });
    }

    // ─── Global Configuration ───────────────────────────────────────────────

    @Get('configs')
    async getConfigs() {
        return this.prisma.globalConfig.findMany();
    }

    @Post('configs/:key')
    async updateConfig(@Param('key') key: string, @Body('value') value: string, @Body('description') description?: string) {
        return this.prisma.globalConfig.upsert({
            where: { key },
            update: { value, description },
            create: { key, value, description },
        });
    }

    // ─── Discount Codes ─────────────────────────────────────────────────────

    @Get('discounts')
    async getDiscounts() {
        return this.prisma.discountCode.findMany();
    }

    @Post('discounts')
    async createDiscount(@Body() data: { code: string, discountPercent: number, maxUses?: number, expiryDate?: string }) {
        return this.prisma.discountCode.create({
            data: {
                ...data,
                expiryDate: data.expiryDate ? new Date(data.expiryDate) : null,
            },
        });
    }

    @Post('discounts/:id/toggle')
    async toggleDiscount(@Param('id') id: string, @Body('isActive') isActive: boolean) {
        return this.prisma.discountCode.update({
            where: { id },
            data: { isActive },
        });
    }

    // ─── Payout Batches ─────────────────────────────────────────────────────

    @Get('payout-batches')
    async getPayoutBatches() {
        return this.prisma.payoutBatch.findMany({ orderBy: { createdAt: 'desc' } });
    }

    /** Manual trigger for testing — production version runs on cron */
    @Post('payout/trigger')
    async triggerPayout(@Query('month') month: string) {
        return this.payoutsService.processPayout(month);
    }

    @Get('payout/simulate')
    async simulatePayout(
        @Query('month') month: string,
        @Query('revenue') revenue?: string,
    ) {
        return this.payoutsService.simulatePayout(month, revenue ? parseFloat(revenue) : undefined);
    }
}
