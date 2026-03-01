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

    @Get('dashboard')
    async getDashboardStats() {
        // Total Revenue (dummy for now, normally computed from DB)
        const currentMonthRevenue = 5000000;

        // Total Monetizable Liability
        const balances = await (this.prisma as any).walletLedger.groupBy({
            by: ['userId'],
            _sum: { amount: true },
        });
        const totalLiability = balances.reduce((acc: any, curr: any) => acc + Number(curr._sum.amount), 0);

        // Flagged users (isVerified = false but tier > FREE)
        // In production we'd add an explicit isFrozen or flag flag to DB.
        const flaggedUsers = await (this.prisma as any).user.findMany({
            where: {
                tier: { not: 'FREE' },
                isVerified: false,
            },
        });

        return {
            currentMonthRevenue,
            rewardPoolSize: currentMonthRevenue * 0.20,
            totalLiability,
            liabilityRatio: totalLiability / currentMonthRevenue,
            flaggedUsersCount: flaggedUsers.length,
            alert: totalLiability > (currentMonthRevenue * 0.20) ? 'LIABILITY EXCEEDS SAFE THRESHOLD' : 'SAFE',
        };
    }

    @Post('users/:id/freeze')
    async freezeUserWallet(@Param('id') userId: string, @Body('reason') reason: string) {
        // In actual schema, add an isFrozen boolean flag to User or Wallet.
        // For now, we update isVerified = false to prevent points conversion.
        await (this.prisma as any).user.update({
            where: { id: userId },
            data: { isVerified: false }, // Simulating freeze
        });
        return { success: true, message: `User ${userId} wallet frozen. Reason: ${reason}` };
    }
}
