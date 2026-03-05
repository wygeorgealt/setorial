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
        badges: {
            awardedAt: Date;
            id: string;
            name: string;
            createdAt: Date;
            updatedAt: Date;
            description: string;
            icon: string;
            color: string;
        }[];
        id?: string | undefined;
        name?: string | null | undefined;
        createdAt?: Date | undefined;
        updatedAt?: Date | undefined;
        email?: string | undefined;
        password?: string | undefined;
        role?: import("@prisma/client").$Enums.Role | undefined;
        tier?: import("@prisma/client").$Enums.Tier | undefined;
        isVerified?: boolean | undefined;
        kycStatus?: import("@prisma/client").$Enums.KycStatus | undefined;
        payoutMethod?: import("@prisma/client").$Enums.PayoutMethod | null | undefined;
        payoutAccount?: import("@prisma/client/runtime/client").JsonValue | undefined;
        billingCountry?: string | null | undefined;
        countryLocked?: boolean | undefined;
        lastActiveAt?: Date | null | undefined;
        assessmentPassed?: boolean | undefined;
        monetizationEligibleAt?: Date | null | undefined;
    }>;
    updateMe(req: any, body: {
        name?: string;
    }): Promise<{
        id: string;
        name: string | null;
        createdAt: Date;
        updatedAt: Date;
        email: string;
        password: string;
        role: import("@prisma/client").$Enums.Role;
        tier: import("@prisma/client").$Enums.Tier;
        isVerified: boolean;
        kycStatus: import("@prisma/client").$Enums.KycStatus;
        payoutMethod: import("@prisma/client").$Enums.PayoutMethod | null;
        payoutAccount: import("@prisma/client/runtime/client").JsonValue | null;
        billingCountry: string | null;
        countryLocked: boolean;
        lastActiveAt: Date | null;
        assessmentPassed: boolean;
        monetizationEligibleAt: Date | null;
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
        name: string | null;
        createdAt: Date;
        updatedAt: Date;
        email: string;
        password: string;
        role: import("@prisma/client").$Enums.Role;
        tier: import("@prisma/client").$Enums.Tier;
        isVerified: boolean;
        kycStatus: import("@prisma/client").$Enums.KycStatus;
        payoutMethod: import("@prisma/client").$Enums.PayoutMethod | null;
        payoutAccount: import("@prisma/client/runtime/client").JsonValue | null;
        billingCountry: string | null;
        countryLocked: boolean;
        lastActiveAt: Date | null;
        assessmentPassed: boolean;
        monetizationEligibleAt: Date | null;
    } | null>;
}
