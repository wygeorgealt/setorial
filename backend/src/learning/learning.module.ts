import { Module } from '@nestjs/common';
import { LearningService } from './learning.service';
import { LearningController } from './learning.controller';
import { PrismaService } from '../prisma.service';

@Module({
  providers: [LearningService, PrismaService],
  controllers: [LearningController],
  exports: [LearningService],
})
export class LearningModule { }
