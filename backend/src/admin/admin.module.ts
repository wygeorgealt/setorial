import { Module } from '@nestjs/common';
import { AdminController } from './admin.controller';
import { PayoutsModule } from '../payouts/payouts.module';
import { PrismaModule } from '../prisma.module';
import { MockExamsModule } from '../mock-exams/mock-exams.module';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [PayoutsModule, PrismaModule, MockExamsModule, NotificationsModule],
  controllers: [AdminController],
})
export class AdminModule { }
