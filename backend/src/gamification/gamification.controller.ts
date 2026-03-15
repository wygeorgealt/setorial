import { Controller, Get, UseGuards, Query } from '@nestjs/common';
import { GamificationService } from './gamification.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('gamification')
@UseGuards(JwtAuthGuard)
export class GamificationController {
    constructor(private readonly gamificationService: GamificationService) { }

    @Get('leaderboard')
    async getLeaderboard(
        @Query('limit') limit: string,
        @Query('subjectId') subjectId?: string
    ) {
        return this.gamificationService.getLeaderboard(parseInt(limit, 10) || 10, subjectId);
    }
}
