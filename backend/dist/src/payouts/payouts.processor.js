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
var PayoutsProcessor_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.PayoutsProcessor = void 0;
const bullmq_1 = require("@nestjs/bullmq");
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma.service");
const payouts_service_1 = require("./payouts.service");
let PayoutsProcessor = PayoutsProcessor_1 = class PayoutsProcessor extends bullmq_1.WorkerHost {
    prisma;
    payoutsService;
    logger = new common_1.Logger(PayoutsProcessor_1.name);
    constructor(prisma, payoutsService) {
        super();
        this.prisma = prisma;
        this.payoutsService = payoutsService;
    }
    async process(job) {
        this.logger.log(`Processing payout batch job: ${job.id}`);
        const { month, estimatedRevenue } = job.data;
        const simulation = await this.payoutsService.simulatePayout(month, estimatedRevenue);
        if (!simulation.safeToExecute) {
            this.logger.error('Payout simulation indicated unsafe liability ratio. Aborting.');
            return;
        }
        for (const payout of simulation.simulatedPayouts) {
            if (payout.simulatedPayout <= 0)
                continue;
            this.logger.log(`Paying out ${payout.simulatedPayout} to user ${payout.userId}`);
            await this.prisma.$transaction(async (tx) => {
                await tx.walletLedger.create({
                    data: {
                        userId: payout.userId,
                        type: 'PAYOUT',
                        amount: -payout.simulatedPayout,
                        reference: `PAYOUT_${month}_${job.id}`,
                    },
                });
            });
        }
        this.logger.log('Payout batch completed.');
        return { status: 'completed', count: simulation.simulatedPayoutsCount };
    }
};
exports.PayoutsProcessor = PayoutsProcessor;
exports.PayoutsProcessor = PayoutsProcessor = PayoutsProcessor_1 = __decorate([
    (0, bullmq_1.Processor)('payouts'),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        payouts_service_1.PayoutsService])
], PayoutsProcessor);
//# sourceMappingURL=payouts.processor.js.map