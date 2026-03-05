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
var EligibilityService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.EligibilityService = void 0;
const common_1 = require("@nestjs/common");
const schedule_1 = require("@nestjs/schedule");
const prisma_service_1 = require("../prisma.service");
const wallet_service_1 = require("../wallet/wallet.service");
let EligibilityService = EligibilityService_1 = class EligibilityService {
    prisma;
    wallet;
    logger = new common_1.Logger(EligibilityService_1.name);
    constructor(prisma, wallet) {
        this.prisma = prisma;
        this.wallet = wallet;
    }
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
                    monetizationEligibleAt: null
                }
            });
        }
    }
    async moveEligiblePoints() {
        this.logger.log('Moving eligible points to monetizable pool...');
        const twelveMonthsAgo = new Date();
        twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12);
        const eligibleUsers = await this.prisma.user.findMany({
            where: {
                tier: { in: ['SILVER', 'GOLD'] },
                isVerified: true,
                assessmentPassed: true,
                monetizationEligibleAt: { lte: twelveMonthsAgo }
            },
        });
        const earnAggregate = await this.prisma.walletLedger.aggregate({
            where: { type: 'EARN' },
            _sum: { amount: true },
        });
        const currentMonthRevenue = Number(earnAggregate._sum.amount ?? 0);
        const rewardPoolCap = currentMonthRevenue * 0.20;
        let totalEligiblePoints = 0;
        for (const user of eligibleUsers) {
            const pointsData = await this.prisma.pointsLedger.aggregate({
                where: { userId: user.id },
                _sum: { points: true }
            });
            totalEligiblePoints += (pointsData._sum.points || 0);
        }
        const baseRate = 10;
        const baseConvertedValue = totalEligiblePoints / baseRate;
        let effectiveRate = baseRate;
        if (baseConvertedValue > rewardPoolCap && rewardPoolCap > 0) {
            effectiveRate = totalEligiblePoints / rewardPoolCap;
            this.logger.warn(`Dynamic rate adjustment: base=${baseRate}, effective=${effectiveRate.toFixed(2)} ` +
                `(pool pressure: ₦${baseConvertedValue.toFixed(0)} exceeds cap ₦${rewardPoolCap.toFixed(0)})`);
        }
        for (const user of eligibleUsers) {
            const pointsData = await this.prisma.pointsLedger.aggregate({
                where: { userId: user.id },
                _sum: { points: true }
            });
            const totalPoints = pointsData._sum.points || 0;
            if (totalPoints > 5000) {
                const monetaryValue = totalPoints / effectiveRate;
                await this.wallet.addTransaction(user.id, 'ELIGIBLE_MOVE', monetaryValue, `Monthly Points Conversion (rate: ${effectiveRate.toFixed(2)} pts/₦1)`);
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
};
exports.EligibilityService = EligibilityService;
__decorate([
    (0, schedule_1.Cron)(schedule_1.CronExpression.EVERY_DAY_AT_MIDNIGHT),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], EligibilityService.prototype, "checkInactivityAndDemonetize", null);
__decorate([
    (0, schedule_1.Cron)(schedule_1.CronExpression.EVERY_1ST_DAY_OF_MONTH_AT_MIDNIGHT),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], EligibilityService.prototype, "moveEligiblePoints", null);
exports.EligibilityService = EligibilityService = EligibilityService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        wallet_service_1.WalletService])
], EligibilityService);
//# sourceMappingURL=eligibility.service.js.map