import { Controller, Post, Get, Delete, Body, Param, Query, UseGuards, Request, UseInterceptors, UploadedFile } from '@nestjs/common';
import { CacheInterceptor } from '@nestjs/cache-manager';
import { LearningService } from './learning.service';
import { AiContentService } from './ai-content.service';
import { CreateSubjectDto, CreateTopicDto, CreateLessonDto, SubmitLessonDto, GenerateAiLevelsDto } from './dto/learning.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { Role } from '@prisma/client';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('learning')
@UseGuards(JwtAuthGuard, RolesGuard)
export class LearningController {
    constructor(
        private readonly learningService: LearningService,
        private readonly aiContentService: AiContentService
    ) { }

    @Roles(Role.ADMIN)
    @Post('ai/generate-levels')
    async generateAiLevels(@Body() dto: GenerateAiLevelsDto) {
        return this.aiContentService.generateLevelsForTopic(dto.subjectId, dto.topicName, dto.numLevels);
    }

    @Roles(Role.ADMIN)
    @Post('ai/generate-full-subject')
    async generateFullSubject(@Body() dto: { subjectId: string, numTopics: number }) {
        return this.aiContentService.queueFullSyllabusGeneration(dto.subjectId, dto.numTopics);
    }

    @Roles(Role.ADMIN)
    @Post('ai/generate-mock')
    async generateAiMock(@Body() dto: { subjectId: string, title: string, numQuestions?: number }) {
        return this.aiContentService.generateMockExam(dto.subjectId, dto.title, dto.numQuestions);
    }

    @Roles(Role.ADMIN)
    @Post('lessons/:id/regenerate')
    async regenerateLesson(@Param('id') id: string) {
        return this.aiContentService.regenerateLesson(id);
    }

    @Roles(Role.ADMIN)
    @Post('subjects')
    async createSubject(@Body() dto: CreateSubjectDto) {
        return this.learningService.createSubject(dto);
    }

    @Roles(Role.ADMIN)
    @Delete('subjects/:id')
    async deleteSubject(@Param('id') id: string) {
        return this.learningService.deleteSubject(id);
    }

    @Roles(Role.ADMIN)
    @Post('topics')
    async createTopic(@Body() dto: CreateTopicDto) {
        return this.learningService.createTopic(dto);
    }

    @Roles(Role.ADMIN)
    @Post('topics/:id')
    async updateTopic(@Param('id') id: string, @Body() dto: any) {
        return this.learningService.updateTopic(id, dto);
    }

    @Roles(Role.ADMIN)
    @Delete('topics/:id')
    async deleteTopic(@Param('id') id: string) {
        return this.learningService.deleteTopic(id);
    }

    @Get('search')
    async search(@Query('q') query: string) {
        return this.learningService.searchSubjects(query);
    }

    @Get('subjects')
    async getSubjects() {
        return this.learningService.getSubjects();
    }

    @Get('subjects/:id')
    async getSubject(@Param('id') id: string, @Request() req: any) {
        return this.learningService.getSubjectPathway(id, req.user.userId);
    }

    @Get('lessons/:id')
    async getLesson(@Param('id') id: string) {
        return this.learningService.getLesson(id);
    }

    @Roles(Role.ADMIN)
    @Post('lessons')
    async createLesson(@Body() dto: CreateLessonDto) {
        return this.learningService.createLesson(dto);
    }

    @Post('lessons/submit')
    async submitLesson(@Request() req: any, @Body() dto: SubmitLessonDto) {
        return this.learningService.submitLesson(req.user.userId, dto);
    }

    @Roles(Role.ADMIN)
    @Post('lessons/:id')
    @UseInterceptors(FileInterceptor('video'))
    async updateLesson(
        @Param('id') id: string,
        @Body() dto: any,
        @UploadedFile() video?: Express.Multer.File
    ) {
        const updateData = { ...dto };
        // If nested JSON strings come in from FormData, parse them
        if (typeof updateData.questions === 'string') {
            updateData.questions = JSON.parse(updateData.questions);
        }
        return this.learningService.updateLessonWithVideo(id, updateData, video);
    }
}

