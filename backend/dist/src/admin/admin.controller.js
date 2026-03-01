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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminController = void 0;
const common_1 = require("@nestjs/common");
const payouts_service_1 = require("../payouts/payouts.service");
const prisma_service_1 = require("../prisma.service");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
const roles_guard_1 = require("../auth/roles.guard");
const roles_decorator_1 = require("../auth/roles.decorator");
let AdminController = class AdminController {
    payoutsService;
    prisma;
    constructor(payoutsService, prisma) {
        this.payoutsService = payoutsService;
        this.prisma = prisma;
    }
    async simulatePayout(month, revenue) {
        return this.payoutsService.simulatePayout(month, revenue);
    }
    async getDashboardStats() {
        const currentMonthRevenue = 5000000;
        const balances = await this.prisma.walletLedger.groupBy({
            by: ['userId'],
            _sum: { amount: true },
        });
        const totalLiability = balances.reduce((acc, curr) => acc + Number(curr._sum.amount), 0);
        const flaggedUsers = await this.prisma.user.findMany({
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
    async freezeUserWallet(userId, reason) {
        await this.prisma.user.update({
            where: { id: userId },
            data: { isVerified: false },
        });
        return { success: true, message: `User ${userId} wallet frozen. Reason: ${reason}` };
    }
};
exports.AdminController = AdminController;
__decorate([
    (0, common_1.Get)('simulate-payout'),
    __param(0, (0, common_1.Query)('month')),
    __param(1, (0, common_1.Query)('revenue', common_1.ParseFloatPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Number]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "simulatePayout", null);
__decorate([
    (0, common_1.Get)('dashboard'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "getDashboardStats", null);
__decorate([
    (0, common_1.Post)('users/:id/freeze'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)('reason')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "freezeUserWallet", null);
exports.AdminController = AdminController = __decorate([
    (0, common_1.Controller)('admin'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('ADMIN'),
    __metadata("design:paramtypes", [payouts_service_1.PayoutsService,
        prisma_service_1.PrismaService])
], AdminController);
//# sourceMappingURL=admin.controller.js.map