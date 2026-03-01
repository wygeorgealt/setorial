import { PrismaService } from '../prisma.service';
import { CreateSubjectDto, CreateTopicDto, CreateLessonDto, CreateQuizDto, SubmitQuizDto } from './dto/learning.dto';
export declare class LearningService {
    private prisma;
    constructor(prisma: PrismaService);
    createSubject(dto: CreateSubjectDto): Promise<{
        name: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
    }>;
    createTopic(dto: CreateTopicDto): Promise<{
        name: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        subjectId: string;
    }>;
    createLesson(dto: CreateLessonDto): Promise<{
        name: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        topicId: string;
    }>;
    createQuiz(dto: CreateQuizDto): Promise<{
        questions: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            text: string;
            options: import("@prisma/client/runtime/client").JsonValue;
            correctOption: number;
            quizId: string;
        }[];
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        title: string;
        lessonId: string;
    }>;
    getSubjects(): Promise<({
        topics: {
            name: string;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            subjectId: string;
        }[];
    } & {
        name: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
    })[]>;
    getQuiz(id: string): Promise<{
        questions: {
            id: string;
            text: string;
            options: import("@prisma/client/runtime/client").JsonValue;
        }[];
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        title: string;
        lessonId: string;
    }>;
    submitQuiz(userId: string, dto: SubmitQuizDto): Promise<{
        score: number;
        total: number;
        breakdown: any[];
        pointsEarned: number;
    }>;
}
