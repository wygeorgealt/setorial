import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { lastValueFrom } from 'rxjs';
import { Resend } from 'resend';

@Processor('notifications')
@Injectable()
export class NotificationsProcessor extends WorkerHost {
    private readonly logger = new Logger(NotificationsProcessor.name);
    private readonly resend: Resend;
    private readonly globalFrom = process.env.EMAIL_FROM_ADDRESS || 'Setorial <onboarding@resend.dev>';

    constructor(private httpService: HttpService) {
        super();
        this.resend = new Resend(process.env.RESEND_API_KEY || 're_dummy');
    }

    async process(job: Job<any, any, string>): Promise<any> {
        switch (job.name) {
            case 'push':
                return this.handlePush(job.data);
            case 'email':
                return this.handleEmail(job.data);
            case 'email-batch':
                return this.handleEmailBatch(job.data);
            default:
                this.logger.warn(`Unknown job name: ${job.name}`);
        }
    }

    private async handlePush(data: { tokens: string[], title: string, body: string, payload: any }) {
        const messages = data.tokens.map(token => ({
            to: token,
            sound: 'default',
            title: data.title,
            body: data.body,
            data: data.payload,
        }));

        try {
            await lastValueFrom(
                this.httpService.post('https://exp.host/--/api/v2/push/send', messages, {
                    headers: {
                        'Accept': 'application/json',
                        'Accept-encoding': 'gzip, deflate',
                        'Content-Type': 'application/json',
                    },
                })
            );
            this.logger.log(`Push notification job completed for ${data.tokens.length} tokens.`);
        } catch (error) {
            this.logger.error('Failed to send push notifications via Expo', error.response?.data || error.message);
            throw error;
        }
    }

    private async handleEmail(data: { to: string, subject: string, html: string, replyTo?: string }) {
        try {
            const { error } = await this.resend.emails.send({
                from: this.globalFrom,
                to: data.to,
                subject: data.subject,
                html: data.html,
                replyTo: data.replyTo
            });
            if (error) throw new Error(error.message);
            this.logger.log(`Email job completed for ${data.to}`);
        } catch (err) {
            this.logger.error(`Failed to send email to ${data.to}: ${err.message}`);
            throw err;
        }
    }

    private async handleEmailBatch(data: { batch: any[] }) {
        try {
            await this.resend.batch.send(data.batch);
            this.logger.log(`Batch email job completed for ${data.batch.length} recipients.`);
        } catch (err) {
            this.logger.error(`Batch email failed: ${err.message}`);
            throw err;
        }
    }
}
