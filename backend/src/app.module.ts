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
import { PricingModule } from './pricing/pricing.module';
import { MockExamsModule } from './mock-exams/mock-exams.module';
import { StoreModule } from './store/store.module';
import { NotificationsModule } from './notifications/notifications.module';
import { ScheduleModule } from '@nestjs/schedule';
import { BullModule } from '@nestjs/bullmq';

@Module({
  imports: [
    BullModule.forRootAsync({
      useFactory: () => {
        const redisUrl = process.env.REDIS_PRIVATE_URL || process.env.REDIS_URL;
        if (redisUrl) {
          const url = new URL(redisUrl);
          return {
            connection: {
              host: url.hostname,
              port: parseInt(url.port || '6379'),
              username: url.username || undefined,
              password: url.password || undefined,
              tls: redisUrl.startsWith('rediss://') ? {} : undefined,
            }
          };
        }
        return {
          connection: { host: 'localhost', port: 6379 }
        };
      }
    }),
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
    PricingModule,
    MockExamsModule,
    StoreModule,
    NotificationsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }

