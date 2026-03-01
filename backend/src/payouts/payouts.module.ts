import { Module } from '@nestjs/common';
import { PayoutsService } from './payouts.service';
import { PrismaModule } from '../prisma.module';
// BullMQ temporarily disabled: requires Redis >= 5.0
// import { PayoutsProcessor } from './payouts.processor';
// import { AutomatedPayoutService } from './automated-payout.service';
// import { BullModule } from '@nestjs/bullmq';

@Module({
  imports: [PrismaModule],
  providers: [PayoutsService],
  exports: [PayoutsService],
})
export class PayoutsModule { }
