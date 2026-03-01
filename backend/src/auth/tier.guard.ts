import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Tier } from '@prisma/client';
import { TIERS_KEY } from './tier.decorator';

@Injectable()
export class TierGuard implements CanActivate {
    constructor(private reflector: Reflector) { }

    canActivate(context: ExecutionContext): boolean {
        const requiredTiers = this.reflector.getAllAndOverride<Tier[]>(TIERS_KEY, [
            context.getHandler(),
            context.getClass(),
        ]);
        if (!requiredTiers) {
            return true;
        }
        const { user } = context.switchToHttp().getRequest();
        // Requires users service or DB lookup for tier if it's not in the JWT payload
        // Assuming we added it or we just check if role is ADMIN
        if (user.role === 'ADMIN') return true;

        // Simplification for MVP: We check if the tier is authorized.
        if (!requiredTiers.includes(user.tier)) {
            throw new ForbiddenException('Upgrade your subscription to access this feature');
        }
        return true;
    }
}
