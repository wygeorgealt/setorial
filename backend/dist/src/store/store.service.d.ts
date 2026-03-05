import { PrismaService } from '../prisma.service';
import { WalletService } from '../wallet/wallet.service';
import { GamificationService } from '../gamification/gamification.service';
export declare class StoreService {
    private prisma;
    private wallet;
    private gamification;
    constructor(prisma: PrismaService, wallet: WalletService, gamification: GamificationService);
    seedPowerUps(): Promise<void>;
    getStore(): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        type: import("@prisma/client").$Enums.PowerUpType;
        description: string;
        icon: string;
        price: import("@prisma/client-runtime-utils").Decimal;
        durationDays: number | null;
    }[]>;
    purchasePowerUp(userId: string, powerUpType: string): Promise<{
        powerUp: {
            id: string;
            name: string;
            createdAt: Date;
            updatedAt: Date;
            type: import("@prisma/client").$Enums.PowerUpType;
            description: string;
            icon: string;
            price: import("@prisma/client-runtime-utils").Decimal;
            durationDays: number | null;
        };
    } & {
        id: string;
        userId: string;
        isActive: boolean;
        activatedAt: Date;
        expiresAt: Date | null;
        powerUpId: string;
    }>;
    getMyPowerUps(userId: string): Promise<({
        powerUp: {
            id: string;
            name: string;
            createdAt: Date;
            updatedAt: Date;
            type: import("@prisma/client").$Enums.PowerUpType;
            description: string;
            icon: string;
            price: import("@prisma/client-runtime-utils").Decimal;
            durationDays: number | null;
        };
    } & {
        id: string;
        userId: string;
        isActive: boolean;
        activatedAt: Date;
        expiresAt: Date | null;
        powerUpId: string;
    })[]>;
    hasActiveBoost(userId: string): Promise<boolean>;
}
