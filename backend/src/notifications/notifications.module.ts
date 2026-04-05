import { Module, Global } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { BullModule } from '@nestjs/bullmq';
import { NotificationsService } from './notifications.service';
import { NotificationsProcessor } from './notifications.processor';
import { PrismaService } from '../prisma.service';

@Global()
@Module({
    imports: [
        HttpModule,
        BullModule.registerQueue({
            name: 'notifications',
        }),
    ],
    providers: [NotificationsService, NotificationsProcessor, PrismaService],
    exports: [NotificationsService],
})
export class NotificationsModule { }
