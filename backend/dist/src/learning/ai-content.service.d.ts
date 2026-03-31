import { PrismaService } from '../prisma.service';
export declare class AiContentService {
    private prisma;
    private readonly logger;
    private genAI;
    constructor(prisma: PrismaService);
    generateLevelsForTopic(subjectId: string, topicName: string, numLevels?: number): Promise<{
        message: string;
        topic: {
            id: string;
            name: string;
            createdAt: Date;
            updatedAt: Date;
            subjectId: string;
        };
        levels: ({
            questions: {
                id: string;
                createdAt: Date;
                updatedAt: Date;
                text: string;
                options: import("@prisma/client/runtime/client").JsonValue;
                correctOption: number;
                mockExamId: string | null;
                lessonId: string | null;
            }[];
        } & {
            id: string;
            name: string;
            content: string | null;
            order: number;
            rewardPoints: number;
            createdAt: Date;
            updatedAt: Date;
            topicId: string;
        })[];
    }>;
}
