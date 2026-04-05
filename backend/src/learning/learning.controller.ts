import { Controller, Post, Get, Delete, Body, Param, UseGuards, Request, UseInterceptors, UploadedFile } from '@nestjs/common';
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

