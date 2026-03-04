import { PrismaService } from '../prisma.service';
export declare class PayoutsService {
    private prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    simulatePayout(month: string, estimatedRevenue: number): Promise<{
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
    processPayout(month: string, estimatedRevenue: number): Promise<{
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
    handleMonthlyPayout(): Promise<void>;
}
