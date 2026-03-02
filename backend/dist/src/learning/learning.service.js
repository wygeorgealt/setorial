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
exports.LearningService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma.service");
let LearningService = class LearningService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async createSubject(dto) {
        return this.prisma.subject.create({ data: dto });
    }
    async createTopic(dto) {
        return this.prisma.topic.create({ data: dto });
    }
    async createLesson(dto) {
        return this.prisma.lesson.create({ data: dto });
    }
    async createQuiz(dto) {
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
    async getSubject(id) {
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
    async getQuiz(id) {
        const quiz = await this.prisma.quiz.findUnique({
            where: { id },
            include: { questions: { select: { id: true, text: true, options: true } } },
        });
        if (!quiz)
            throw new common_1.NotFoundException('Quiz not found');
        return quiz;
    }
    async submitQuiz(userId, dto) {
        const quiz = await this.prisma.quiz.findUnique({
            where: { id: dto.quizId },
            include: { questions: true },
        });
        if (!quiz)
            throw new common_1.NotFoundException('Quiz not found');
        let score = 0;
        const breakdown = [];
        quiz.questions.forEach((q, index) => {
            const isCorrect = q.correctOption === dto.answers[index];
            if (isCorrect)
                score += 1;
            breakdown.push({ questionId: q.id, isCorrect, correctOption: q.correctOption });
        });
        const pointsEarned = score * 10;
        return { score, total: quiz.questions.length, breakdown, pointsEarned };
    }
};
exports.LearningService = LearningService;
exports.LearningService = LearningService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], LearningService);
//# sourceMappingURL=learning.service.js.map