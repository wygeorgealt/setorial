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
const gamification_service_1 = require("../gamification/gamification.service");
const store_service_1 = require("../store/store.service");
const upload_service_1 = require("../upload/upload.service");
let LearningService = class LearningService {
    prisma;
    gamificationService;
    storeService;
    uploadService;
    constructor(prisma, gamificationService, storeService, uploadService) {
        this.prisma = prisma;
        this.gamificationService = gamificationService;
        this.storeService = storeService;
        this.uploadService = uploadService;
    }
    async createSubject(dto) {
        return this.prisma.subject.create({ data: dto });
    }
    async deleteSubject(id) {
        return this.prisma.$transaction(async (tx) => {
            await tx.topic.deleteMany({ where: { subjectId: id } });
            return tx.subject.delete({ where: { id } });
        });
    }
    async createTopic(dto) {
        return this.prisma.topic.create({ data: dto });
    }
    async deleteTopic(id) {
        return this.prisma.topic.delete({ where: { id } });
    }
    async createLesson(dto) {
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
    async updateLesson(id, dto) {
        return this.prisma.$transaction(async (tx) => {
            if (dto.questions) {
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
    async getSubjectPathway(id, userId) {
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
        if (!subject)
            throw new common_1.NotFoundException('Subject not found');
        const annotatedTopics = subject.topics.map((topic) => {
            let foundCurrent = false;
            const annotatedLessons = topic.lessons.map((lesson) => {
                const isCompleted = lesson.userProgress && lesson.userProgress.length > 0;
                let status = 'LOCKED';
                if (isCompleted) {
                    status = 'COMPLETED';
                }
                else if (!foundCurrent) {
                    status = 'CURRENT';
                    foundCurrent = true;
                }
                const { userProgress, ...rest } = lesson;
                return { ...rest, status, score: isCompleted ? userProgress[0].score : null };
            });
            return { ...topic, lessons: annotatedLessons };
        });
        return { ...subject, topics: annotatedTopics };
    }
    async getLesson(id) {
        const lesson = await this.prisma.lesson.findUnique({
            where: { id },
            include: { questions: { select: { id: true, text: true, options: true } } },
        });
        if (!lesson)
            throw new common_1.NotFoundException('Lesson not found');
        if (lesson.videoUrl) {
            lesson.videoUrl = await this.uploadService.getPresignedUrl(lesson.videoUrl, 3600);
        }
        return lesson;
    }
    async updateLessonWithVideo(id, dto, video) {
        return this.prisma.$transaction(async (tx) => {
            let videoUrl = dto.videoUrl;
            if (video) {
                videoUrl = await this.uploadService.uploadFile(video, 'videos');
            }
            if (dto.questions) {
                await tx.question.deleteMany({ where: { lessonId: id } });
            }
            return tx.lesson.update({
                where: { id },
                data: {
                    ...(dto.name && { name: dto.name }),
                    ...(dto.content && { content: dto.content }),
                    ...(dto.rewardPoints && { rewardPoints: Number(dto.rewardPoints) }),
                    videoUrl,
                    ...(dto.questions && {
                        questions: {
                            create: dto.questions.map((q, index) => ({
                                text: q.text,
                                options: q.options,
                                correctOption: Number(q.correctOption),
                            }))
                        }
                    })
                },
                include: { questions: true }
            });
        });
    }
    async submitLesson(userId, dto) {
        const lesson = await this.prisma.lesson.findUnique({
            where: { id: dto.lessonId },
            include: {
                questions: true,
                topic: { include: { subject: true } }
            },
        });
        if (!lesson)
            throw new common_1.NotFoundException('Lesson not found');
        let score = 0;
        const breakdown = [];
        lesson.questions.forEach((q, index) => {
            const isCorrect = q.correctOption === dto.answers[index];
            if (isCorrect)
                score += 1;
            breakdown.push({ questionId: q.id, isCorrect, correctOption: q.correctOption });
        });
        const passThreshold = Math.ceil(lesson.questions.length * 0.7);
        const passed = score >= passThreshold || lesson.questions.length === 0;
        let pointsEarned = 0;
        let isFirstCompletion = false;
        if (passed) {
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
                if (hasBoost)
                    pointsEarned *= 2;
                await this.gamificationService.awardPoints(userId, pointsEarned, hasBoost ? 'Lesson Completion (2x Boost)' : 'Lesson Completion', lesson.topic.subjectId);
            }
        }
        const currentStreak = await this.gamificationService.incrementStreak(userId);
        await this.gamificationService.checkAndAwardBadges(userId, {
            streak: currentStreak,
            score: score,
            total: lesson.questions.length
        });
        await this.prisma.user.update({
            where: { id: userId },
            data: { lastActiveAt: new Date() }
        });
        return { score, total: lesson.questions.length, breakdown, pointsEarned, passed, isFirstCompletion };
    }
};
exports.LearningService = LearningService;
exports.LearningService = LearningService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        gamification_service_1.GamificationService,
        store_service_1.StoreService,
        upload_service_1.UploadService])
], LearningService);
//# sourceMappingURL=learning.service.js.map