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
        // Ensure Subject exists
        const subject = await this.prisma.subject.findUnique({ where: { id: subjectId } });
        if (!subject) throw new Error('Subject not found');

        // Create or find Topic
        let topic = await this.prisma.topic.findFirst({
            where: { name: topicName, subjectId }
        });
        if (!topic) {
            topic = await this.prisma.topic.create({
                data: { name: topicName, subjectId }
            });
        }

        const prompt = `You are an expert tutor creating a Duolingo-style learning pathway for the subject "${subject.name}", focusing on the topic "${topicName}".
Generate exactly ${numLevels} levels/lessons in sequential order of difficulty.
For each lesson:
1. Provide an engaging, easy-to-understand lesson using Markdown (keep it concise, ~3-4 short paragraphs, maybe bullet points).
2. Generate 3 to 5 multiple-choice questions based entirely on that lesson content.

You MUST respond ONLY with a valid JSON object containing a "levels" array matching this exact structure. Do not wrap in markdown tags:
{
  "levels": [
    {
      "name": "Title of the lesson",
      "order": 1,
      "content": "Markdown text teaching the concept in a simple, engaging way",
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

        try {
            const response = await axios.post(
                'https://api.deepseek.com/chat/completions',
                {
                    model: 'deepseek-chat',
                    messages: [
                        { role: 'system', content: 'You are a helpful JSON-only generating assistant.' },
                        { role: 'user', content: prompt }
                    ],
                    response_format: { type: 'json_object' }
                },
                {
                    headers: { 'Authorization': `Bearer ${this.deepseekKey}` }
                }
            );

            let responseText = response.data.choices[0].message.content.trim();
            
            // Clean markdown wrapping if Deepseek still returns it
            if (responseText.startsWith('\`\`\`json')) {
                responseText = responseText.replace(/^\`\`\`json\s*/, '').replace(/\s*\`\`\`$/, '');
            } else if (responseText.startsWith('\`\`\`')) {
                responseText = responseText.replace(/^\`\`\`\s*/, '').replace(/\s*\`\`\`$/, '');
            }

            const parsedObj = JSON.parse(responseText);
            const levelsData = parsedObj.levels || [];

            const createdLevels = [];
            for (const level of levelsData) {
                const newLesson = await this.prisma.lesson.create({
                    data: {
                        name: level.name,
                        topicId: topic.id,
                        content: level.content,
                        order: level.order,
                        rewardPoints: 10,
                        questions: {
                            create: level.questions.map((q: any) => ({
                                text: q.text,
                                options: q.options,
                                correctOption: q.correctOption
                            }))
                        }
                    },
                    include: { questions: true }
                });
                createdLevels.push(newLesson);
            }

            return {
                message: `Successfully generated and saved ${createdLevels.length} levels for topic ${topicName} via DeepSeek.`,
                topic,
                levels: createdLevels
            };

        } catch (error) {
            this.logger.error(`AI Generation failed: ${error.message}`);
            throw new Error('Failed to generate AI content');
        }
    }
}
