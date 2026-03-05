import { PrismaService } from '../prisma.service';
export declare class PricingService {
    private prisma;
    constructor(prisma: PrismaService);
    getPricingForCountry(countryCode: string): Promise<any>;
    getAllActivePricing(): Promise<any>;
    getAllPricing(): Promise<any>;
    createPricing(data: {
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
    }): Promise<any>;
    updatePricing(id: string, data: any): Promise<any>;
    deletePricing(id: string): Promise<any>;
    getRegionalStats(): Promise<any[]>;
}
