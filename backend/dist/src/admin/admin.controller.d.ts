import { PayoutsService } from '../payouts/payouts.service';
import { PrismaService } from '../prisma.service';
export declare class AdminController {
    private payoutsService;
    private prisma;
    constructor(payoutsService: PayoutsService, prisma: PrismaService);
    simulatePayout(month: string, revenue: number): Promise<{
        month: string;
        globalEstimatedRevenue: number;
        regions: {
            region: any;
            regionalRevenue: number;
            rewardPool: number;
            totalEligibleBalance: any;
            distributionRatio: number;
            safeToExecute: boolean;
            simulatedPayoutsCount: any;
            simulatedPayouts: any;
        }[];
    }>;
    getDashboardStats(): Promise<{
        currentMonthRevenue: number;
        rewardPoolCap: number;
        totalLiability: number;
        liabilityRatio: number;
        projectedPayoutExposure: number;
        distributionRatio: number;
        dynamicConversionRate: number;
        riskLevel: string;
        sustainabilityTier: string;
        activeMonetizedUsers: number;
        fraudFlags: {
            suspiciousHighEarners: number;
            cheatedMockAttempts: number;
            flaggedUserIds: string[];
        };
        pendingKycCount: number;
        approvedKycCount: number;
        totalUsers: number;
        latestPayoutBatch: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            region: string | null;
            status: import("@prisma/client").$Enums.PayoutStatus;
            month: string;
            totalLiability: import("@prisma/client-runtime-utils").Decimal;
            totalPaid: import("@prisma/client-runtime-utils").Decimal;
        } | null;
    }>;
    getPendingKyc(): Promise<{
        id: string;
        name: string | null;
        createdAt: Date;
        email: string;
        tier: import("@prisma/client").$Enums.Tier;
        payoutMethod: import("@prisma/client").$Enums.PayoutMethod | null;
        payoutAccount: import("@prisma/client/runtime/client").JsonValue;
    }[]>;
    approveKyc(userId: string): Promise<{
        id: string;
        name: string | null;
        email: string;
        isVerified: boolean;
        kycStatus: import("@prisma/client").$Enums.KycStatus;
    }>;
    rejectKyc(userId: string, reason: string): Promise<{
        success: boolean;
        userId: string;
        reason: string;
    }>;
    getAllUsers(tier?: string, kycStatus?: string): Promise<{
        id: string;
        name: string | null;
        createdAt: Date;
        email: string;
        tier: import("@prisma/client").$Enums.Tier;
        isVerified: boolean;
        kycStatus: import("@prisma/client").$Enums.KycStatus;
    }[]>;
    freezeUserWallet(userId: string, reason: string): Promise<{
        success: boolean;
        message: string;
    }>;
    getPayoutBatches(): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        region: string | null;
        status: import("@prisma/client").$Enums.PayoutStatus;
        month: string;
        totalLiability: import("@prisma/client-runtime-utils").Decimal;
        totalPaid: import("@prisma/client-runtime-utils").Decimal;
    }[]>;
    triggerPayout(month: string, revenue: number): Promise<{
        message: string;
        month: string;
        totalPaid: number;
        totalGlobalPaid?: undefined;
        regionsProcessed?: undefined;
        batches?: undefined;
    } | {
        month: string;
        totalGlobalPaid: number;
        regionsProcessed: number;
        batches: {
            region: any;
            batchId: any;
            rewardPool: number;
            totalEligibleBalance: any;
            distributionRatio: number;
            totalPaid: number;
            usersPaid: any;
        }[];
        message?: undefined;
        totalPaid?: undefined;
    }>;
}
