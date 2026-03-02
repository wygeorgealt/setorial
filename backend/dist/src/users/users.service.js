"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UsersService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma.service");
let UsersService = class UsersService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async createUser(data) {
        return this.prisma.user.create({ data });
    }
    async findByEmail(email) {
        return this.prisma.user.findUnique({ where: { email } });
    }
    async findById(id) {
        return this.prisma.user.findUnique({ where: { id } });
    }
    async getPoints(userId) {
        const result = await this.prisma.pointsLedger.aggregate({
            where: { userId },
            _sum: { points: true },
        });
        return result._sum.points || 0;
    }
    async updateProfile(userId, data) {
        return this.prisma.user.update({
            where: { id: userId },
            data,
        });
    }
    async getLearningProgress(userId) {
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
        const userPoints = await this.prisma.pointsLedger.findMany({
            where: { userId },
            select: { action: true, createdAt: true }
        });
        return subjects.map(subject => {
            const totalQuizzes = subject.topics.reduce((sum, topic) => sum + topic.lessons.reduce((lSum, lesson) => lSum + lesson.quizzes.length, 0), 0);
            const completed = userPoints.filter(p => p.action?.toLowerCase().includes(subject.name.toLowerCase())).length;
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
};
exports.UsersService = UsersService;
exports.UsersService = UsersService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], UsersService);
//# sourceMappingURL=users.service.js.map