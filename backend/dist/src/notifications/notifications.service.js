"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var NotificationsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationsService = void 0;
const common_1 = require("@nestjs/common");
const axios_1 = require("@nestjs/axios");
const rxjs_1 = require("rxjs");
const prisma_service_1 = require("../prisma.service");
let NotificationsService = NotificationsService_1 = class NotificationsService {
    httpService;
    prisma;
    logger = new common_1.Logger(NotificationsService_1.name);
    constructor(httpService, prisma) {
        this.httpService = httpService;
        this.prisma = prisma;
    }
    async sendPush(userId, title, body, data = {}) {
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
    async sendPushToMany(userIds, title, body, data = {}) {
        const users = await this.prisma.user.findMany({
            where: { id: { in: userIds }, expoPushToken: { not: null } },
            select: { expoPushToken: true },
        });
        const tokens = users.map(u => u.expoPushToken).filter(t => !!t);
        if (tokens.length === 0)
            return;
        return this.sendToTokens(tokens, title, body, data);
    }
    async sendToTokens(tokens, title, body, data = {}) {
        const messages = tokens.map(token => ({
            to: token,
            sound: 'default',
            title,
            body,
            data,
        }));
        try {
            const response = await (0, rxjs_1.lastValueFrom)(this.httpService.post('https://exp.host/--/api/v2/push/send', messages, {
                headers: {
                    'Accept': 'application/json',
                    'Accept-encoding': 'gzip, deflate',
                    'Content-Type': 'application/json',
                },
            }));
            this.logger.log(`Push notifications sent to ${tokens.length} tokens.`);
            return response.data;
        }
        catch (error) {
            this.logger.error('Failed to send push notifications via Expo', error.response?.data || error.message);
        }
    }
};
exports.NotificationsService = NotificationsService;
exports.NotificationsService = NotificationsService = NotificationsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [axios_1.HttpService,
        prisma_service_1.PrismaService])
], NotificationsService);
//# sourceMappingURL=notifications.service.js.map