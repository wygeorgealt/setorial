import { Controller, Post, Get, Headers, Body, Param, HttpCode, HttpStatus, UseGuards, Request } from '@nestjs/common';
import { SubscriptionsService } from './subscriptions.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('subscriptions')
export class SubscriptionsController {
    constructor(private subscriptionsService: SubscriptionsService) { }

    @UseGuards(JwtAuthGuard)
    @Post('initialize')
    async initialize(
        @Request() req: any,
        @Body() body: { tier: string, billingCycle?: 'MONTHLY' | 'ANNUAL' },
    ) {
        return this.subscriptionsService.initializeTransaction(req.user.userId, body.tier, body.billingCycle);
    }

    @UseGuards(JwtAuthGuard)
    @Get('verify/:reference')
    async verify(@Param('reference') reference: string) {
        return this.subscriptionsService.verifyTransaction(reference);
    }

    @Post('webhook/paystack')
    @HttpCode(HttpStatus.OK)
    async paystackWebhook(
        @Headers('x-paystack-signature') signature: string,
        @Body() payload: any,
    ) {
        return this.subscriptionsService.handlePaystackWebhook(signature, payload);
    }
}
