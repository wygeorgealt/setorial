import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import axios from 'axios';

@Injectable()
export class AiContentService {
    private readonly logger = new Logger(AiContentService.name);
    // User requested specifically to use this DeepSeek key
    private readonly deepseekKey = 'sk-1e93663ccdbd4d4e9ee1f6144a7271d3';

    constructor(
        private prisma: PrismaService,
    ) { }

    async generateLevelsForTopic(subjectId: string, topicName: string, numLevels: number = 3) {
        const subject = await this.prisma.subject.findUnique({ where: { id: subjectId } });
        if (!subject) throw new Error('Subject not found');

        let topic = await this.prisma.topic.findFirst({
            where: { name: topicName, subjectId }
        });
        if (!topic) {
            topic = await this.prisma.topic.create({
                data: { name: topicName, subjectId }
            });
        }

        const prompt = `You are an expert academic content creator. Generate a textbook-length learning pathway for the subject "${subject.name}", focusing on "${topicName}".
Generate exactly ${numLevels} levels/lessons in sequential order.
For each lesson:
1. Provide a comprehensive, high-depth lesson in Markdown. It must feel like a quality textbook chapter (~800-1200 words). Include sections like "Introduction", "Core Principles", "Detailed Analysis", "Practical Examples", and "Summary".
2. Generate 5 challenging multiple-choice questions based on the depth of the lesson.

Respond ONLY with a valid JSON object. Do not include markdown tags:
{
  "levels": [
    {
      "name": "Detailed Chapter Title",
      "order": 1,
      "content": "Full textbook-style markdown content...",
      "questions": [
        {
          "text": "The question text",
          "options": ["Option 1", "Option 2", "Option 3", "Option 4"],
          "correctOption": 0
        }
      ]
    }
  ]
}`;

        return this.executeGeneration(prompt, async (data) => {
            const createdLevels = await Promise.all(
                data.levels.map((level: any) =>
                    this.prisma.lesson.create({
                        data: {
                            name: level.name,
                            topicId: topic.id,
                            content: level.content,
                            order: level.order,
                            questions: {
                                create: level.questions.map((q: any) => ({
                                    text: q.text,
                                    options: q.options,
                                    correctOption: q.correctOption
                                }))
                            }
                        },
                        include: { questions: true }
                    })
                )
            );
            return { topic, levels: createdLevels };
        });
    }

    async regenerateLesson(lessonId: string) {
        const lesson = await this.prisma.lesson.findUnique({
            where: { id: lessonId },
            include: { topic: { include: { subject: true } } }
        });
        if (!lesson) throw new Error('Lesson not found');

        const prompt = `You are rewriting a textbook chapter for "${lesson.topic.subject.name}". 
Topic: "${lesson.topic.name}".
Specific Chapter Title: "${lesson.name}".
Provide a fresh, deep, textbook-style content (~1000 words) and 5 new challenging questions.

Respond ONLY with valid JSON:
{
  "name": "${lesson.name}",
  "content": "New textbook markdown...",
  "questions": [ { "text": "...", "options": [...], "correctOption": 0 } ]
}`;

        return this.executeGeneration(prompt, async (data) => {
            return await this.prisma.$transaction(async (tx) => {
                await tx.question.deleteMany({ where: { lessonId } });
                return tx.lesson.update({
                    where: { id: lessonId },
                    data: {
                        content: data.content,
                        questions: {
                            create: data.questions.map((q: any) => ({
                                text: q.text,
                                options: q.options,
                                correctOption: q.correctOption
                            }))
                        }
                    },
                    include: { questions: true }
                });
            });
        });
    }

    async generateMockExam(subjectId: string, title: string, numQuestions: number = 30) {
        const subject = await this.prisma.subject.findUnique({ where: { id: subjectId } });
        if (!subject) throw new Error('Subject not found');

        const prompt = `Create a professional standardized mock exam for the subject "${subject.name}".
Title: "${title}".
Generate exactly ${numQuestions} diverse, high-quality multiple choice questions covering various topics in this subject.

Respond ONLY with valid JSON:
{
  "title": "${title}",
  "description": "Comprehensive mock exam for ${subject.name}",
  "durationMinutes": ${Math.ceil(numQuestions * 1.5)},
  "questions": [
    {
      "text": "Question text...",
      "options": ["A", "B", "C", "D"],
      "correctOption": 0
    }
  ]
}`;

        return this.executeGeneration(prompt, async (data) => {
            return this.prisma.mockExam.create({
                data: {
                    title: data.title,
                    description: data.description,
                    durationMinutes: data.durationMinutes,
                    questions: {
                        create: data.questions.map((q: any) => ({
                            text: q.text,
                            options: q.options,
                            correctOption: q.correctOption
                        }))
                    }
                },
                include: { questions: true }
            });
        });
    }

    private async executeGeneration(prompt: string, saveCallback: (data: any) => Promise<any>) {
        try {
            const response = await axios.post(
                'https://api.deepseek.com/chat/completions',
                {
                    model: 'deepseek-chat',
                    messages: [
                        { role: 'system', content: 'You are a professional academic JSON generator. You provide deep, accurate, and extensive educational content.' },
                        { role: 'user', content: prompt }
                    ],
                    response_format: { type: 'json_object' }
                },
                { headers: { 'Authorization': `Bearer ${this.deepseekKey}` } }
            );

            let text = response.data.choices[0].message.content.trim();
            if (text.startsWith('\`\`\`json')) text = text.replace(/^\`\`\`json\s*/, '').replace(/\s*\`\`\`$/, '');
            else if (text.startsWith('\`\`\`')) text = text.replace(/^\`\`\`\s*/, '').replace(/\s*\`\`\`$/, '');

            const data = JSON.parse(text);
            return await saveCallback(data);
        } catch (error) {
            this.logger.error(`AI Generation failed: ${error.message}`, error.stack);
            throw new Error('Failed to generate AI content');
        }
    }
}
