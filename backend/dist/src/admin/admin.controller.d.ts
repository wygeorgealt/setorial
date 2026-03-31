import { PayoutsService } from '../payouts/payouts.service';
import { PrismaService } from '../prisma.service';
import { MockExamsService } from '../mock-exams/mock-exams.service';
import { NotificationsService } from '../notifications/notifications.service';
export declare class AdminController {
    private payoutsService;
    private prisma;
    private mockExamsService;
    private notificationsService;
    constructor(payoutsService: PayoutsService, prisma: PrismaService, mockExamsService: MockExamsService, notificationsService: NotificationsService);
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
            exchangeRate: number | null;
            id: string;
            createdAt: Date;
            status: import("@prisma/client").$Enums.PayoutStatus;
            month: string;
            region: string | null;
            totalLiability: import("@prisma/client-runtime-utils").Decimal;
            totalPaid: import("@prisma/client-runtime-utils").Decimal;
            updatedAt: Date;
        } | null;
    }>;
    getPendingKyc(): Promise<{
        id: string;
        createdAt: Date;
        name: string | null;
        email: string;
        tier: import("@prisma/client").$Enums.Tier;
        payoutMethod: import("@prisma/client").$Enums.PayoutMethod | null;
        payoutAccount: import("@prisma/client/runtime/client").JsonValue;
    }[]>;
    approveKyc(userId: string): Promise<{
        isVerified: boolean;
        id: string;
        kycStatus: import("@prisma/client").$Enums.KycStatus;
        name: string | null;
        email: string;
    }>;
    rejectKyc(userId: string, reason: string): Promise<{
        success: boolean;
        userId: string;
        reason: string;
    }>;
    getAllUsers(tier?: string, kycStatus?: string): Promise<{
        isVerified: boolean;
        id: string;
        createdAt: Date;
        kycStatus: import("@prisma/client").$Enums.KycStatus;
        name: string | null;
        email: string;
        tier: import("@prisma/client").$Enums.Tier;
    }[]>;
    freezeUser(userId: string, isFrozen: boolean): Promise<{
        id: string;
        email: string;
        isFrozen: boolean;
    }>;
    flagUser(userId: string, isFlagged: boolean): Promise<{
        id: string;
        email: string;
        isFlagged: boolean;
    }>;
    getConfigs(): Promise<{
        id: string;
        updatedAt: Date;
        key: string;
        value: string;
        description: string | null;
    }[]>;
    updateConfig(key: string, value: string, description?: string): Promise<{
        id: string;
        updatedAt: Date;
        key: string;
        value: string;
        description: string | null;
    }>;
    getDiscounts(): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        code: string;
        discountPercent: number;
        maxUses: number | null;
        usedCount: number;
        expiryDate: Date | null;
        isActive: boolean;
    }[]>;
    createDiscount(data: {
        code: string;
        discountPercent: number;
        maxUses?: number;
        expiryDate?: string;
    }): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        code: string;
        discountPercent: number;
        maxUses: number | null;
        usedCount: number;
        expiryDate: Date | null;
        isActive: boolean;
    }>;
    toggleDiscount(id: string, isActive: boolean): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        code: string;
        discountPercent: number;
        maxUses: number | null;
        usedCount: number;
        expiryDate: Date | null;
        isActive: boolean;
    }>;
    getPayoutBatches(): Promise<{
        exchangeRate: number | null;
        id: string;
        createdAt: Date;
        status: import("@prisma/client").$Enums.PayoutStatus;
        month: string;
        region: string | null;
        totalLiability: import("@prisma/client-runtime-utils").Decimal;
        totalPaid: import("@prisma/client-runtime-utils").Decimal;
        updatedAt: Date;
    }[]>;
    triggerPayout(month: string): Promise<{
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
    simulatePayout(month: string, revenue?: string): Promise<{
        month: string;
        globalEstimatedRevenue: number | undefined;
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
    createMock(data: any): Promise<{
        questions: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            text: string;
            options: import("@prisma/client/runtime/client").JsonValue;
            correctOption: number;
            lessonId: string | null;
            mockExamId: string | null;
        }[];
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        description: string | null;
        isActive: boolean;
        title: string;
        durationMinutes: number;
        price: import("@prisma/client-runtime-utils").Decimal;
    }>;
    deleteMock(id: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        description: string | null;
        isActive: boolean;
        title: string;
        durationMinutes: number;
        price: import("@prisma/client-runtime-utils").Decimal;
    }>;
    sendNotification(data: {
        userId?: string;
        title: string;
        body: string;
        data?: any;
    }): Promise<any>;
}
