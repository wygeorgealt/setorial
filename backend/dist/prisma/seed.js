"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
async function main() {
    const math = await prisma.subject.upsert({
        where: { name: 'Mathematics' },
        update: {},
        create: {
            name: 'Mathematics',
            topics: {
                create: [
                    { name: 'Algebra' },
                    { name: 'Calculus' },
                    { name: 'Geometry' },
                ],
            },
        },
    });
    const english = await prisma.subject.upsert({
        where: { name: 'English Language' },
        update: {},
        create: {
            name: 'English Language',
            topics: {
                create: [
                    { name: 'Grammar' },
                    { name: 'Literature' },
                    { name: 'Composition' },
                ],
            },
        },
    });
    const physics = await prisma.subject.upsert({
        where: { name: 'Physics' },
        update: {},
        create: {
            name: 'Physics',
            topics: {
                create: [
                    { name: 'Mechanics' },
                    { name: 'Thermodynamics' },
                    { name: 'Optics' },
                ],
            },
        },
    });
    console.log('Seed data created successfully');
}
main()
    .catch((e) => {
    console.error(e);
    process.exit(1);
})
    .finally(async () => {
    await prisma.$disconnect();
});
//# sourceMappingURL=seed.js.map