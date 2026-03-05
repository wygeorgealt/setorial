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
exports.PricingService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma.service");
let PricingService = class PricingService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getPricingForCountry(countryCode) {
        const pricing = await this.prisma.countryPricing.findUnique({
            where: { countryCode: countryCode.toUpperCase() },
        });
        if (!pricing || !pricing.isActive) {
            const fallback = await this.prisma.countryPricing.findUnique({
                where: { countryCode: 'US' },
            });
            return fallback || null;
        }
        return pricing;
    }
    async getAllActivePricing() {
        return this.prisma.countryPricing.findMany({
            where: { isActive: true },
            orderBy: { countryName: 'asc' },
        });
    }
    async getAllPricing() {
        return this.prisma.countryPricing.findMany({
            orderBy: { countryName: 'asc' },
        });
    }
    async createPricing(data) {
        const exists = await this.prisma.countryPricing.findUnique({
            where: { countryCode: data.countryCode.toUpperCase() },
        });
        if (exists)
            throw new common_1.BadRequestException(`Pricing for ${data.countryCode} already exists`);
        return this.prisma.countryPricing.create({
            data: {
                ...data,
                countryCode: data.countryCode.toUpperCase(),
            },
        });
    }
    async updatePricing(id, data) {
        return this.prisma.countryPricing.update({
            where: { id },
            data,
        });
    }
    async deletePricing(id) {
        return this.prisma.countryPricing.delete({ where: { id } });
    }
    async getRegionalStats() {
        const regions = await this.prisma.walletLedger.groupBy({
            by: ['region'],
            where: { region: { not: null } },
            _sum: { amount: true },
        });
        const results = [];
        for (const region of regions) {
            const code = region.region;
            const earnAgg = await this.prisma.walletLedger.aggregate({
                where: { type: 'EARN', region: code },
                _sum: { amount: true },
            });
            const eligAgg = await this.prisma.walletLedger.aggregate({
                where: { type: 'ELIGIBLE_MOVE', region: code },
                _sum: { amount: true },
            });
            const payoutAgg = await this.prisma.walletLedger.aggregate({
                where: { type: 'PAYOUT', region: code },
                _sum: { amount: true },
            });
            const revenue = Number(earnAgg?._sum?.amount ?? 0);
            const eligible = Number(eligAgg?._sum?.amount ?? 0);
            const paid = Number(payoutAgg?._sum?.amount ?? 0);
            const liability = eligible - paid;
            const rewardPool = revenue * 0.20;
            const pricing = await this.prisma.countryPricing.findUnique({
                where: { countryCode: code },
            });
            results.push({
                region: code,
                countryName: pricing?.countryName || code,
                currency: pricing?.currency || 'USD',
                revenue,
                rewardPool,
                liability,
                liabilityRatio: revenue > 0 ? liability / revenue : 0,
                alert: liability > rewardPool ? 'EXCEEDS_CAP' : 'SAFE',
            });
        }
        return results;
    }
};
exports.PricingService = PricingService;
exports.PricingService = PricingService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], PricingService);
//# sourceMappingURL=pricing.service.js.map