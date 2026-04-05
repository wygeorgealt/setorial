import { WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { PayoutsService } from './payouts.service';
export declare class PayoutsProcessor extends WorkerHost {
    private readonly payoutsService;
    private readonly logger;
    constructor(payoutsService: PayoutsService);
    process(job: Job<any, any, string>): Promise<any>;
}
