import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { PrismaService } from '../prisma.service';
import { GamificationModule } from '../gamification/gamification.module';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [GamificationModule, HttpModule],
  providers: [UsersService, PrismaService],
  controllers: [UsersController],
  exports: [UsersService],
})
export class UsersModule { }
