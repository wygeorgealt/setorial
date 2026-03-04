import { PayoutsService } from '../payouts/payouts.service';
import { PrismaService } from '../prisma.service';
export declare class AdminController {
    private payoutsService;
    private prisma;
    constructor(payoutsService: PayoutsService, prisma: PrismaService);
    simulatePayout(month: string, revenue: number): Promise<{
        month: string;
        estimatedRevenue: number;
        rewardPool: number;
        totalEligibleBalance: number;
        distributionRatio: number;
        safeToExecute: boolean;
        simulatedPayoutsCount: number;
        simulatedPayouts: {
            userId: string;
            eligibleBalance: number;
            simulatedPayout: number;
        }[];
    }>;
    getDashboardStats(): Promise<{
        currentMonthRevenue: number;
        rewardPoolCap: number;
        totalLiability: number;
        liabilityRatio: number;
        alert: string;
        pendingKycCount: number;
        approvedKycCount: number;
        totalUsers: number;
        latestPayoutBatch: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            month: string;
            totalLiability: import("@prisma/client-runtime-utils").Decimal;
            totalPaid: import("@prisma/client-runtime-utils").Decimal;
            status: import("@prisma/client").$Enums.PayoutStatus;
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
        month: string;
        totalLiability: import("@prisma/client-runtime-utils").Decimal;
        totalPaid: import("@prisma/client-runtime-utils").Decimal;
        status: import("@prisma/client").$Enums.PayoutStatus;
    }[]>;
    triggerPayout(month: string, revenue: number): Promise<{
        message: string;
        month: string;
        totalPaid: number;
        batchId?: undefined;
        rewardPool?: undefined;
        totalEligibleBalance?: undefined;
        distributionRatio?: undefined;
        usersPaid?: undefined;
    } | {
        batchId: any;
        month: string;
        rewardPool: number;
        totalEligibleBalance: number;
        distributionRatio: number;
        totalPaid: number;
        usersPaid: number;
        message?: undefined;
    }>;
}
