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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LearningController = void 0;
const common_1 = require("@nestjs/common");
const cache_manager_1 = require("@nestjs/cache-manager");
const learning_service_1 = require("./learning.service");
const ai_content_service_1 = require("./ai-content.service");
const learning_dto_1 = require("./dto/learning.dto");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
const roles_guard_1 = require("../auth/roles.guard");
const roles_decorator_1 = require("../auth/roles.decorator");
const client_1 = require("@prisma/client");
const platform_express_1 = require("@nestjs/platform-express");
let LearningController = class LearningController {
    learningService;
    aiContentService;
    constructor(learningService, aiContentService) {
        this.learningService = learningService;
        this.aiContentService = aiContentService;
    }
    async generateAiLevels(dto) {
        return this.aiContentService.generateLevelsForTopic(dto.subjectId, dto.topicName, dto.numLevels);
    }
    async generateAiMock(dto) {
        return this.aiContentService.generateMockExam(dto.subjectId, dto.title, dto.numQuestions);
    }
    async regenerateLesson(id) {
        return this.aiContentService.regenerateLesson(id);
    }
    async createSubject(dto) {
        return this.learningService.createSubject(dto);
    }
    async deleteSubject(id) {
        return this.learningService.deleteSubject(id);
    }
    async getSubjects() {
        return this.learningService.getSubjects();
    }
    async getSubject(id, req) {
        return this.learningService.getSubjectPathway(id, req.user.userId);
    }
    async getLesson(id) {
        return this.learningService.getLesson(id);
    }
    async submitLesson(req, dto) {
        return this.learningService.submitLesson(req.user.userId, dto);
    }
    async updateLesson(id, dto, video) {
        const updateData = { ...dto };
        if (typeof updateData.questions === 'string') {
            updateData.questions = JSON.parse(updateData.questions);
        }
        return this.learningService.updateLessonWithVideo(id, updateData, video);
    }
};
exports.LearningController = LearningController;
__decorate([
    (0, roles_decorator_1.Roles)(client_1.Role.ADMIN),
    (0, common_1.Post)('ai/generate-levels'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [learning_dto_1.GenerateAiLevelsDto]),
    __metadata("design:returntype", Promise)
], LearningController.prototype, "generateAiLevels", null);
__decorate([
    (0, roles_decorator_1.Roles)(client_1.Role.ADMIN),
    (0, common_1.Post)('ai/generate-mock'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], LearningController.prototype, "generateAiMock", null);
__decorate([
    (0, roles_decorator_1.Roles)(client_1.Role.ADMIN),
    (0, common_1.Post)('lessons/:id/regenerate'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], LearningController.prototype, "regenerateLesson", null);
__decorate([
    (0, roles_decorator_1.Roles)(client_1.Role.ADMIN),
    (0, common_1.Post)('subjects'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [learning_dto_1.CreateSubjectDto]),
    __metadata("design:returntype", Promise)
], LearningController.prototype, "createSubject", null);
__decorate([
    (0, roles_decorator_1.Roles)(client_1.Role.ADMIN),
    (0, common_1.Delete)('subjects/:id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], LearningController.prototype, "deleteSubject", null);
__decorate([
    (0, common_1.Get)('subjects'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], LearningController.prototype, "getSubjects", null);
__decorate([
    (0, common_1.Get)('subjects/:id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], LearningController.prototype, "getSubject", null);
__decorate([
    (0, common_1.Get)('lessons/:id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], LearningController.prototype, "getLesson", null);
__decorate([
    (0, common_1.Post)('lessons/submit'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, learning_dto_1.SubmitLessonDto]),
    __metadata("design:returntype", Promise)
], LearningController.prototype, "submitLesson", null);
__decorate([
    (0, roles_decorator_1.Roles)(client_1.Role.ADMIN),
    (0, common_1.Post)('lessons/:id'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('video')),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.UploadedFile)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", Promise)
], LearningController.prototype, "updateLesson", null);
exports.LearningController = LearningController = __decorate([
    (0, common_1.Controller)('learning'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, common_1.UseInterceptors)(cache_manager_1.CacheInterceptor),
    __metadata("design:paramtypes", [learning_service_1.LearningService,
        ai_content_service_1.AiContentService])
], LearningController);
//# sourceMappingURL=learning.controller.js.map