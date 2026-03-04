import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { HealthModule } from './health/health.module';
import { LearningModule } from './learning/learning.module';
import { WalletModule } from './wallet/wallet.module';
import { SubscriptionsModule } from './subscriptions/subscriptions.module';
import { EligibilityModule } from './eligibility/eligibility.module';
import { AdminModule } from './admin/admin.module';
import { PayoutsModule } from './payouts/payouts.module';
import { ScheduleModule } from '@nestjs/schedule';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    AuthModule,
    UsersModule,
    HealthModule,
    LearningModule,
    WalletModule,
    SubscriptionsModule,
    EligibilityModule,
    AdminModule,
    PayoutsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }

