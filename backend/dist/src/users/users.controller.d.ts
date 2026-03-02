import { UsersService } from './users.service';
import { GamificationService } from '../gamification/gamification.service';
export declare class UsersController {
    private usersService;
    private gamificationService;
    constructor(usersService: UsersService, gamificationService: GamificationService);
    getMe(req: any): Promise<{
        points: number;
        streak: number;
        id?: string | undefined;
        name?: string | null | undefined;
        createdAt?: Date | undefined;
        updatedAt?: Date | undefined;
        email?: string | undefined;
        password?: string | undefined;
        role?: import("@prisma/client").$Enums.Role | undefined;
        tier?: import("@prisma/client").$Enums.Tier | undefined;
        isVerified?: boolean | undefined;
    }>;
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
    } | null>;
}
