import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { Prisma, User } from '@prisma/client';

@Injectable()
export class UsersService {
    constructor(private prisma: PrismaService) { }

    async createUser(data: Prisma.UserCreateInput): Promise<User> {
        return this.prisma.user.create({ data });
    }

    async findByEmail(email: string): Promise<User | null> {
        return this.prisma.user.findUnique({ where: { email } });
    }

    async findById(id: string): Promise<User | null> {
        return this.prisma.user.findUnique({ where: { id } });
    }

    async getPoints(userId: string): Promise<number> {
        const result = await this.prisma.pointsLedger.aggregate({
            where: { userId },
            _sum: { points: true },
        });
        return result._sum.points || 0;
    }

    async updateProfile(userId: string, data: { name?: string }) {
        return this.prisma.user.update({
            where: { id: userId },
            data,
        });
    }

    async getLearningProgress(userId: string) {
        // Get all subjects with their topics and count quiz submissions
        const subjects = await this.prisma.subject.findMany({
            include: {
                topics: {
                    include: {
                        lessons: {
                            include: {
                                quizzes: {
                                    include: {
                                        _count: {
                                            select: { questions: true }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        });

        // Get user's quiz submissions from points ledger
        const userPoints = await this.prisma.pointsLedger.findMany({
            where: { userId },
            select: { action: true, createdAt: true }
        });

        return subjects.map(subject => {
            const totalQuizzes = subject.topics.reduce((sum, topic) =>
                sum + topic.lessons.reduce((lSum, lesson) => lSum + lesson.quizzes.length, 0), 0
            );
            const completed = userPoints.filter(p =>
                p.action?.toLowerCase().includes(subject.name.toLowerCase())
            ).length;

            return {
                id: subject.id,
                name: subject.name,
                totalTopics: subject.topics.length,
                totalQuizzes,
                completedQuizzes: completed,
                progress: totalQuizzes > 0 ? Math.round((completed / totalQuizzes) * 100) : 0,
            };
        });
    }
}
