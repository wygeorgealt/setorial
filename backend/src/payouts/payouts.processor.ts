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

        let totalProcessed = 0;

        for (const regionData of (simulation as any).regions) {
            if (!regionData.safeToExecute) {
                this.logger.error(`Payout simulation for region ${regionData.region} indicated unsafe liability ratio. Skipping.`);
                continue;
            }

            for (const payout of regionData.simulatedPayouts) {
                if (payout.simulatedPayout <= 0) continue;

                this.logger.log(`Paying out ${payout.simulatedPayout} to user ${payout.userId} (${regionData.region})`);

                await (this.prisma as any).$transaction(async (tx: any) => {
                    await tx.walletLedger.create({
                        data: {
                            userId: payout.userId,
                            type: 'PAYOUT' as any,
                            amount: -payout.simulatedPayout,
                            reference: `PAYOUT_${month}_${job.id}`,
                            region: regionData.region
                        },
                    });
                });

                // Trigger real-time Paystack transfer
                try {
                    await this.payoutsService.disburseFunds(payout.userId, payout.simulatedPayout, regionData.region);
                } catch (transferError) {
                    this.logger.error(`❌ Paystack transfer failed for user ${payout.userId}: ${transferError.message}`);
                }

                totalProcessed++;
            }
        }

        this.logger.log('Payout batch completed.');
        return { status: 'completed', count: totalProcessed };
    }
}
