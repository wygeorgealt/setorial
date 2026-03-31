export type UserTier = 'FREE' | 'BRONZE' | 'SILVER' | 'GOLD';

export const getTierColors = (tier: UserTier | string = 'FREE') => {
    switch (tier.toUpperCase()) {
        case 'GOLD':
            return {
                primary: '#EAB308', // Yellow-500
                primaryDark: '#CA8A04', // Yellow-600
                bgLight: '#FEF9C3', // Yellow-50
                bgDark: '#422006', // Yellow-950
                border: '#FDE047', // Yellow-300
                text: '#854D0E', // Yellow-800
            };
        case 'SILVER':
            return {
                primary: '#94A3B8', // Slate-400
                primaryDark: '#64748B', // Slate-500
                bgLight: '#F8FAFC', // Slate-50
                bgDark: '#0F172A', // Slate-900
                border: '#CBD5E1', // Slate-300
                text: '#334155', // Slate-700
            };
        case 'BRONZE':
            return {
                primary: '#CD7F32', // Bronze
                primaryDark: '#A0522D', // Sienna
                bgLight: '#FFF7ED', // Orange-50
                bgDark: '#431407', // Orange-950
                border: '#FED7AA', // Orange-200
                text: '#9A3412', // Orange-800
            };
        case 'FREE':
        default:
            return {
                primary: '#8B5CF6', // Purple-500
                primaryDark: '#7C3AED', // Purple-600
                bgLight: '#F5F3FF', // Purple-50
                bgDark: '#2E1065', // Purple-950
                border: '#DDD6FE', // Purple-200
                text: '#5B21B6', // Purple-800
            };
    }
};
