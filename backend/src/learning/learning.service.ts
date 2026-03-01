import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { CreateSubjectDto, CreateTopicDto, CreateLessonDto, CreateQuizDto, SubmitQuizDto } from './dto/learning.dto';

@Injectable()
export class LearningService {
    constructor(
        private prisma: PrismaService,
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
            include: { questions: true },
        });

        if (!quiz) throw new NotFoundException('Quiz not found');

        let score = 0;
        const breakdown: any[] = [];

        quiz.questions.forEach((q, index) => {
            const isCorrect = q.correctOption === dto.answers[index];
            if (isCorrect) score += 1;
            breakdown.push({ questionId: q.id, isCorrect, correctOption: q.correctOption });
        });

        const pointsEarned = score * 10;
        // Gamification disabled: awaiting Redis re-integration

        return { score, total: quiz.questions.length, breakdown, pointsEarned };
    }
}
