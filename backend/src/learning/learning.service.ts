import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { CreateSubjectDto, CreateTopicDto, CreateLessonDto, SubmitLessonDto } from './dto/learning.dto';
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

    async deleteSubject(id: string) {
        return this.prisma.$transaction(async (tx) => {
            // Because Topic -> Subject relation missing onDelete: Cascade,
            // we delete topics first. Lessons cascade automatically from Topic.
            await tx.topic.deleteMany({ where: { subjectId: id } });
            return tx.subject.delete({ where: { id } });
        });
    }

    async createTopic(dto: CreateTopicDto) {
        return this.prisma.topic.create({ data: dto });
    }

    async deleteTopic(id: string) {
        return this.prisma.topic.delete({ where: { id } });
    }

    async createLesson(dto: CreateLessonDto) {
        return this.prisma.lesson.create({
            data: {
                name: dto.name,
                topicId: dto.topicId,
                content: dto.content,
                order: dto.order ?? 1,
                rewardPoints: dto.rewardPoints ?? 10,
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

    async updateLesson(id: string, dto: Partial<CreateLessonDto>) {
        return this.prisma.$transaction(async (tx) => {
            if (dto.questions) {
                // Remove existing questions for full replacement
                await tx.question.deleteMany({ where: { lessonId: id } });
            }
            
            return tx.lesson.update({
                where: { id },
                data: {
                    ...(dto.name && { name: dto.name }),
                    ...(dto.content && { content: dto.content }),
                    ...(dto.rewardPoints && { rewardPoints: dto.rewardPoints }),
                    ...(dto.questions && {
                        questions: {
                            create: dto.questions.map(q => ({
                                text: q.text,
                                options: q.options,
                                correctOption: q.correctOption,
                            }))
                        }
                    })
                },
                include: { questions: true }
            });
        });
    }

    async getSubjects() {
        return this.prisma.subject.findMany({ 
            include: { 
                topics: {
                    include: {
                        lessons: {
                            orderBy: { order: 'asc' }
                        }
                    }
                } 
            } 
        });
    }

    async getSubjectPathway(id: string, userId: string) {
        const subject = await this.prisma.subject.findUnique({
            where: { id },
            include: {
                topics: {
                    include: {
                        lessons: {
                            orderBy: { order: 'asc' },
                            include: {
                                _count: { select: { questions: true } },
                                userProgress: {
                                    where: { userId }
                                }
                            }
                        }
                    }
                }
            }
        });

        if (!subject) throw new NotFoundException('Subject not found');

        // Annotate sequence status: 'COMPLETED', 'CURRENT' (unlocked), 'LOCKED'
        const annotatedTopics = subject.topics.map(topic => {
            let foundCurrent = false;

            const annotatedLessons = topic.lessons.map(lesson => {
                const isCompleted = lesson.userProgress && lesson.userProgress.length > 0;
                
                let status = 'LOCKED';
                if (isCompleted) {
                    status = 'COMPLETED';
                } else if (!foundCurrent) {
                    status = 'CURRENT'; // First incomplete lesson
                    foundCurrent = true;
                }

                // Remove userProgress array from output to clean up payload
                const { userProgress, ...rest } = lesson;
                return { ...rest, status, score: isCompleted ? userProgress[0].score : null };
            });

            return { ...topic, lessons: annotatedLessons };
        });

        return { ...subject, topics: annotatedTopics };
    }

    async getLesson(id: string) {
        const lesson = await this.prisma.lesson.findUnique({
            where: { id },
            include: { questions: { select: { id: true, text: true, options: true } } },
        });
        if (!lesson) throw new NotFoundException('Lesson not found');
        return lesson;
    }

    async submitLesson(userId: string, dto: SubmitLessonDto) {
        const lesson = await this.prisma.lesson.findUnique({
            where: { id: dto.lessonId },
            include: {
                questions: true,
                topic: { include: { subject: true } }
            },
        });

        if (!lesson) throw new NotFoundException('Lesson not found');

        let score = 0;
        const breakdown: any[] = [];

        lesson.questions.forEach((q, index) => {
            const isCorrect = q.correctOption === dto.answers[index];
            if (isCorrect) score += 1;
            breakdown.push({ questionId: q.id, isCorrect, correctOption: q.correctOption });
        });

        const passThreshold = Math.ceil(lesson.questions.length * 0.7); // 70% to pass
        const passed = score >= passThreshold || lesson.questions.length === 0;

        let pointsEarned = 0;
        let isFirstCompletion = false;

        if (passed) {
            // Check if user already completed it
            const existingProgress = await this.prisma.userProgress.findUnique({
                where: { userId_lessonId: { userId, lessonId: lesson.id } }
            });

            if (!existingProgress) {
                isFirstCompletion = true;
                await this.prisma.userProgress.create({
                    data: {
                        userId,
                        lessonId: lesson.id,
                        score: score
                    }
                });

                pointsEarned = lesson.rewardPoints;
                const hasBoost = await this.storeService.hasActiveBoost(userId);
                if (hasBoost) pointsEarned *= 2;

                // Award points
                await this.gamificationService.awardPoints(
                    userId,
                    pointsEarned,
                    hasBoost ? 'Lesson Completion (2x Boost)' : 'Lesson Completion',
                    lesson.topic.subjectId
                );
            }
        }

        // Just increment streak for activity, even if failed
        const currentStreak = await this.gamificationService.incrementStreak(userId);

        // Check badges
        await this.gamificationService.checkAndAwardBadges(userId, {
            streak: currentStreak,
            score: score,
            total: lesson.questions.length
        });

        // Bump lastActiveAt
        await this.prisma.user.update({
            where: { id: userId },
            data: { lastActiveAt: new Date() }
        });

        return { score, total: lesson.questions.length, breakdown, pointsEarned, passed, isFirstCompletion };
    }
}

