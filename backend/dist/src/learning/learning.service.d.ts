import { PrismaService } from '../prisma.service';
import { CreateSubjectDto, CreateTopicDto, CreateLessonDto, CreateQuizDto, SubmitQuizDto } from './dto/learning.dto';
export declare class LearningService {
    private prisma;
    constructor(prisma: PrismaService);
    createSubject(dto: CreateSubjectDto): Promise<{
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
    createLesson(dto: CreateLessonDto): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        topicId: string;
    }>;
    createQuiz(dto: CreateQuizDto): Promise<{
        questions: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            options: import("@prisma/client/runtime/client").JsonValue;
            text: string;
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
    getSubject(id: string): Promise<({
        topics: ({
            lessons: ({
                quizzes: {
                    id: string;
                    createdAt: Date;
                    updatedAt: Date;
                    title: string;
                    lessonId: string;
                }[];
            } & {
                id: string;
                name: string;
                createdAt: Date;
                updatedAt: Date;
                topicId: string;
            })[];
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
    }) | null>;
    getQuiz(id: string): Promise<{
        questions: {
            id: string;
            options: import("@prisma/client/runtime/client").JsonValue;
            text: string;
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
