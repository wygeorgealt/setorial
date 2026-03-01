import { PrismaService } from '../prisma.service';
export declare class PayoutsService {
    private prisma;
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
}
