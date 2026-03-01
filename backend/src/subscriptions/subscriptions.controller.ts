import { Controller, Post, Headers, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { SubscriptionsService } from './subscriptions.service';

@Controller('subscriptions')
export class SubscriptionsController {
    constructor(private subscriptionsService: SubscriptionsService) { }

    @Post('webhook/paystack')
    @HttpCode(HttpStatus.OK)
    async paystackWebhook(
        @Headers('x-paystack-signature') signature: string,
        @Body() payload: any,
    ) {
        return this.subscriptionsService.handlePaystackWebhook(signature, payload);
    }
}
