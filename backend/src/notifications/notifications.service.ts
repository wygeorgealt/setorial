import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { lastValueFrom } from 'rxjs';
import { PrismaService } from '../prisma.service';
import { Resend } from 'resend';

@Injectable()
export class NotificationsService {
    private readonly logger = new Logger(NotificationsService.name);
    private readonly resend: Resend;
    private readonly globalFrom = process.env.EMAIL_FROM_ADDRESS || 'Setorial <onboarding@resend.dev>';

    constructor(
        private httpService: HttpService,
        private prisma: PrismaService,
    ) {
        this.resend = new Resend(process.env.RESEND_API_KEY || 're_dummy');
    }

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

    // ─── EMAIL INTEGRATION (RESEND) ──────────────────────────────────────────

    /**
     * Standardized HTML Wrapper for Setorial emails.
     */
    private generateSetorialHtml(title: string, messageHtml: string) {
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

    async sendOtpEmail(email: string, otpCode: string, name: string = 'Student') {
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
            await this.resend.emails.send({
                from: this.globalFrom,
                to: email,
                subject: 'Setorial Verification Code',
                html: this.generateSetorialHtml(title, content)
            });
            this.logger.log(`OTP Email sent to ${email}`);
        } catch (err: any) {
            this.logger.error(`Failed to send OTP to ${email}: ${err.message}`);
        }
    }

    async sendWelcomeEmail(email: string, name: string) {
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
            await this.resend.emails.send({
                from: this.globalFrom,
                to: email,
                subject: 'Welcome to Setorial!',
                html: this.generateSetorialHtml(title, content)
            });
        } catch (err: any) {
            this.logger.error(`Failed to send Welcome email to ${email}: ${err.message}`);
        }
    }

    async sendPayoutConfirmation(email: string, amount: number, month: string) {
        const title = 'Your Payout is on the way! 💸';
        const content = `
            <p>Awesome news!</p>
            <p>Your learning rewards for <b>${month}</b> have been processed. We've initiated a transfer of <b>₦${amount.toLocaleString()}</b> to your configured bank account.</p>
            <p>Keep studying and acing those mock exams to increase your rank next month!</p>
        `;

        try {
            await this.resend.emails.send({
                from: this.globalFrom,
                to: email,
                subject: 'Setorial Reward Payout Processing',
                html: this.generateSetorialHtml(title, content)
            });
        } catch (err: any) {
            this.logger.error(`Failed to send Payout Email to ${email}`);
        }
    }

    async sendBroadcastEmail(emails: string[], subject: string, htmlMessage: string) {
        const title = subject;
        const html = this.generateSetorialHtml(title, htmlMessage);

        try {
            // Resend supports bulk up to 50 recipients per API call using batch.
            // For simplicity in testing, we'll map them. In prod, chunk into 50s.
            const chunks = [];
            for (let i = 0; i < emails.length; i += 50) {
                chunks.push(emails.slice(i, i + 50));
            }

            for (const chunk of chunks) {
                const batchPayload = chunk.map(email => ({
                    from: this.globalFrom,
                    to: email,
                    subject,
                    html
                }));
                await this.resend.batch.send(batchPayload as any);
            }
            this.logger.log(`Broadcast completed to ${emails.length} users.`);
        } catch (err: any) {
            this.logger.error(`Broadcast failed: ${err.message}`);
        }
    }

    async sendSupportEmail(userEmail: string, message: string) {
        const title = 'New Support Request from App';
        const content = `
            <p><b>From:</b> ${userEmail}</p>
            <hr />
            <p>${message.replace(/\n/g, '<br/>')}</p>
        `;

        try {
            await this.resend.emails.send({
                from: this.globalFrom,
                to: 'setorialapp@gmail.com',
                replyTo: userEmail,
                subject: `Support Request [${userEmail}]`,
                html: this.generateSetorialHtml(title, content)
            });
            this.logger.log(`Support ticket forwarded to setorialapp@gmail.com`);
        } catch (err: any) {
            this.logger.error(`Support ticket delivery failed: ${err.message}`);
        }
    }
}
