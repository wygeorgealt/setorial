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
var NotificationsProcessor_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationsProcessor = void 0;
const bullmq_1 = require("@nestjs/bullmq");
const common_1 = require("@nestjs/common");
const axios_1 = require("@nestjs/axios");
const rxjs_1 = require("rxjs");
const resend_1 = require("resend");
let NotificationsProcessor = NotificationsProcessor_1 = class NotificationsProcessor extends bullmq_1.WorkerHost {
    httpService;
    logger = new common_1.Logger(NotificationsProcessor_1.name);
    resend;
    globalFrom = process.env.EMAIL_FROM_ADDRESS || 'Setorial <onboarding@resend.dev>';
    constructor(httpService) {
        super();
        this.httpService = httpService;
        this.resend = new resend_1.Resend(process.env.RESEND_API_KEY || 're_dummy');
    }
    async process(job) {
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
    async handlePush(data) {
        const messages = data.tokens.map(token => ({
            to: token,
            sound: 'default',
            title: data.title,
            body: data.body,
            data: data.payload,
        }));
        try {
            await (0, rxjs_1.lastValueFrom)(this.httpService.post('https://exp.host/--/api/v2/push/send', messages, {
                headers: {
                    'Accept': 'application/json',
                    'Accept-encoding': 'gzip, deflate',
                    'Content-Type': 'application/json',
                },
            }));
            this.logger.log(`Push notification job completed for ${data.tokens.length} tokens.`);
        }
        catch (error) {
            this.logger.error('Failed to send push notifications via Expo', error.response?.data || error.message);
            throw error;
        }
    }
    async handleEmail(data) {
        try {
            const { error } = await this.resend.emails.send({
                from: this.globalFrom,
                to: data.to,
                subject: data.subject,
                html: data.html,
                replyTo: data.replyTo
            });
            if (error)
                throw new Error(error.message);
            this.logger.log(`Email job completed for ${data.to}`);
        }
        catch (err) {
            this.logger.error(`Failed to send email to ${data.to}: ${err.message}`);
            throw err;
        }
    }
    async handleEmailBatch(data) {
        try {
            await this.resend.batch.send(data.batch);
            this.logger.log(`Batch email job completed for ${data.batch.length} recipients.`);
        }
        catch (err) {
            this.logger.error(`Batch email failed: ${err.message}`);
            throw err;
        }
    }
};
exports.NotificationsProcessor = NotificationsProcessor;
exports.NotificationsProcessor = NotificationsProcessor = NotificationsProcessor_1 = __decorate([
    (0, bullmq_1.Processor)('notifications'),
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [axios_1.HttpService])
], NotificationsProcessor);
//# sourceMappingURL=notifications.processor.js.map