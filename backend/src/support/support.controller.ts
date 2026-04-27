import { Controller, Post, Get, Body, UseGuards, Request } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('support')
@UseGuards(JwtAuthGuard)
export class SupportController {
    constructor(private prisma: PrismaService) {}

    @Post('message')
    async sendMessage(@Request() req: any, @Body() data: { subject: string, message: string }) {
        return this.prisma.supportMessage.create({
            data: {
                userId: req.user.userId,
                subject: data.subject,
                message: data.message,
            },
        });
    }

    @Get('my-messages')
    async getMyMessages(@Request() req: any) {
        return this.prisma.supportMessage.findMany({
            where: { userId: req.user.userId },
            orderBy: { createdAt: 'desc' },
        });
    }
}
