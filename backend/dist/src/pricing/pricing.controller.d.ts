import { PricingService } from './pricing.service';
export declare class PricingController {
    private pricingService;
    constructor(pricingService: PricingService);
    getPricing(country?: string): Promise<any>;
    adminGetAllPricing(): Promise<any>;
    adminCreatePricing(body: any): Promise<any>;
    adminUpdatePricing(id: string, body: any): Promise<any>;
    adminDeletePricing(id: string): Promise<any>;
    adminGetRegionalStats(): Promise<any[]>;
}
