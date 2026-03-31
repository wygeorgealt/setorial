import { MockExamsService } from './mock-exams.service';
export declare class MockExamsController {
    private readonly mockService;
    constructor(mockService: MockExamsService);
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
        description: string | null;
        price: import("@prisma/client-runtime-utils").Decimal;
        title: string;
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
