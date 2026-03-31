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
const learning_service_1 = require("./learning.service");
const ai_content_service_1 = require("./ai-content.service");
const learning_dto_1 = require("./dto/learning.dto");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
const roles_guard_1 = require("../auth/roles.guard");
const roles_decorator_1 = require("../auth/roles.decorator");
const client_1 = require("@prisma/client");
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
    async createSubject(dto) {
        return this.learningService.createSubject(dto);
    }
    async deleteSubject(id) {
        return this.learningService.deleteSubject(id);
    }
    async createTopic(dto) {
        return this.learningService.createTopic(dto);
    }
    async deleteTopic(id) {
        return this.learningService.deleteTopic(id);
    }
    async createLesson(dto) {
        return this.learningService.createLesson(dto);
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
    (0, roles_decorator_1.Roles)(client_1.Role.ADMIN),
    (0, common_1.Post)('topics'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [learning_dto_1.CreateTopicDto]),
    __metadata("design:returntype", Promise)
], LearningController.prototype, "createTopic", null);
__decorate([
    (0, roles_decorator_1.Roles)(client_1.Role.ADMIN),
    (0, common_1.Delete)('topics/:id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], LearningController.prototype, "deleteTopic", null);
__decorate([
    (0, roles_decorator_1.Roles)(client_1.Role.ADMIN),
    (0, common_1.Post)('lessons'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [learning_dto_1.CreateLessonDto]),
    __metadata("design:returntype", Promise)
], LearningController.prototype, "createLesson", null);
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
exports.LearningController = LearningController = __decorate([
    (0, common_1.Controller)('learning'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    __metadata("design:paramtypes", [learning_service_1.LearningService,
        ai_content_service_1.AiContentService])
], LearningController);
//# sourceMappingURL=learning.controller.js.map