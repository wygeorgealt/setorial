import { MockExamsService } from './mock-exams.service';
export declare class MockExamsController {
    private readonly mockService;
    constructor(mockService: MockExamsService);
    getAvailableMocks(): Promise<{
        id: string;
        _count: {
            questions: number;
        };
        title: string;
        description: string | null;
        price: import("@prisma/client-runtime-utils").Decimal;
        durationMinutes: number;
    }[]>;
    getMockDetails(id: string): Promise<({
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
        title: string;
        description: string | null;
        price: import("@prisma/client-runtime-utils").Decimal;
        durationMinutes: number;
    }) | null>;
    startMock(req: any, id: string): Promise<{
        attemptId: string;
        resumed: boolean;
    }>;
    submitMock(req: any, id: string, body: {
        answers: number[];
        tabSwitches: number;
    }): Promise<{
        score: number;
        maxScore: number;
        pointsEarned: number;
        status: import("@prisma/client").$Enums.MockStatus;
    }>;
}
