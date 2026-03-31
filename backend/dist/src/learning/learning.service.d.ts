import { PrismaService } from '../prisma.service';
import { CreateSubjectDto, CreateTopicDto, CreateLessonDto, SubmitLessonDto } from './dto/learning.dto';
import { GamificationService } from '../gamification/gamification.service';
import { StoreService } from '../store/store.service';
export declare class LearningService {
    private prisma;
    private gamificationService;
    private storeService;
    constructor(prisma: PrismaService, gamificationService: GamificationService, storeService: StoreService);
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
    createTopic(dto: CreateTopicDto): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        subjectId: string;
    }>;
    deleteTopic(id: string): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        subjectId: string;
    }>;
    createLesson(dto: CreateLessonDto): Promise<{
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
        createdAt: Date;
        updatedAt: Date;
        content: string | null;
        order: number;
        rewardPoints: number;
        topicId: string;
    }>;
    getSubjects(): Promise<({
        topics: {
            id: string;
            name: string;
            createdAt: Date;
            updatedAt: Date;
            subjectId: string;
        }[];
    } & {
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
    })[]>;
    getSubjectPathway(id: string, userId: string): Promise<{
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
    getLesson(id: string): Promise<{
        questions: {
            id: string;
            text: string;
            options: import("@prisma/client/runtime/client").JsonValue;
        }[];
    } & {
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        content: string | null;
        order: number;
        rewardPoints: number;
        topicId: string;
    }>;
    submitLesson(userId: string, dto: SubmitLessonDto): Promise<{
        score: number;
        total: number;
        breakdown: any[];
        pointsEarned: number;
        passed: boolean;
        isFirstCompletion: boolean;
    }>;
}
