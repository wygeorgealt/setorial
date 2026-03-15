import { PrismaService } from '../prisma.service';
export declare class SubscriptionsService {
    private prisma;
    constructor(prisma: PrismaService);
    initializeTransaction(userId: string, tier: string, billingCycle?: 'MONTHLY' | 'ANNUAL'): Promise<{
        authorization_url: any;
        access_code: any;
        reference: any;
    }>;
    verifyTransaction(reference: string): Promise<{
        status: string;
        message: string;
        tier?: undefined;
    } | {
        status: string;
        tier: any;
        message?: undefined;
    }>;
    handlePaystackWebhook(signature: string, payload: any): Promise<{
        status: string;
    }>;
    private _activateSubscription;
}
