import { HttpService } from '@nestjs/axios';
import { PrismaService } from '../prisma.service';
export declare class NotificationsService {
    private httpService;
    private prisma;
    private readonly logger;
    constructor(httpService: HttpService, prisma: PrismaService);
    sendPush(userId: string, title: string, body: string, data?: Record<string, any>): Promise<any>;
    sendPushToMany(userIds: string[], title: string, body: string, data?: Record<string, any>): Promise<any>;
    private sendToTokens;
}
