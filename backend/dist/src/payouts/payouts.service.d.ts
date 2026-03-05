import { PrismaService } from '../prisma.service';
export declare class PayoutsService {
    private prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    simulatePayout(month: string, globalEstimatedRevenue: number): Promise<{
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
    processPayout(month: string, globalEstimatedRevenue: number): Promise<{
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
    handleMonthlyPayout(): Promise<void>;
    disburseFunds(userId: string, amount: number, region: string): Promise<any>;
}
