import { WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { HttpService } from '@nestjs/axios';
export declare class NotificationsProcessor extends WorkerHost {
    private httpService;
    private readonly logger;
    private readonly resend;
    private readonly globalFrom;
    constructor(httpService: HttpService);
    process(job: Job<any, any, string>): Promise<any>;
    private handlePush;
    private handleEmail;
    private handleEmailBatch;
}
