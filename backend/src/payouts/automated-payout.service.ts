import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';

@Injectable()
export class AutomatedPayoutService {
    private readonly logger = new Logger(AutomatedPayoutService.name);

    constructor(@InjectQueue('payouts') private payoutsQueue: Queue) { }

    // Run on the 28th of every month at midnight
    @Cron('0 0 28 * *')
    async triggerMonthlyPayout() {
        this.logger.log('Triggering automated monthly payout...');

        const month = new Date().toISOString().slice(0, 7); // YYYY-MM
        // In production, fetch actual revenue from Paystack or Database
        const estimatedRevenue = 1000000;

        await this.payoutsQueue.add('process-payouts', { month, estimatedRevenue }, {
            removeOnComplete: true,
            attempts: 3,
            backoff: { type: 'exponential', delay: 5000 },
        });
    }
}
