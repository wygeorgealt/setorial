import { WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { PrismaService } from '../prisma.service';
import { PayoutsService } from './payouts.service';
export declare class PayoutsProcessor extends WorkerHost {
    private prisma;
    private payoutsService;
    private readonly logger;
    constructor(prisma: PrismaService, payoutsService: PayoutsService);
    process(job: Job<any, any, string>): Promise<any>;
}
