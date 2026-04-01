import { Module } from '@nestjs/common';
import { PayoutsService } from './payouts.service';
import { PrismaModule } from '../prisma.module';
import { BullModule } from '@nestjs/bullmq';
import { PayoutsProcessor } from './payouts.processor';

@Module({
  imports: [
    PrismaModule,
    BullModule.registerQueue({ name: 'payouts' })
  ],
  providers: [PayoutsService, PayoutsProcessor],
  exports: [PayoutsService],
})
export class PayoutsModule { }
