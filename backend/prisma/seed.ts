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
