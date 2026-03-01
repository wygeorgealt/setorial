import { PrismaService } from '../prisma.service';
import { WalletService } from '../wallet/wallet.service';
export declare class EligibilityService {
    private prisma;
    private wallet;
    private readonly logger;
    constructor(prisma: PrismaService, wallet: WalletService);
    checkInactivityAndDemonetize(): Promise<void>;
    moveEligiblePoints(): Promise<void>;
}
