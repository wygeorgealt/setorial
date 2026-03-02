import { PrismaService } from '../prisma.service';
import { Prisma, User } from '@prisma/client';
export declare class UsersService {
    private prisma;
    constructor(prisma: PrismaService);
    createUser(data: Prisma.UserCreateInput): Promise<User>;
    findByEmail(email: string): Promise<User | null>;
    findById(id: string): Promise<User | null>;
    getPoints(userId: string): Promise<number>;
    updateProfile(userId: string, data: {
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
    }>;
    getLearningProgress(userId: string): Promise<{
        id: string;
        name: string;
        totalTopics: number;
        totalQuizzes: number;
        completedQuizzes: number;
        progress: number;
    }[]>;
}
