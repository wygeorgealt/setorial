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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GamificationService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma.service");
const ioredis_1 = __importDefault(require("ioredis"));
let GamificationService = class GamificationService {
    prisma;
    redis;
    constructor(prisma) {
        this.prisma = prisma;
        this.redis = new ioredis_1.default(process.env.REDIS_URL || 'redis://localhost:6379');
    }
    onModuleDestroy() {
        this.redis.disconnect();
    }
    async awardPoints(userId, points, action) {
        await this.prisma.pointsLedger.create({
            data: { userId, points, action },
        });
        await this.redis.zincrby('leaderboard:global', points, userId);
    }
    async incrementStreak(userId) {
        const key = `streak:${userId}`;
        const today = new Date().toISOString().split('T')[0];
        const lastActive = await this.redis.hget(key, 'lastActive');
        let currentStreak = parseInt(await this.redis.hget(key, 'count') || '0', 10);
        if (lastActive === today) {
            return currentStreak;
        }
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = yesterday.toISOString().split('T')[0];
        if (lastActive === yesterdayStr) {
            currentStreak++;
        }
        else {
            currentStreak = 1;
        }
        await this.redis.hset(key, 'count', currentStreak);
        await this.redis.hset(key, 'lastActive', today);
        return currentStreak;
    }
    async getLeaderboard(limit = 10) {
        return this.redis.zrevrange('leaderboard:global', 0, limit - 1, 'WITHSCORES');
    }
};
exports.GamificationService = GamificationService;
exports.GamificationService = GamificationService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], GamificationService);
//# sourceMappingURL=gamification.service.js.map