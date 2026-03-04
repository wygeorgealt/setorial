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
var UsersService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.UsersService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma.service");
const client_1 = require("@prisma/client");
const axios_1 = require("@nestjs/axios");
const rxjs_1 = require("rxjs");
let UsersService = UsersService_1 = class UsersService {
    prisma;
    httpService;
    logger = new common_1.Logger(UsersService_1.name);
    paystackKey = process.env.PAYSTACK_SECRET_KEY;
    constructor(prisma, httpService) {
        this.prisma = prisma;
        this.httpService = httpService;
    }
    async createUser(data) {
        return this.prisma.user.create({ data });
    }
    async findByEmail(email) {
        return this.prisma.user.findUnique({ where: { email } });
    }
    async findById(id) {
        return this.prisma.user.findUnique({ where: { id } });
    }
    async getPoints(userId) {
        const result = await this.prisma.pointsLedger.aggregate({
            where: { userId },
            _sum: { points: true },
        });
        return result._sum.points || 0;
    }
    async updateProfile(userId, data) {
        return this.prisma.user.update({
            where: { id: userId },
            data,
        });
    }
    async getLearningProgress(userId) {
        const subjects = await this.prisma.subject.findMany({
            include: {
                topics: {
                    include: {
                        lessons: {
                            include: {
                                quizzes: {
                                    include: {
                                        _count: {
                                            select: { questions: true }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        });
        const userPoints = await this.prisma.pointsLedger.findMany({
            where: { userId },
            select: { action: true, createdAt: true }
        });
        return subjects.map(subject => {
            const totalQuizzes = subject.topics.reduce((sum, topic) => sum + topic.lessons.reduce((lSum, lesson) => lSum + lesson.quizzes.length, 0), 0);
            const completed = userPoints.filter(p => p.action?.toLowerCase().includes(subject.name.toLowerCase())).length;
            return {
                id: subject.id,
                name: subject.name,
                totalTopics: subject.topics.length,
                totalQuizzes,
                completedQuizzes: completed,
                progress: totalQuizzes > 0 ? Math.round((completed / totalQuizzes) * 100) : 0,
            };
        });
    }
    async getBanks() {
        try {
            const response = await (0, rxjs_1.lastValueFrom)(this.httpService.get('https://api.paystack.co/bank?country=nigeria', {
                headers: { Authorization: `Bearer ${this.paystackKey}` },
            }));
            return response.data.data;
        }
        catch (error) {
            this.logger.error('Failed to fetch banks from Paystack', error);
            throw new common_1.BadRequestException('Could not fetch bank list');
        }
    }
    async resolveAccount(accountNumber, bankCode) {
        try {
            const response = await (0, rxjs_1.lastValueFrom)(this.httpService.get(`https://api.paystack.co/bank/resolve?account_number=${accountNumber}&bank_code=${bankCode}`, {
                headers: { Authorization: `Bearer ${this.paystackKey}` },
            }));
            return response.data.data;
        }
        catch (error) {
            this.logger.error('Failed to resolve account from Paystack', error);
            throw new common_1.BadRequestException('Could not verify account details');
        }
    }
    normalizeName(name) {
        return name.toLowerCase().replace(/[^a-z0-9]/g, '').trim();
    }
    namesMatch(name1, name2) {
        const n1 = this.normalizeName(name1);
        const n2 = this.normalizeName(name2);
        if (!n1 || !n2)
            return false;
        return n1.includes(n2) || n2.includes(n1);
    }
    async submitKyc(userId, dto) {
        const user = await this.prisma.user.findUnique({ where: { id: userId } });
        if (!user)
            throw new common_1.BadRequestException('User not found');
        if (!['SILVER', 'GOLD'].includes(user.tier)) {
            throw new common_1.BadRequestException('Only Silver or Gold tier users can submit KYC');
        }
        if (user.kycStatus === client_1.KycStatus.APPROVED) {
            throw new common_1.BadRequestException('Your KYC is already approved');
        }
        let status = client_1.KycStatus.PENDING;
        if (dto.payoutMethod === 'NGN_BANK' && dto.payoutAccount.accountNumber && dto.payoutAccount.bankCode) {
            try {
                const resolved = await this.resolveAccount(dto.payoutAccount.accountNumber, dto.payoutAccount.bankCode);
                if (resolved && resolved.account_name) {
                    dto.payoutAccount.accountName = resolved.account_name;
                    if (this.namesMatch(user.name || '', resolved.account_name)) {
                        status = client_1.KycStatus.APPROVED;
                    }
                }
            }
            catch (error) {
                this.logger.warn(`Auto-resolution failed for user ${userId}, falling back to manual review`);
            }
        }
        return this.prisma.user.update({
            where: { id: userId },
            data: {
                kycStatus: status,
                payoutMethod: dto.payoutMethod,
                payoutAccount: dto.payoutAccount,
                isVerified: status === client_1.KycStatus.APPROVED,
            },
            select: { id: true, kycStatus: true, payoutMethod: true, payoutAccount: true, isVerified: true },
        });
    }
    async updateKycStatus(userId, status) {
        return this.prisma.user.update({
            where: { id: userId },
            data: { kycStatus: status, isVerified: status === client_1.KycStatus.APPROVED },
            select: { id: true, name: true, email: true, kycStatus: true, isVerified: true },
        });
    }
    async getPendingKyc() {
        return this.prisma.user.findMany({
            where: { kycStatus: client_1.KycStatus.PENDING },
            select: { id: true, name: true, email: true, tier: true, payoutMethod: true, payoutAccount: true, createdAt: true },
            orderBy: { updatedAt: 'asc' },
        });
    }
};
exports.UsersService = UsersService;
exports.UsersService = UsersService = UsersService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        axios_1.HttpService])
], UsersService);
//# sourceMappingURL=users.service.js.map