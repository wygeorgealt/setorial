import { Controller, Get, Request, UseGuards } from '@nestjs/common';
import { WalletService } from './wallet.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('wallet')
@UseGuards(JwtAuthGuard)
export class WalletController {
    constructor(private walletService: WalletService) { }

    @Get('balance')
    async getBalance(@Request() req: any) {
        const balance = await this.walletService.getBalance(req.user.userId);
        return { balance };
    }
}
