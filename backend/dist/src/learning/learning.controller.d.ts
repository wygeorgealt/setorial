import { LearningService } from './learning.service';
import { AiContentService } from './ai-content.service';
import { CreateSubjectDto, SubmitLessonDto, GenerateAiLevelsDto } from './dto/learning.dto';
export declare class LearningController {
    private readonly learningService;
    private readonly aiContentService;
    constructor(learningService: LearningService, aiContentService: AiContentService);
    generateAiLevels(dto: GenerateAiLevelsDto): Promise<any>;
    generateAiMock(dto: {
        subjectId: string;
        title: string;
        numQuestions?: number;
    }): Promise<any>;
    regenerateLesson(id: string): Promise<any>;
    createSubject(dto: CreateSubjectDto): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
    }>;
    deleteSubject(id: string): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
    }>;
    getSubjects(): Promise<({
        topics: ({
            lessons: {
                id: string;
                name: string;
                createdAt: Date;
                updatedAt: Date;
                content: string | null;
                videoUrl: string | null;
                order: number;
                rewardPoints: number;
                topicId: string;
            }[];
        } & {
            id: string;
            name: string;
            createdAt: Date;
            updatedAt: Date;
            subjectId: string;
        })[];
    } & {
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
    })[]>;
    getSubject(id: string, req: any): Promise<{
        topics: {
            lessons: {
                status: string;
                score: number | null;
                _count: {
                    questions: number;
                };
                id: string;
                name: string;
                createdAt: Date;
                updatedAt: Date;
                content: string | null;
                videoUrl: string | null;
                order: number;
                rewardPoints: number;
                topicId: string;
            }[];
            id: string;
            name: string;
            createdAt: Date;
            updatedAt: Date;
            subjectId: string;
        }[];
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
    }>;
    getLesson(id: string): Promise<any>;
    submitLesson(req: any, dto: SubmitLessonDto): Promise<{
        score: number;
        total: number;
        breakdown: any[];
        pointsEarned: number;
        passed: boolean;
        isFirstCompletion: boolean;
    }>;
    updateLesson(id: string, dto: any, video?: Express.Multer.File): Promise<{
        questions: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            mockExamId: string | null;
            lessonId: string | null;
            options: import("@prisma/client/runtime/client").JsonValue;
            text: string;
            correctOption: number;
        }[];
    } & {
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        content: string | null;
        videoUrl: string | null;
        order: number;
        rewardPoints: number;
        topicId: string;
    }>;
}
