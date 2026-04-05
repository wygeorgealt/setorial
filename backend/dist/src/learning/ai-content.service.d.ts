import { PrismaService } from '../prisma.service';
export declare class AiContentService {
    private prisma;
    private readonly logger;
    private readonly deepseekKey;
    constructor(prisma: PrismaService);
    generateLevelsForTopic(subjectId: string, topicName: string, numLevels?: number): Promise<any>;
    regenerateLesson(lessonId: string): Promise<any>;
    generateMockExam(subjectId: string, title: string, numQuestions?: number): Promise<any>;
    private executeGeneration;
}
