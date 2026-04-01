import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { Prisma, User, PayoutMethod, KycStatus } from '@prisma/client';
import { HttpService } from '@nestjs/axios';
import { lastValueFrom } from 'rxjs';

@Injectable()
export class UsersService {
    private readonly logger = new Logger(UsersService.name);
    private readonly paystackKey = process.env.PAYSTACK_SECRET_KEY;

    constructor(
        private prisma: PrismaService,
        private httpService: HttpService,
    ) { }

    async createUser(data: Prisma.UserCreateInput): Promise<User> {
        return this.prisma.user.create({ data });
    }

    async findByEmail(email: string): Promise<User | null> {
        return this.prisma.user.findUnique({ where: { email } });
    }

    async findById(id: string): Promise<User | null> {
        return this.prisma.user.findUnique({ where: { id } });
    }

    async getPoints(userId: string): Promise<number> {
        const result = await this.prisma.pointsLedger.aggregate({
            where: { userId },
            _sum: { points: true },
        });
        return result._sum.points || 0;
    }

    async updateProfile(userId: string, data: { name?: string, billingCountry?: string, expoPushToken?: string }) {
        const user = await this.prisma.user.findUnique({ where: { id: userId } });
        if (!user) throw new BadRequestException('User not found');

        const updateData: any = { ...data };

        // Handle billing country locking
        if (data.billingCountry) {
            if (user.countryLocked && user.billingCountry !== data.billingCountry) {
                throw new BadRequestException('Billing country is locked and cannot be changed');
            }
            updateData.countryLocked = true;
        }

        return this.prisma.user.update({
            where: { id: userId },
            data: updateData,
        });
    }

    async getLearningProgress(userId: string) {
        // Get all subjects with their topics and lessons
        const subjects = await this.prisma.subject.findMany({
            include: {
                topics: {
                    include: {
                        lessons: {
                            include: {
                                userProgress: {
                                    where: { userId }
                                }
                            }
                        }
                    }
                }
            }
        });

        return subjects.map(subject => {
            let totalLessons = 0;
            let completedLessons = 0;

            subject.topics.forEach(topic => {
                topic.lessons.forEach(lesson => {
                    totalLessons++;
                    if (lesson.userProgress && lesson.userProgress.length > 0) {
                        completedLessons++;
                    }
                });
            });

            return {
                id: subject.id,
                name: subject.name,
                totalTopics: subject.topics.length,
                totalLessons,
                completedLessons,
                progress: totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0,
            };
        });
    }

    async getBanks(country: string = 'nigeria') {
        try {
            const response = await lastValueFrom(
                this.httpService.get(`https://api.paystack.co/bank?country=${country.toLowerCase()}`, {
                    headers: { Authorization: `Bearer ${this.paystackKey}` },
                })
            );
            return response.data.data; // List of banks
        } catch (error) {
            this.logger.error('Failed to fetch banks from Paystack', error);
            throw new BadRequestException('Could not fetch bank list');
        }
    }

    async resolveAccount(accountNumber: string, bankCode: string) {
        try {
            const response = await lastValueFrom(
                this.httpService.get(`https://api.paystack.co/bank/resolve?account_number=${accountNumber}&bank_code=${bankCode}`, {
                    headers: { Authorization: `Bearer ${this.paystackKey}` },
                })
            );
            return response.data.data; // { account_number: string, account_name: string, bank_id: number }
        } catch (error) {
            this.logger.error('Failed to resolve account from Paystack', error);
            throw new BadRequestException('Could not verify account details');
        }
    }

    private normalizeName(name: string): string {
        return name.toLowerCase().replace(/[^a-z0-9]/g, '').trim();
    }

    private namesMatch(name1: string, name2: string): boolean {
        const n1 = this.normalizeName(name1);
        const n2 = this.normalizeName(name2);
        if (!n1 || !n2) return false;
        // Check for partial match or inclusion
        return n1.includes(n2) || n2.includes(n1);
    }

    async submitKyc(userId: string, dto: { payoutMethod: PayoutMethod; payoutAccount: Record<string, any> }) {
        const user = await this.prisma.user.findUnique({ where: { id: userId } }) as any;
        if (!user) throw new BadRequestException('User not found');

        if (!['SILVER', 'GOLD'].includes(user.tier)) {
            throw new BadRequestException('Only Silver or Gold tier users can submit KYC');
        }

        if (user.kycStatus === KycStatus.APPROVED) {
            throw new BadRequestException('Your KYC is already approved');
        }

        let status: KycStatus = KycStatus.PENDING;

        // Auto-approval logic for bank accounts
        if (dto.payoutMethod === 'NGN_BANK' && dto.payoutAccount.accountNumber && dto.payoutAccount.bankCode) {
            try {
                const resolved = await this.resolveAccount(dto.payoutAccount.accountNumber, dto.payoutAccount.bankCode);
                if (resolved && resolved.account_name) {
                    // Update the account name in the DTO to the resolved one
                    dto.payoutAccount.accountName = resolved.account_name;

                    if (this.namesMatch(user.name || '', resolved.account_name)) {
                        status = KycStatus.APPROVED;
                    }
                }
            } catch (error) {
                this.logger.warn(`Auto-resolution failed for user ${userId}, falling back to manual review`);
            }
        }

        return this.prisma.user.update({
            where: { id: userId },
            data: {
                kycStatus: status,
                payoutMethod: dto.payoutMethod,
                payoutAccount: dto.payoutAccount,
                isVerified: status === KycStatus.APPROVED,
            },
            select: { id: true, kycStatus: true, payoutMethod: true, payoutAccount: true, isVerified: true },
        }) as any;
    }

    async updateKycStatus(userId: string, status: KycStatus) {
        return this.prisma.user.update({
            where: { id: userId },
            data: { kycStatus: status, isVerified: status === KycStatus.APPROVED },
            select: { id: true, name: true, email: true, kycStatus: true, isVerified: true },
        }) as any;
    }

    async getActiveSubscription(userId: string) {
        return (this.prisma as any).subscriptionRecord.findFirst({
            where: { userId, status: 'ACTIVE' },
            orderBy: { currentPeriodEnd: 'desc' }
        });
    }
}
