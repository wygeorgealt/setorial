import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { CreateSubjectDto, CreateTopicDto, CreateLessonDto, CreateQuizDto, SubmitQuizDto } from './dto/learning.dto';
import { GamificationService } from '../gamification/gamification.service';
import { StoreService } from '../store/store.service';

@Injectable()
export class LearningService {
    constructor(
        private prisma: PrismaService,
        private gamificationService: GamificationService,
        private storeService: StoreService,
    ) { }

    async createSubject(dto: CreateSubjectDto) {
        return this.prisma.subject.create({ data: dto });
    }

    async createTopic(dto: CreateTopicDto) {
        return this.prisma.topic.create({ data: dto });
    }

    async createLesson(dto: CreateLessonDto) {
        return this.prisma.lesson.create({ data: dto });
    }

    async createQuiz(dto: CreateQuizDto) {
        return this.prisma.quiz.create({
            data: {
                title: dto.title,
                lessonId: dto.lessonId,
                questions: {
                    create: dto.questions.map(q => ({
                        text: q.text,
                        options: q.options,
                        correctOption: q.correctOption,
                    })),
                }
            },
            include: { questions: true }
        });
    }

    async getSubjects() {
        return this.prisma.subject.findMany({ include: { topics: true } });
    }

    async getSubject(id: string) {
        return this.prisma.subject.findUnique({
            where: { id },
            include: {
                topics: {
                    include: {
                        lessons: {
                            include: { quizzes: true }
                        }
                    }
                }
            }
        });
    }

    async getQuiz(id: string) {
        const quiz = await this.prisma.quiz.findUnique({
            where: { id },
            include: { questions: { select: { id: true, text: true, options: true } } },
        });
        if (!quiz) throw new NotFoundException('Quiz not found');
        return quiz;
    }

    async submitQuiz(userId: string, dto: SubmitQuizDto) {
        const quiz = await this.prisma.quiz.findUnique({
            where: { id: dto.quizId },
            include: {
                questions: true,
                lesson: {
                    include: {
                        topic: {
                            include: { subject: true }
                        }
                    }
                }
            },
        });

        if (!quiz) throw new NotFoundException('Quiz not found');

        const subjectId = quiz.lesson.topic.subjectId;

        let score = 0;
        const breakdown: any[] = [];

        quiz.questions.forEach((q, index) => {
            const isCorrect = q.correctOption === dto.answers[index];
            if (isCorrect) score += 1;
            breakdown.push({ questionId: q.id, isCorrect, correctOption: q.correctOption });
        });

        let pointsEarned = score * 10;

        // Check for active 2x Points Boost
        const hasBoost = await this.storeService.hasActiveBoost(userId);
        if (hasBoost) pointsEarned *= 2;

        // Award points and streak
        await this.gamificationService.awardPoints(
            userId,
            pointsEarned,
            hasBoost ? 'Quiz Completion (2x Boost)' : 'Quiz Completion',
            subjectId
        );
        const currentStreak = await this.gamificationService.incrementStreak(userId);

        // Check and award any earned badges based on this score
        await this.gamificationService.checkAndAwardBadges(userId, {
            streak: currentStreak,
            score: score,
            total: quiz.questions.length
        });

        // Bump lastActiveAt
        await this.prisma.user.update({
            where: { id: userId },
            data: { lastActiveAt: new Date() }
        });

        return { score, total: quiz.questions.length, breakdown, pointsEarned };
    }
}
