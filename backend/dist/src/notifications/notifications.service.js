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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var NotificationsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationsService = void 0;
const common_1 = require("@nestjs/common");
const bullmq_1 = require("@nestjs/bullmq");
const bullmq_2 = require("bullmq");
const prisma_service_1 = require("../prisma.service");
let NotificationsService = NotificationsService_1 = class NotificationsService {
    prisma;
    notificationsQueue;
    logger = new common_1.Logger(NotificationsService_1.name);
    constructor(prisma, notificationsQueue) {
        this.prisma = prisma;
        this.notificationsQueue = notificationsQueue;
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
        await this.notificationsQueue.add('push', {
            tokens: [user.expoPushToken],
            title,
            body,
            payload: data,
        });
    }
    async sendPushToMany(userIds, title, body, data = {}) {
        const users = await this.prisma.user.findMany({
            where: { id: { in: userIds }, expoPushToken: { not: null } },
            select: { expoPushToken: true },
        });
        const tokens = users.map(u => u.expoPushToken).filter(t => !!t);
        if (tokens.length === 0)
            return;
        await this.notificationsQueue.add('push', {
            tokens,
            title,
            body,
            payload: data,
        });
    }
    async sendToTokens(tokens, title, body, data = {}) {
    }
    generateSetorialHtml(title, messageHtml) {
        return `
        <!DOCTYPE html>
        <html>
        <body style="margin: 0; padding: 0; font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif; background-color: #f4f4f5; text-align: center;">
            <div style="background-color: #f4f4f5; padding: 40px 20px;">
                <div style="max-w-2xl; margin: 0 auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05); text-align: left;">
                    <div style="background-color: #18181b; padding: 32px 40px; text-align: center;">
                        <h1 style="color: #ffffff; font-size: 24px; font-weight: 800; margin: 0; letter-spacing: -0.5px;">SETORIAL</h1>
                    </div>
                    <div style="padding: 40px;">
                        <h2 style="color: #18181b; font-size: 20px; font-weight: 700; margin-top: 0; margin-bottom: 24px;">${title}</h2>
                        <div style="color: #52525b; font-size: 16px; line-height: 1.6;">
                            ${messageHtml}
                        </div>
                    </div>
                    <div style="background-color: #fafafa; padding: 24px 40px; border-top: 1px solid #f4f4f5; text-align: center;">
                        <p style="color: #a1a1aa; font-size: 12px; margin: 0;">© ${new Date().getFullYear()} Setorial Platform. All rights reserved.</p>
                    </div>
                </div>
            </div>
        </body>
        </html>
        `;
    }
    async sendOtpEmail(email, otpCode, name = 'Student') {
        const title = 'Verify your Setorial Account';
        const content = `
            <p>Hi ${name},</p>
            <p>Welcome to Setorial! To complete your registration and unlock your account, please enter the following 6-digit verification code in the app:</p>
            <div style="background-color: #f4f4f5; border-radius: 8px; padding: 20px; text-align: center; margin: 32px 0;">
                <span style="font-size: 32px; font-weight: 800; color: #18181b; letter-spacing: 8px;">${otpCode}</span>
            </div>
            <p>This code will expire in 15 minutes.</p>
        `;
        try {
            await this.notificationsQueue.add('email', {
                to: email,
                subject: 'Setorial Verification Code',
                html: this.generateSetorialHtml(title, content)
            });
        }
        catch (err) {
            this.logger.error(`Failed to queue OTP to ${email}: ${err.message}`);
        }
    }
    async sendPasswordResetEmail(email, otpCode, name = 'Student') {
        const title = 'Reset Your Password';
        const content = `
            <p>Hi ${name},</p>
            <p>We received a request to reset your Setorial password. Enter the following 6-digit code in the app to proceed:</p>
            <div style="background-color: #f4f4f5; border-radius: 8px; padding: 20px; text-align: center; margin: 32px 0;">
                <span style="font-size: 32px; font-weight: 800; color: #18181b; letter-spacing: 8px;">${otpCode}</span>
            </div>
            <p>If you didn't request this, you can safely ignore this email.</p>
            <p>This code will expire in 15 minutes.</p>
        `;
        try {
            await this.notificationsQueue.add('email', {
                to: email,
                subject: 'Setorial Password Reset',
                html: this.generateSetorialHtml(title, content)
            });
        }
        catch (err) {
            this.logger.error(`Exception queuing Password Reset to ${email}: ${err.message}`);
        }
    }
    async sendWelcomeEmail(email, name) {
        const title = 'Welcome to Setorial! 🎉';
        const content = `
            <p>Hey ${name},</p>
            <p>We are thrilled to have you onboard! Setorial is designed to make your learning journey profitable and engaging.</p>
            <p><b>What's next?</b></p>
            <ul>
                <li style="margin-bottom: 8px;">Navigate to your Learning Path to start earning Points.</li>
                <li style="margin-bottom: 8px;">Subscribe to Silver or Gold to unlock Monetization.</li>
                <li style="margin-bottom: 8px;">Verify your KYC to accept payouts globally.</li>
            </ul>
            <p>Happy studying!</p>
        `;
        try {
            await this.notificationsQueue.add('email', {
                to: email,
                subject: 'Welcome to Setorial!',
                html: this.generateSetorialHtml(title, content)
            });
        }
        catch (err) {
            this.logger.error(`Failed to queue Welcome email to ${email}: ${err.message}`);
        }
    }
    async sendPayoutConfirmation(email, amount, month) {
        const title = 'Your Payout is on the way! 💸';
        const content = `
            <p>Awesome news!</p>
            <p>Your learning rewards for <b>${month}</b> have been processed. We've initiated a transfer of <b>₦${amount.toLocaleString()}</b> to your configured bank account.</p>
            <p>Keep studying and acing those mock exams to increase your rank next month!</p>
        `;
        try {
            await this.notificationsQueue.add('email', {
                to: email,
                subject: 'Setorial Reward Payout Processing',
                html: this.generateSetorialHtml(title, content)
            });
        }
        catch (err) {
            this.logger.error(`Failed to queue Payout Email to ${email}`);
        }
    }
    async sendBroadcastEmail(emails, subject, htmlMessage) {
        const title = subject;
        const html = this.generateSetorialHtml(title, htmlMessage);
        try {
            const chunks = [];
            for (let i = 0; i < emails.length; i += 50) {
                chunks.push(emails.slice(i, i + 50));
            }
            for (const chunk of chunks) {
                const batchPayload = chunk.map(email => ({
                    from: process.env.EMAIL_FROM_ADDRESS || 'Setorial <onboarding@resend.dev>',
                    to: email,
                    subject,
                    html
                }));
                await this.notificationsQueue.add('email-batch', { batch: batchPayload });
            }
        }
        catch (err) {
            this.logger.error(`Broadcast queuing failed: ${err.message}`);
        }
    }
    async sendSupportEmail(userEmail, message) {
        const title = 'New Support Request from App';
        const content = `
            <p><b>From:</b> ${userEmail}</p>
            <hr />
            <p>${message.replace(/\n/g, '<br/>')}</p>
        `;
        try {
            await this.notificationsQueue.add('email', {
                to: 'setorialapp@gmail.com',
                replyTo: userEmail,
                subject: `Support Request [${userEmail}]`,
                html: this.generateSetorialHtml(title, content)
            });
        }
        catch (err) {
            this.logger.error(`Support ticket queuing failed: ${err.message}`);
        }
    }
};
exports.NotificationsService = NotificationsService;
exports.NotificationsService = NotificationsService = NotificationsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(1, (0, bullmq_1.InjectQueue)('notifications')),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        bullmq_2.Queue])
], NotificationsService);
//# sourceMappingURL=notifications.service.js.map