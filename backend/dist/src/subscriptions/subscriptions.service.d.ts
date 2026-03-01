import { PrismaService } from '../prisma.service';
export declare class SubscriptionsService {
    private prisma;
    constructor(prisma: PrismaService);
    handlePaystackWebhook(signature: string, payload: any): Promise<{
        status: string;
    }>;
}
