import { Module } from '@nestjs/common';
import { StoreService } from './store.service';
import { StoreController } from './store.controller';
import { PrismaService } from '../prisma.service';
import { WalletModule } from '../wallet/wallet.module';
import { GamificationModule } from '../gamification/gamification.module';

@Module({
    imports: [WalletModule, GamificationModule],
    providers: [StoreService, PrismaService],
    controllers: [StoreController],
    exports: [StoreService],
})
export class StoreModule { }
