import { PrismaService } from '../prisma.service';
import { CreateSubjectDto, CreateTopicDto, CreateLessonDto, SubmitLessonDto } from './dto/learning.dto';
import { GamificationService } from '../gamification/gamification.service';
import { StoreService } from '../store/store.service';
import { UploadService } from '../upload/upload.service';
export declare class LearningService {
    private prisma;
    private gamificationService;
    private storeService;
    private uploadService;
    constructor(prisma: PrismaService, gamificationService: GamificationService, storeService: StoreService, uploadService: UploadService);
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
    updateLesson(id: string, dto: Partial<CreateLessonDto>): Promise<{
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
    updateLessonWithVideo(id: string, dto: any, video?: Express.Multer.File): Promise<{
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
    submitLesson(userId: string, dto: SubmitLessonDto): Promise<{
        score: number;
        total: number;
        breakdown: any[];
        pointsEarned: number;
        passed: boolean;
        isFirstCompletion: boolean;
    }>;
}
