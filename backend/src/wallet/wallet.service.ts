import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { WalletTxType } from '@prisma/client';

@Injectable()
export class WalletService {
    constructor(private prisma: PrismaService) { }

    async getBalance(userId: string): Promise<number> {
        const result = await this.prisma.walletLedger.aggregate({
            where: { userId },
            _sum: { amount: true },
        });
        return result._sum.amount ? Number(result._sum.amount) : 0;
    }

    async addTransaction(userId: string, type: WalletTxType, amount: number, reference?: string) {
        // Payouts should reduce the balance logically
        if (type === 'PAYOUT' && amount > 0) {
            amount = -amount;
        }

        return this.prisma.$transaction(async (tx) => {
            const entry = await tx.walletLedger.create({
                data: {
                    userId,
                    type,
                    amount,
                    reference,
                },
            });

            if (type === 'PAYOUT') {
                const result = await tx.walletLedger.aggregate({
                    where: { userId },
                    _sum: { amount: true },
                });
                const currentBalance = result._sum.amount ? Number(result._sum.amount) : 0;
                if (currentBalance < 0) {
                    throw new BadRequestException('Insufficient monetizable balance');
                }
            }

            return entry;
        });
    }

    async getTransactions(userId: string) {
        return this.prisma.walletLedger.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' },
            take: 20,
        });
    }
}
