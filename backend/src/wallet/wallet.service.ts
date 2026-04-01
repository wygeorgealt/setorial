import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { WalletTxType } from '@prisma/client';

@Injectable()
export class WalletService {
    constructor(private prisma: PrismaService) { }

    async getBalanceData(userId: string): Promise<{ balance: number, exchangeRate: number }> {
        const result = await this.prisma.walletLedger.aggregate({
            where: { userId },
            _sum: { amount: true },
        });

        const balance = result._sum.amount ? Number(result._sum.amount) : 0;

        // Check for manual admin-locked rate first
        const lockedRateConfig = await (this.prisma as any).globalConfig.findUnique({
            where: { key: 'LOCKED_EXCHANGE_RATE' }
        });

        // Fetch latest exchange rate from the most recent completed batch
        const latestBatch = await (this.prisma as any).payoutBatch.findFirst({
            where: { status: 'COMPLETED', exchangeRate: { not: null } },
            orderBy: { createdAt: 'desc' },
            select: { exchangeRate: true }
        });

        const exchangeRate = lockedRateConfig?.value 
            ? parseFloat(lockedRateConfig.value) 
            : (latestBatch?.exchangeRate || 1600.0);

        return {
            balance,
            exchangeRate
        };
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

    async deductBalance(userId: string, amount: number, reference: string): Promise<boolean> {
        return this.prisma.$transaction(async (tx) => {
            const result = await tx.walletLedger.aggregate({
                where: { userId },
                _sum: { amount: true },
            });
            const currentBalance = result._sum.amount ? Number(result._sum.amount) : 0;

            if (currentBalance < amount) {
                return false;
            }

            await tx.walletLedger.create({
                data: {
                    userId,
                    type: 'ADJUSTMENT', // Using an existing WalletTxType enum value that subtracts.
                    amount: -amount,
                    reference,
                },
            });

            return true;
        });
    }
}
