"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var PayoutsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.PayoutsService = void 0;
const common_1 = require("@nestjs/common");
const schedule_1 = require("@nestjs/schedule");
const prisma_service_1 = require("../prisma.service");
const client_1 = require("@prisma/client");
let PayoutsService = PayoutsService_1 = class PayoutsService {
    prisma;
    logger = new common_1.Logger(PayoutsService_1.name);
    constructor(prisma) {
        this.prisma = prisma;
    }
    async simulatePayout(month, estimatedRevenue) {
        const rewardPool = estimatedRevenue * 0.20;
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
    async processPayout(month, estimatedRevenue) {
        this.logger.log(`📤 Processing payout batch for ${month} with revenue ₦${estimatedRevenue}`);
        const rewardPool = estimatedRevenue * 0.20;
        const verifiedUsers = await this.prisma.user.findMany({
            where: { kycStatus: 'APPROVED', isVerified: true, tier: { in: ['SILVER', 'GOLD'] } },
            select: { id: true },
        });
        const verifiedIds = verifiedUsers.map(u => u.id);
        if (verifiedIds.length === 0) {
            this.logger.warn('No verified eligible users found for payout.');
            return { message: 'No eligible verified users found', month, totalPaid: 0 };
        }
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
        await this.prisma.$transaction(async (tx) => {
            for (const { userId, eligibleBalance } of balances) {
                const payAmount = parseFloat((eligibleBalance * distributionRatio).toFixed(2));
                totalPaid += payAmount;
                await tx.walletLedger.create({
                    data: {
                        userId,
                        type: 'PAYOUT',
                        amount: new client_1.Prisma.Decimal(-payAmount),
                        reference: batchRef,
                    },
                });
            }
        });
        const batch = await this.prisma.payoutBatch.create({
            data: {
                month,
                totalLiability: new client_1.Prisma.Decimal(totalEligibleBalance),
                totalPaid: new client_1.Prisma.Decimal(totalPaid),
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
    async handleMonthlyPayout() {
        const now = new Date();
        const month = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
        const mockedMonthlyRevenue = 5_000_000;
        this.logger.log(`⏰ Cron: 28th-of-month payout triggered for ${month}`);
        await this.processPayout(month, mockedMonthlyRevenue);
    }
};
exports.PayoutsService = PayoutsService;
__decorate([
    (0, schedule_1.Cron)('0 0 28 * *'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], PayoutsService.prototype, "handleMonthlyPayout", null);
exports.PayoutsService = PayoutsService = PayoutsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], PayoutsService);
//# sourceMappingURL=payouts.service.js.map