import { PrismaService } from '../prisma.service';
import { WalletTxType } from '@prisma/client';
export declare class WalletService {
    private prisma;
    constructor(prisma: PrismaService);
    getBalance(userId: string): Promise<number>;
    addTransaction(userId: string, type: WalletTxType, amount: number, reference?: string): Promise<{
        id: string;
        createdAt: Date;
        userId: string;
        type: import("@prisma/client").$Enums.WalletTxType;
        amount: import("@prisma/client-runtime-utils").Decimal;
        reference: string | null;
    }>;
    getTransactions(userId: string): Promise<{
        id: string;
        createdAt: Date;
        userId: string;
        type: import("@prisma/client").$Enums.WalletTxType;
        amount: import("@prisma/client-runtime-utils").Decimal;
        reference: string | null;
    }[]>;
}
