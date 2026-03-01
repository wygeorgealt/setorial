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
Object.defineProperty(exports, "__esModule", { value: true });
exports.PayoutsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma.service");
let PayoutsService = class PayoutsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async simulatePayout(month, estimatedRevenue) {
        const rewardPool = estimatedRevenue * 0.20;
        const balances = await this.prisma.walletLedger.groupBy({
            by: ['userId'],
            _sum: { amount: true },
            having: { amount: { _sum: { gt: 0 } } }
        });
        const totalEligibleBalance = balances.reduce((acc, curr) => acc + Number(curr._sum.amount), 0);
        let distributionRatio = 1;
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
            safeToExecute: totalEligibleBalance <= rewardPool,
            simulatedPayoutsCount: simulatedPayouts.length,
            simulatedPayouts,
        };
    }
};
exports.PayoutsService = PayoutsService;
exports.PayoutsService = PayoutsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], PayoutsService);
//# sourceMappingURL=payouts.service.js.map