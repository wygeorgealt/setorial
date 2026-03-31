import { PrismaService } from '../prisma.service';
import { WalletService } from '../wallet/wallet.service';
import { GamificationService } from '../gamification/gamification.service';
export declare class MockExamsService {
    private prisma;
    private walletService;
    private gamificationService;
    constructor(prisma: PrismaService, walletService: WalletService, gamificationService: GamificationService);
    getAvailableMocks(): Promise<{
        id: string;
        _count: {
            questions: number;
        };
        description: string | null;
        price: import("@prisma/client-runtime-utils").Decimal;
        title: string;
        durationMinutes: number;
    }[]>;
    getMockDetails(mockId: string): Promise<({
        questions: {
            id: string;
            options: import("@prisma/client/runtime/client").JsonValue;
            text: string;
        }[];
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        isActive: boolean;
        description: string | null;
        price: import("@prisma/client-runtime-utils").Decimal;
        title: string;
        durationMinutes: number;
    }) | null>;
    startMock(userId: string, mockId: string): Promise<{
        attemptId: string;
        resumed: boolean;
    }>;
    submitMock(userId: string, attemptId: string, answers: number[], tabSwitches: number): Promise<{
        score: number;
        maxScore: number;
        pointsEarned: number;
        status: import("@prisma/client").$Enums.MockStatus;
    }>;
}
