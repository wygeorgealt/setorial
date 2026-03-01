import { Module } from '@nestjs/common';
import { AdminController } from './admin.controller';
import { PayoutsModule } from '../payouts/payouts.module';
import { PrismaModule } from '../prisma.module';

@Module({
  imports: [PayoutsModule, PrismaModule],
  controllers: [AdminController],
})
export class AdminModule { }
