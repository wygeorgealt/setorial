import { SubscriptionsService } from './subscriptions.service';
export declare class SubscriptionsController {
    private subscriptionsService;
    constructor(subscriptionsService: SubscriptionsService);
    initialize(req: any, body: {
        tier: string;
        billingCycle?: 'MONTHLY' | 'ANNUAL';
    }): Promise<{
        authorization_url: any;
        access_code: any;
        reference: any;
    }>;
    verify(reference: string): Promise<{
        status: string;
        message: string;
        tier?: undefined;
    } | {
        status: string;
        tier: any;
        message?: undefined;
    }>;
    paystackWebhook(signature: string, payload: any): Promise<{
        status: string;
    }>;
}
