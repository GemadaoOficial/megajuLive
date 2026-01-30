const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log('Checking for stuck lives...');
    const active = await prisma.live.count({ where: { status: 'IN_PROGRESS' } });

    if (active > 0) {
        console.log(`Found ${active} stuck lives. Deleting...`);
        const deleted = await prisma.live.deleteMany({ where: { status: 'IN_PROGRESS' } });
        console.log(`Deleted ${deleted.count} lives successfully.`);
    } else {
        console.log('No stuck lives found. System is clean.');
    }
}

main()
    .catch(e => {
        console.error('Error cleaning lives:', e);
        process.exit(1);
    })
    .finally(async () => await prisma.$disconnect());
