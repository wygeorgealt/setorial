import { Module } from '@nestjs/common';
import { LearningService } from './learning.service';
import { LearningController } from './learning.controller';
import { PrismaService } from '../prisma.service';
import { GamificationModule } from '../gamification/gamification.module';
import { StoreModule } from '../store/store.module';
import { AiContentService } from './ai-content.service';
import { UploadModule } from '../upload/upload.module';

@Module({
  imports: [GamificationModule, StoreModule, UploadModule],
  providers: [LearningService, PrismaService, AiContentService],
  controllers: [LearningController],
  exports: [LearningService, AiContentService],
})
export class LearningModule { }
