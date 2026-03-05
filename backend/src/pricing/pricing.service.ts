import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Injectable()
export class PricingService {
    constructor(private prisma: PrismaService) { }

    // ─── Student-Facing ──────────────────────────────────────────────────────

    async getPricingForCountry(countryCode: string) {
        const pricing = await (this.prisma as any).countryPricing.findUnique({
            where: { countryCode: countryCode.toUpperCase() },
        });
        if (!pricing || !pricing.isActive) {
            // Fallback to US pricing
            const fallback = await (this.prisma as any).countryPricing.findUnique({
                where: { countryCode: 'US' },
            });
            return fallback || null;
        }
        return pricing;
    }

    async getAllActivePricing() {
        return (this.prisma as any).countryPricing.findMany({
            where: { isActive: true },
            orderBy: { countryName: 'asc' },
        });
    }

    // ─── Admin-Facing ────────────────────────────────────────────────────────

    async getAllPricing() {
        return (this.prisma as any).countryPricing.findMany({
            orderBy: { countryName: 'asc' },
        });
    }

    async createPricing(data: {
        countryCode: string;
        countryName: string;
        economicTier: string;
        multiplier: number;
        currency: string;
        bronzeMonthly: number;
        silverMonthly: number;
        goldMonthly: number;
        bronzeAnnual: number;
        silverAnnual: number;
        goldAnnual: number;
    }) {
        const exists = await (this.prisma as any).countryPricing.findUnique({
            where: { countryCode: data.countryCode.toUpperCase() },
        });
        if (exists) throw new BadRequestException(`Pricing for ${data.countryCode} already exists`);

        return (this.prisma as any).countryPricing.create({
            data: {
                ...data,
                countryCode: data.countryCode.toUpperCase(),
            },
        });
    }

    async updatePricing(id: string, data: any) {
        return (this.prisma as any).countryPricing.update({
            where: { id },
            data,
        });
    }

    async deletePricing(id: string) {
        return (this.prisma as any).countryPricing.delete({ where: { id } });
    }

    // ─── Regional Revenue Stats ──────────────────────────────────────────────

    async getRegionalStats() {
        // Get all distinct regions from wallet ledger
        const regions = await (this.prisma as any).walletLedger.groupBy({
            by: ['region'],
            where: { region: { not: null } },
            _sum: { amount: true },
        });

        const results: any[] = [];

        for (const region of regions) {
            const code = region.region!;

            // Revenue (EARN entries for this region)
            const earnAgg = await (this.prisma as any).walletLedger.aggregate({
                where: { type: 'EARN', region: code },
                _sum: { amount: true },
            });

            // Eligible balance (ELIGIBLE_MOVE for this region)
            const eligAgg = await (this.prisma as any).walletLedger.aggregate({
                where: { type: 'ELIGIBLE_MOVE', region: code },
                _sum: { amount: true },
            });

            // Payouts for this region
            const payoutAgg = await (this.prisma as any).walletLedger.aggregate({
                where: { type: 'PAYOUT', region: code },
                _sum: { amount: true },
            });

            const revenue = Number(earnAgg?._sum?.amount ?? 0);
            const eligible = Number(eligAgg?._sum?.amount ?? 0);
            const paid = Number(payoutAgg?._sum?.amount ?? 0);
            const liability = eligible - paid;
            const rewardPool = revenue * 0.20;

            // Get country name from pricing table
            const pricing = await (this.prisma as any).countryPricing.findUnique({
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
}
