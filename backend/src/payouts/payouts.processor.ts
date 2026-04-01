import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { Logger } from '@nestjs/common';
import { PayoutsService } from './payouts.service';

@Processor('payouts')
export class PayoutsProcessor extends WorkerHost {
    private readonly logger = new Logger(PayoutsProcessor.name);

    constructor(private readonly payoutsService: PayoutsService) {
        super();
    }

    async process(job: Job<any, any, string>): Promise<any> {
        this.logger.log(`👷 Processing job ${job.id} of type ${job.name}...`);

        switch (job.name) {
            case 'process-payout':
                const month = job.data.month;
                this.logger.log(`Running payout generation for month: ${month}`);
                const result = await this.payoutsService.processPayout(month);
                return result;
                
            default:
                this.logger.warn(`Unknown job name: ${job.name}`);
        }
    }
}
