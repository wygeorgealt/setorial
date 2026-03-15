import { Controller, Get, Request, UseGuards } from '@nestjs/common';
import { WalletService } from './wallet.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('wallet')
@UseGuards(JwtAuthGuard)
export class WalletController {
    constructor(private walletService: WalletService) { }

    @Get('balance')
    async getBalance(@Request() req: any) {
        return this.walletService.getBalanceData(req.user.userId);
    }

    @Get('transactions')
    async getTransactions(@Request() req: any) {
        return this.walletService.getTransactions(req.user.userId);
    }
}
