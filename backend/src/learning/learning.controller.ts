import { Controller, Post, Get, Delete, Body, Param, UseGuards, Request } from '@nestjs/common';
import { LearningService } from './learning.service';
import { AiContentService } from './ai-content.service';
import { CreateSubjectDto, CreateTopicDto, CreateLessonDto, SubmitLessonDto, GenerateAiLevelsDto } from './dto/learning.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { Role } from '@prisma/client';

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
    @Delete('topics/:id')
    async deleteTopic(@Param('id') id: string) {
        return this.learningService.deleteTopic(id);
    }

    @Roles(Role.ADMIN)
    @Post('lessons')
    async createLesson(@Body() dto: CreateLessonDto) {
        return this.learningService.createLesson(dto);
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
    @Post('lessons/:id') // Using POST to act as PATCH or PUT easily from Axios without CORS patch issues
    async updateLesson(@Param('id') id: string, @Body() dto: Partial<CreateLessonDto>) {
        return this.learningService.updateLesson(id, dto);
    }
}

