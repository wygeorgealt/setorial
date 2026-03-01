import { Tier } from '@prisma/client';
export declare const TIERS_KEY = "tiers";
export declare const Tiers: (...tiers: Tier[]) => import("@nestjs/common").CustomDecorator<string>;
