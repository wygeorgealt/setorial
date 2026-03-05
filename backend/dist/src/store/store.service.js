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
exports.StoreService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma.service");
const wallet_service_1 = require("../wallet/wallet.service");
const gamification_service_1 = require("../gamification/gamification.service");
let StoreService = class StoreService {
    prisma;
    wallet;
    gamification;
    constructor(prisma, wallet, gamification) {
        this.prisma = prisma;
        this.wallet = wallet;
        this.gamification = gamification;
    }
    async seedPowerUps() {
        const defaults = [
            {
                type: 'STREAK_FREEZE',
                name: 'Streak Freeze',
                description: 'Protects your streak for 1 day if you miss studying.',
                icon: 'Snowflake',
                price: 50,
                durationDays: 1,
            },
            {
                type: 'DOUBLE_POINTS',
                name: '2x Points Boost',
                description: 'Earn double points on all quizzes for 24 hours.',
                icon: 'Zap',
                price: 100,
                durationDays: 1,
            },
        ];
        for (const p of defaults) {
            await this.prisma.powerUp.upsert({
                where: { type: p.type },
                update: {},
                create: p,
            });
        }
    }
    async getStore() {
        await this.seedPowerUps();
        return this.prisma.powerUp.findMany();
    }
    async purchasePowerUp(userId, powerUpType) {
        await this.seedPowerUps();
        const powerUp = await this.prisma.powerUp.findUnique({
            where: { type: powerUpType },
        });
        if (!powerUp)
            throw new common_1.NotFoundException('Power-up not found');
        const price = Number(powerUp.price);
        const success = await this.wallet.deductBalance(userId, price, `Power-up: ${powerUp.name}`);
        if (!success) {
            throw new common_1.BadRequestException('Insufficient wallet balance');
        }
        const expiresAt = powerUp.durationDays
            ? new Date(Date.now() + powerUp.durationDays * 24 * 60 * 60 * 1000)
            : null;
        const userPowerUp = await this.prisma.userPowerUp.create({
            data: {
                userId,
                powerUpId: powerUp.id,
                expiresAt,
            },
            include: { powerUp: true },
        });
        if (powerUp.type === 'STREAK_FREEZE') {
            await this.gamification.applyStreakFreeze(userId);
        }
        return userPowerUp;
    }
    async getMyPowerUps(userId) {
        return this.prisma.userPowerUp.findMany({
            where: {
                userId,
                isActive: true,
                OR: [
                    { expiresAt: null },
                    { expiresAt: { gt: new Date() } },
                ],
            },
            include: { powerUp: true },
            orderBy: { activatedAt: 'desc' },
        });
    }
    async hasActiveBoost(userId) {
        const boost = await this.prisma.userPowerUp.findFirst({
            where: {
                userId,
                isActive: true,
                expiresAt: { gt: new Date() },
                powerUp: { type: 'DOUBLE_POINTS' },
            },
        });
        return !!boost;
    }
};
exports.StoreService = StoreService;
exports.StoreService = StoreService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        wallet_service_1.WalletService,
        gamification_service_1.GamificationService])
], StoreService);
//# sourceMappingURL=store.service.js.map