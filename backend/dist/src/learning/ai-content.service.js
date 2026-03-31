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
var AiContentService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AiContentService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma.service");
const generative_ai_1 = require("@google/generative-ai");
let AiContentService = AiContentService_1 = class AiContentService {
    prisma;
    logger = new common_1.Logger(AiContentService_1.name);
    genAI;
    constructor(prisma) {
        this.prisma = prisma;
        const apiKey = process.env.GEMINI_API_KEY || 'MISSING_API_KEY';
        this.genAI = new generative_ai_1.GoogleGenerativeAI(apiKey);
    }
    async generateLevelsForTopic(subjectId, topicName, numLevels = 3) {
        const subject = await this.prisma.subject.findUnique({ where: { id: subjectId } });
        if (!subject)
            throw new Error('Subject not found');
        let topic = await this.prisma.topic.findFirst({
            where: { name: topicName, subjectId }
        });
        if (!topic) {
            topic = await this.prisma.topic.create({
                data: { name: topicName, subjectId }
            });
        }
        const model = this.genAI.getGenerativeModel({
            model: 'gemini-2.5-flash',
            generationConfig: {
                responseMimeType: 'application/json',
                responseSchema: {
                    type: generative_ai_1.Type.ARRAY,
                    description: "List of educational levels/lessons",
                    items: {
                        type: generative_ai_1.Type.OBJECT,
                        properties: {
                            name: { type: generative_ai_1.Type.STRING, description: "Title of the lesson" },
                            order: { type: generative_ai_1.Type.INTEGER, description: "Sequence order (1, 2, 3...)" },
                            content: { type: generative_ai_1.Type.STRING, description: "Markdown text teaching the concept in a simple, engaging way" },
                            questions: {
                                type: generative_ai_1.Type.ARRAY,
                                description: "Questions to test understanding of the content",
                                items: {
                                    type: generative_ai_1.Type.OBJECT,
                                    properties: {
                                        text: { type: generative_ai_1.Type.STRING, description: "The question text" },
                                        options: {
                                            type: generative_ai_1.Type.ARRAY,
                                            items: { type: generative_ai_1.Type.STRING },
                                            description: "4 possible answer options"
                                        },
                                        correctOption: { type: generative_ai_1.Type.INTEGER, description: "0-indexed position of the correct option" }
                                    },
                                    required: ["text", "options", "correctOption"]
                                }
                            }
                        },
                        required: ["name", "order", "content", "questions"]
                    }
                }
            }
        });
        const prompt = `You are an expert tutor creating a Duolingo-style learning pathway for the subject "${subject.name}", focusing on the topic "${topicName}".
Generate exactly ${numLevels} levels/lessons in sequential order of difficulty.
For each lesson:
1. Provide an engaging, easy-to-understand lesson using Markdown (keep it concise, ~3-4 short paragraphs, maybe bullet points).
2. Generate 3 to 5 multiple-choice questions based entirely on that lesson content.

Ensure the output is strictly following the JSON schema provided.`;
        try {
            const result = await model.generateContent(prompt);
            const responseText = result.response.text();
            const levelsData = JSON.parse(responseText);
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
                            create: level.questions.map(q => ({
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
                message: `Successfully generated and saved ${createdLevels.length} levels for topic ${topicName}.`,
                topic,
                levels: createdLevels
            };
        }
        catch (error) {
            this.logger.error(`AI Generation failed: ${error.message}`);
            throw new Error('Failed to generate AI content');
        }
    }
};
exports.AiContentService = AiContentService;
exports.AiContentService = AiContentService = AiContentService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], AiContentService);
//# sourceMappingURL=ai-content.service.js.map