import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import * as crypto from 'crypto';

const TIER_PRICES: Record<string, number> = {
    BRONZE: 100000,  // ₦1,000 in kobo
    SILVER: 200000,  // ₦2,000 in kobo
    GOLD: 500000,    // ₦5,000 in kobo
};

@Injectable()
export class SubscriptionsService {
    constructor(private prisma: PrismaService) { }

    async initializeTransaction(userId: string, tier: string) {
        const secret = process.env.PAYSTACK_SECRET_KEY;
        if (!secret) throw new BadRequestException('Paystack not configured');

        const user = await this.prisma.user.findUnique({ where: { id: userId } });
        if (!user) throw new BadRequestException('User not found');

        const amount = TIER_PRICES[tier.toUpperCase()];
        if (!amount) throw new BadRequestException('Invalid tier');

        const response = await fetch('https://api.paystack.co/transaction/initialize', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${secret}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                email: user.email,
                amount,
                metadata: {
                    userId: user.id,
                    tier: tier.toUpperCase(),
                },
                callback_url: `setorial://payment-callback`,
            }),
        });

        const data = await response.json();
        if (!data.status) throw new BadRequestException(data.message || 'Payment initialization failed');

        return {
            authorization_url: data.data.authorization_url,
            access_code: data.data.access_code,
            reference: data.data.reference,
        };
    }

    async verifyTransaction(reference: string) {
        const secret = process.env.PAYSTACK_SECRET_KEY;
        if (!secret) throw new BadRequestException('Paystack not configured');

        const response = await fetch(`https://api.paystack.co/transaction/verify/${reference}`, {
            headers: { 'Authorization': `Bearer ${secret}` },
        });

        const data = await response.json();
        if (!data.status || data.data.status !== 'success') {
            return { status: 'failed', message: 'Payment not verified' };
        }

        const metadata = data.data.metadata;
        if (metadata?.userId && metadata?.tier) {
            await this.prisma.user.update({
                where: { id: metadata.userId },
                data: { tier: metadata.tier },
            });
        }

        return { status: 'success', tier: metadata?.tier };
    }

    async handlePaystackWebhook(signature: string, payload: any) {
        const secret = process.env.PAYSTACK_SECRET_KEY;
        if (!secret) throw new BadRequestException('Paystack secret not configured');

        const hash = crypto.createHmac('sha512', secret).update(JSON.stringify(payload)).digest('hex');

        if (hash !== signature) {
            throw new UnauthorizedException('Invalid Signature');
        }

        const event = payload.event;
        if (event === 'charge.success') {
            const metadata = payload.data.metadata;
            if (metadata?.userId && metadata?.tier) {
                await this.prisma.user.update({
                    where: { id: metadata.userId },
                    data: { tier: metadata.tier },
                });
            }
        }

        return { status: 'success' };
    }
}
