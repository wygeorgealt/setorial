import { SetMetadata } from '@nestjs/common';
import { Tier } from '@prisma/client';

export const TIERS_KEY = 'tiers';
export const Tiers = (...tiers: Tier[]) => SetMetadata(TIERS_KEY, tiers);
