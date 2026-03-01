import { SubscriptionsService } from './subscriptions.service';
export declare class SubscriptionsController {
    private subscriptionsService;
    constructor(subscriptionsService: SubscriptionsService);
    paystackWebhook(signature: string, payload: any): Promise<{
        status: string;
    }>;
}
