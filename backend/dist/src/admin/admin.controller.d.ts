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
        rewardPoolSize: number;
        totalLiability: any;
        liabilityRatio: number;
        flaggedUsersCount: any;
        alert: string;
    }>;
    freezeUserWallet(userId: string, reason: string): Promise<{
        success: boolean;
        message: string;
    }>;
}
