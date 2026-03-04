import { UsersService } from './users.service';
import { GamificationService } from '../gamification/gamification.service';
import { PayoutMethod } from '@prisma/client';
export declare class UsersController {
    private usersService;
    private gamificationService;
    constructor(usersService: UsersService, gamificationService: GamificationService);
    getMe(req: any): Promise<{
        points: number;
        streak: number;
        id?: string | undefined;
        email?: string | undefined;
        password?: string | undefined;
        name?: string | null | undefined;
        role?: import("@prisma/client").$Enums.Role | undefined;
        tier?: import("@prisma/client").$Enums.Tier | undefined;
        isVerified?: boolean | undefined;
        kycStatus?: import("@prisma/client").$Enums.KycStatus | undefined;
        payoutMethod?: import("@prisma/client").$Enums.PayoutMethod | null | undefined;
        payoutAccount?: import("@prisma/client/runtime/client").JsonValue | undefined;
        createdAt?: Date | undefined;
        updatedAt?: Date | undefined;
    }>;
    updateMe(req: any, body: {
        name?: string;
    }): Promise<{
        id: string;
        email: string;
        password: string;
        name: string | null;
        role: import("@prisma/client").$Enums.Role;
        tier: import("@prisma/client").$Enums.Tier;
        isVerified: boolean;
        kycStatus: import("@prisma/client").$Enums.KycStatus;
        payoutMethod: import("@prisma/client").$Enums.PayoutMethod | null;
        payoutAccount: import("@prisma/client/runtime/client").JsonValue | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
    getProgress(req: any): Promise<{
        id: string;
        name: string;
        totalTopics: number;
        totalQuizzes: number;
        completedQuizzes: number;
        progress: number;
    }[]>;
    submitKyc(req: any, body: {
        payoutMethod: PayoutMethod;
        payoutAccount: Record<string, any>;
    }): Promise<any>;
    getBanks(): Promise<any>;
    resolveAccount(accountNumber: string, bankCode: string): Promise<any>;
    getUser(id: string): Promise<{
        id: string;
        email: string;
        password: string;
        name: string | null;
        role: import("@prisma/client").$Enums.Role;
        tier: import("@prisma/client").$Enums.Tier;
        isVerified: boolean;
        kycStatus: import("@prisma/client").$Enums.KycStatus;
        payoutMethod: import("@prisma/client").$Enums.PayoutMethod | null;
        payoutAccount: import("@prisma/client/runtime/client").JsonValue | null;
        createdAt: Date;
        updatedAt: Date;
    } | null>;
}
