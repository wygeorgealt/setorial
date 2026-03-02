import { Controller, Get, Param, UseGuards, Request } from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { GamificationService } from '../gamification/gamification.service';

@Controller('users')
export class UsersController {
    constructor(
        private usersService: UsersService,
        private gamificationService: GamificationService
    ) { }

    @UseGuards(JwtAuthGuard)
    @Get('me')
    async getMe(@Request() req: any) {
        const userId = req.user.userId;
        const user = await this.usersService.findById(userId);
        const points = await this.usersService.getPoints(userId);
        const streak = await this.gamificationService.getStreak(userId);

        if (user) {
            delete (user as any).password;
        }

        return {
            ...user,
            points,
            streak,
        };
    }

    @Get(':id')
    async getUser(@Param('id') id: string) {
        const user = await this.usersService.findById(id);
        if (user) {
            delete (user as any).password;
        }
        return user;
    }
}
