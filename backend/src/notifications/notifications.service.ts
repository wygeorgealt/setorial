import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { lastValueFrom } from 'rxjs';
import { PrismaService } from '../prisma.service';

@Injectable()
export class NotificationsService {
    private readonly logger = new Logger(NotificationsService.name);

    constructor(
        private httpService: HttpService,
        private prisma: PrismaService,
    ) { }

    /**
     * Sends a push notification to a specific user.
     */
    async sendPush(userId: string, title: string, body: string, data: Record<string, any> = {}) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            select: { expoPushToken: true },
        });

        if (!user?.expoPushToken) {
            this.logger.debug(`User ${userId} has no push token, skipping.`);
            return;
        }

        return this.sendToTokens([user.expoPushToken], title, body, data);
    }

    /**
     * Sends a push notification to multiple users.
     */
    async sendPushToMany(userIds: string[], title: string, body: string, data: Record<string, any> = {}) {
        const users = await this.prisma.user.findMany({
            where: { id: { in: userIds }, expoPushToken: { not: null } },
            select: { expoPushToken: true },
        });

        const tokens = users.map(u => u.expoPushToken!).filter(t => !!t);
        if (tokens.length === 0) return;

        return this.sendToTokens(tokens, title, body, data);
    }

    /**
     * Internal helper to call Expo Push API.
     */
    private async sendToTokens(tokens: string[], title: string, body: string, data: Record<string, any> = {}) {
        const messages = tokens.map(token => ({
            to: token,
            sound: 'default',
            title,
            body,
            data,
        }));

        try {
            const response = await lastValueFrom(
                this.httpService.post('https://exp.host/--/api/v2/push/send', messages, {
                    headers: {
                        'Accept': 'application/json',
                        'Accept-encoding': 'gzip, deflate',
                        'Content-Type': 'application/json',
                    },
                })
            );

            this.logger.log(`Push notifications sent to ${tokens.length} tokens.`);
            return response.data;
        } catch (error) {
            this.logger.error('Failed to send push notifications via Expo', error.response?.data || error.message);
        }
    }
}
