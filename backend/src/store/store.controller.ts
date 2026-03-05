import { Controller, Get, Post, Param, UseGuards, Request } from '@nestjs/common';
import { StoreService } from './store.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('store')
@UseGuards(JwtAuthGuard)
export class StoreController {
    constructor(private readonly storeService: StoreService) { }

    @Get()
    getStore() {
        return this.storeService.getStore();
    }

    @Get('my-powerups')
    getMyPowerUps(@Request() req: any) {
        return this.storeService.getMyPowerUps(req.user.userId);
    }

    @Post('buy/:type')
    purchasePowerUp(@Request() req: any, @Param('type') type: string) {
        return this.storeService.purchasePowerUp(req.user.userId, type);
    }
}
