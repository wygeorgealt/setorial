import { Controller, Get, Patch, Post, Param, Body, Query, UseGuards, Request, BadRequestException, UseInterceptors, UploadedFile } from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { GamificationService } from '../gamification/gamification.service';
import { NotificationsService } from '../notifications/notifications.service';
import { PayoutMethod } from '@prisma/client';

import { FileInterceptor } from '@nestjs/platform-express';
import { UploadService } from '../upload/upload.service';

@Controller('users')
export class UsersController {
    constructor(
        private usersService: UsersService,
        private gamificationService: GamificationService,
        private notificationsService: NotificationsService,
        private uploadService: UploadService,
    ) { }

    @UseGuards(JwtAuthGuard)
    @Get('me')
    async getMe(@Request() req: any) {
        const userId = req.user.userId;
        const user = await this.usersService.findById(userId);
        const points = await this.usersService.getPoints(userId);
        const streak = await this.gamificationService.getStreak(userId);
        const badges = await this.gamificationService.getUserBadges(userId);
        const activeSub = await this.usersService.getActiveSubscription(userId);

        let detectedCountry = null;
        if (user && !user.billingCountry) {
            try {
                const xForwardedFor = req.headers['x-forwarded-for'];
                const ip = typeof xForwardedFor === 'string' ? xForwardedFor.split(',')[0] : req.connection.remoteAddress;

                if (ip && ip !== '::1' && ip !== '127.0.0.1') {
                    const geoRes = await fetch(`http://ip-api.com/json/${ip}`);
                    const geoData = await geoRes.json();
                    if (geoData.status === 'success') {
                        detectedCountry = geoData.countryCode;
                    }
                }
            } catch (e) {
                console.warn(`IP Geolocation failed: ${e.message}`);
            }
        }

        if (user) {
            delete (user as any).password;
        }

        return {
            ...user,
            points,
            streak,
            badges,
            activeSub,
            detectedCountry
        };
    }

    @UseGuards(JwtAuthGuard)
    @Patch('me')
    @UseInterceptors(FileInterceptor('avatar'))
    async updateMe(
        @Request() req: any, 
        @Body() body: { name?: string; billingCountry?: string; expoPushToken?: string },
        @UploadedFile() file?: Express.Multer.File
    ) {
        let avatarUrl: string | undefined;
        
        if (file) {
            avatarUrl = await this.uploadService.uploadFile(file);
        }

        const user = await this.usersService.updateProfile(req.user.userId, {
            ...body,
            ...(avatarUrl ? { avatarUrl } : {})
        });
        
        delete (user as any).password;
        return user;
    }

    @UseGuards(JwtAuthGuard)
    @Get('me/progress')
    async getProgress(@Request() req: any) {
        return this.usersService.getLearningProgress(req.user.userId);
    }

    @UseGuards(JwtAuthGuard)
    @Post('me/support')
    async sendSupport(@Request() req: any, @Body('message') message: string) {
        const user = await this.usersService.findById(req.user.userId);
        if (!user) throw new BadRequestException('User not found');
        return this.notificationsService.sendSupportEmail(user.email, message);
    }

    @UseGuards(JwtAuthGuard)
    @Post('me/kyc')
    async submitKyc(
        @Request() req: any,
        @Body() body: { payoutMethod: PayoutMethod; payoutAccount: Record<string, any> }
    ) {
        return this.usersService.submitKyc(req.user.userId, body);
    }

    @UseGuards(JwtAuthGuard)
    @Get('me/kyc/banks')
    async getBanks(@Query('country') country?: string) {
        return this.usersService.getBanks(country || 'nigeria');
    }

    @UseGuards(JwtAuthGuard)
    @Get('me/kyc/resolve')
    async resolveAccount(
        @Query('accountNumber') accountNumber: string,
        @Query('bankCode') bankCode: string
    ) {
        return this.usersService.resolveAccount(accountNumber, bankCode);
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
