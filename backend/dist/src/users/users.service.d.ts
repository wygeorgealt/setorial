import { PrismaService } from '../prisma.service';
import { Prisma, User, PayoutMethod, KycStatus } from '@prisma/client';
import { HttpService } from '@nestjs/axios';
export declare class UsersService {
    private prisma;
    private httpService;
    private readonly logger;
    private readonly paystackKey;
    constructor(prisma: PrismaService, httpService: HttpService);
    createUser(data: Prisma.UserCreateInput): Promise<User>;
    findByEmail(email: string): Promise<User | null>;
    findById(id: string): Promise<User | null>;
    getPoints(userId: string): Promise<number>;
    updateProfile(userId: string, data: {
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
        payoutAccount: Prisma.JsonValue | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
    getLearningProgress(userId: string): Promise<{
        id: string;
        name: string;
        totalTopics: number;
        totalQuizzes: number;
        completedQuizzes: number;
        progress: number;
    }[]>;
    getBanks(): Promise<any>;
    resolveAccount(accountNumber: string, bankCode: string): Promise<any>;
    private normalizeName;
    private namesMatch;
    submitKyc(userId: string, dto: {
        payoutMethod: PayoutMethod;
        payoutAccount: Record<string, any>;
    }): Promise<any>;
    updateKycStatus(userId: string, status: KycStatus): Promise<any>;
    getPendingKyc(): Promise<any>;
}
