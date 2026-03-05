import { Module } from '@nestjs/common';
import { LearningService } from './learning.service';
import { LearningController } from './learning.controller';
import { PrismaService } from '../prisma.service';
import { GamificationModule } from '../gamification/gamification.module';
import { StoreModule } from '../store/store.module';

@Module({
  imports: [GamificationModule, StoreModule],
  providers: [LearningService, PrismaService],
  controllers: [LearningController],
  exports: [LearningService],
})
export class LearningModule { }
