import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { Logger } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { PayoutsService } from './payouts.service';

@Processor('payouts')
export class PayoutsProcessor extends WorkerHost {
    private readonly logger = new Logger(PayoutsProcessor.name);

    constructor(
        private prisma: PrismaService,
        private payoutsService: PayoutsService,
    ) {
        super();
    }

    async process(job: Job<any, any, string>): Promise<any> {
        this.logger.log(`Processing payout batch job: ${job.id}`);

        const { month, estimatedRevenue } = job.data;

        // Simulate to get exact figures
        const simulation = await this.payoutsService.simulatePayout(month, estimatedRevenue);

        if (!simulation.safeToExecute) {
            this.logger.error('Payout simulation indicated unsafe liability ratio. Aborting.');
            return;
        }

        // Wrap the entire batch in a transaction or process individually
        for (const payout of simulation.simulatedPayouts) {
            if (payout.simulatedPayout <= 0) continue;

            this.logger.log(`Paying out ${payout.simulatedPayout} to user ${payout.userId}`);

            // Transaction
            await (this.prisma as any).$transaction(async (tx: any) => {
                // Here we would call Paystack API for Transfer
                // e.g. await this.paystack.transfer(amount, recipientCode);

                await tx.walletLedger.create({
                    data: {
                        userId: payout.userId,
                        type: 'PAYOUT' as any,
                        amount: -payout.simulatedPayout,
                        reference: `PAYOUT_${month}_${job.id}`,
                    },
                });
            });
        }

        this.logger.log('Payout batch completed.');
        return { status: 'completed', count: simulation.simulatedPayoutsCount };
    }
}
