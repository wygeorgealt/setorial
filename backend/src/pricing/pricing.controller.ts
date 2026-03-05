import { Controller, Get, Post, Patch, Delete, Param, Query, Body, UseGuards } from '@nestjs/common';
import { PricingService } from './pricing.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller()
export class PricingController {
    constructor(private pricingService: PricingService) { }

    // ─── Public / Student-Facing ─────────────────────────────────────────────

    @Get('pricing')
    async getPricing(@Query('country') country?: string) {
        if (country) {
            return this.pricingService.getPricingForCountry(country);
        }
        return this.pricingService.getAllActivePricing();
    }

    // ─── Admin-Facing ────────────────────────────────────────────────────────

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('ADMIN' as any)
    @Get('admin/pricing')
    async adminGetAllPricing() {
        return this.pricingService.getAllPricing();
    }

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('ADMIN' as any)
    @Post('admin/pricing')
    async adminCreatePricing(@Body() body: any) {
        return this.pricingService.createPricing(body);
    }

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('ADMIN' as any)
    @Patch('admin/pricing/:id')
    async adminUpdatePricing(@Param('id') id: string, @Body() body: any) {
        return this.pricingService.updatePricing(id, body);
    }

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('ADMIN' as any)
    @Delete('admin/pricing/:id')
    async adminDeletePricing(@Param('id') id: string) {
        return this.pricingService.deletePricing(id);
    }

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('ADMIN' as any)
    @Get('admin/regions')
    async adminGetRegionalStats() {
        return this.pricingService.getRegionalStats();
    }
}
