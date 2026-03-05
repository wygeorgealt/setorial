import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import * as bcrypt from 'bcrypt';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter } as any);

async function main() {
    await prisma.subject.upsert({
        where: { name: 'Mathematics' },
        update: {},
        create: {
            name: 'Mathematics',
            topics: { create: [{ name: 'Algebra' }, { name: 'Calculus' }, { name: 'Geometry' }] },
        },
    });

    await prisma.subject.upsert({
        where: { name: 'English Language' },
        update: {},
        create: {
            name: 'English Language',
            topics: { create: [{ name: 'Grammar' }, { name: 'Literature' }, { name: 'Composition' }] },
        },
    });

    await prisma.subject.upsert({
        where: { name: 'Physics' },
        update: {},
        create: {
            name: 'Physics',
            topics: { create: [{ name: 'Mechanics' }, { name: 'Thermodynamics' }, { name: 'Optics' }] },
        },
    });

    console.log('Subjects seeded successfully');

    const hashedPassword = await bcrypt.hash('admin123', 10);
    const admin = await (prisma.user as any).upsert({
        where: { email: 'admin@setorial.com' },
        update: {},
        create: {
            email: 'admin@setorial.com',
            password: hashedPassword,
            name: 'Setorial Admin',
            role: 'ADMIN',
            isVerified: true,
            tier: 'GOLD',
            kycStatus: 'APPROVED',
        },
    });
    console.log('Admin user seeded:', admin.email);

    // ─── Seed Country Pricing ────────────────────────────────────────────
    const pricingData = [
        { countryCode: 'NG', countryName: 'Nigeria', economicTier: 'TIER_C' as const, multiplier: 0.50, currency: 'NGN', bronzeMonthly: 3500, silverMonthly: 7500, goldMonthly: 15000, bronzeAnnual: 35000, silverAnnual: 75000, goldAnnual: 150000 },
        { countryCode: 'US', countryName: 'United States', economicTier: 'TIER_A' as const, multiplier: 1.0, currency: 'USD', bronzeMonthly: 12, silverMonthly: 25, goldMonthly: 45, bronzeAnnual: 120, silverAnnual: 250, goldAnnual: 450 },
        { countryCode: 'GB', countryName: 'United Kingdom', economicTier: 'TIER_A' as const, multiplier: 1.0, currency: 'GBP', bronzeMonthly: 10, silverMonthly: 20, goldMonthly: 38, bronzeAnnual: 100, silverAnnual: 200, goldAnnual: 380 },
        { countryCode: 'IN', countryName: 'India', economicTier: 'TIER_C' as const, multiplier: 0.50, currency: 'INR', bronzeMonthly: 500, silverMonthly: 1100, goldMonthly: 2000, bronzeAnnual: 5000, silverAnnual: 11000, goldAnnual: 20000 },
        { countryCode: 'GH', countryName: 'Ghana', economicTier: 'TIER_D' as const, multiplier: 0.35, currency: 'GHS', bronzeMonthly: 50, silverMonthly: 110, goldMonthly: 200, bronzeAnnual: 500, silverAnnual: 1100, goldAnnual: 2000 },
    ];

    for (const p of pricingData) {
        await (prisma as any).countryPricing.upsert({
            where: { countryCode: p.countryCode },
            update: {},
            create: p,
        });
    }
    console.log('Country pricing seeded:', pricingData.length, 'countries');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
        await pool.end();
    });
