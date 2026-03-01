import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { Tier } from '@prisma/client';
import * as crypto from 'crypto';

@Injectable()
export class SubscriptionsService {
    constructor(private prisma: PrismaService) { }

    async handlePaystackWebhook(signature: string, payload: any) {
        const secret = process.env.PAYSTACK_SECRET_KEY;
        if (!secret) throw new BadRequestException('Paystack secret not configured');

        const hash = crypto.createHmac('sha512', secret).update(JSON.stringify(payload)).digest('hex');

        if (hash !== signature) {
            throw new UnauthorizedException('Invalid Signature');
        }

        const event = payload.event;
        if (event === 'charge.success') {
            const email = payload.data.customer.email;
            const amount = payload.data.amount; // in kobo or cents
            let newTier: any = 'FREE';
            // Dummy logic for tier upgrades based on amount
            if (amount >= 500000) newTier = 'GOLD';
            else if (amount >= 200000) newTier = 'SILVER';
            else if (amount >= 100000) newTier = 'BRONZE';

            if (newTier !== 'FREE') {
                await (this.prisma as any).user.update({
                    where: { email },
                    data: { tier: newTier }
                });
            }
        }

        return { status: 'success' };
    }
}
