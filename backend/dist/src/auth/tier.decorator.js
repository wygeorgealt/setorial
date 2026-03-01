"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Tiers = exports.TIERS_KEY = void 0;
const common_1 = require("@nestjs/common");
exports.TIERS_KEY = 'tiers';
const Tiers = (...tiers) => (0, common_1.SetMetadata)(exports.TIERS_KEY, tiers);
exports.Tiers = Tiers;
//# sourceMappingURL=tier.decorator.js.map