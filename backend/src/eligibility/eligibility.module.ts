import { Module } from '@nestjs/common';
import { EligibilityService } from './eligibility.service';
import { PrismaModule } from '../prisma.module';
import { WalletModule } from '../wallet/wallet.module';

@Module({
  imports: [PrismaModule, WalletModule],
  providers: [EligibilityService],
})
export class EligibilityModule { }
