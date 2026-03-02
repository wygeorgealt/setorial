import { Controller, Post, Get, Body, Param, UseGuards, Request } from '@nestjs/common';
import { LearningService } from './learning.service';
import { CreateSubjectDto, CreateTopicDto, CreateLessonDto, CreateQuizDto, SubmitQuizDto } from './dto/learning.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { Role } from '@prisma/client';

@Controller('learning')
@UseGuards(JwtAuthGuard, RolesGuard)
export class LearningController {
    constructor(private readonly learningService: LearningService) { }

    @Roles(Role.ADMIN)
    @Post('subjects')
    async createSubject(@Body() dto: CreateSubjectDto) {
        return this.learningService.createSubject(dto);
    }

    @Roles(Role.ADMIN)
    @Post('topics')
    async createTopic(@Body() dto: CreateTopicDto) {
        return this.learningService.createTopic(dto);
    }

    @Roles(Role.ADMIN)
    @Post('lessons')
    async createLesson(@Body() dto: CreateLessonDto) {
        return this.learningService.createLesson(dto);
    }

    @Roles(Role.ADMIN)
    @Post('quizzes')
    async createQuiz(@Body() dto: CreateQuizDto) {
        return this.learningService.createQuiz(dto);
    }

    @Get('subjects')
    async getSubjects() {
        return this.learningService.getSubjects();
    }

    @Get('subjects/:id')
    async getSubject(@Param('id') id: string) {
        return this.learningService.getSubject(id);
    }

    @Get('quizzes/:id')
    async getQuiz(@Param('id') id: string) {
        return this.learningService.getQuiz(id);
    }

    @Post('quizzes/submit')
    async submitQuiz(@Request() req: any, @Body() dto: SubmitQuizDto) {
        return this.learningService.submitQuiz(req.user.userId, dto);
    }
}
