const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function main() {
    console.log('Start seeding...');

    // Admin user
    const adminEmail = 'admin@shopee.com';
    const adminPassword = await bcrypt.hash('admin123', 10);

    const admin = await prisma.user.upsert({
        where: { email: adminEmail },
        update: {},
        create: {
            email: adminEmail,
            password: adminPassword,
            name: 'Administrador',
            role: 'ADMIN'
        }
    });
    console.log(`Created user: ${admin.email}`);

    // Collaborator user
    const collabEmail = 'colaborador@shopee.com';
    const collabPassword = await bcrypt.hash('collab123', 10);

    const collab = await prisma.user.upsert({
        where: { email: collabEmail },
        update: {},
        create: {
            email: collabEmail,
            password: collabPassword,
            name: 'Colaborador Teste',
            role: 'COLLABORATOR'
        }
    });
    console.log(`Created user: ${collab.email}`);

    // Tutorial Modules
    const modules = [
        {
            title: 'Introdução às Lives Shopee',
            slug: 'introducao',
            description: 'Entenda o que são lives e seus benefícios',
            content: '# Introdução\n\nLives são uma ferramenta poderosa para aumentar as vendas...',
            order: 1,
            status: 'completo',
            icon: '📱'
        },
        {
            title: 'Download e Instalação do OBS',
            slug: 'instalacao-obs',
            description: 'Baixe e instale o OBS Studio',
            content: '# Instalação do OBS\n\n1. Acesse obsproject.com\n2. Baixe a versão Windows...',
            order: 2,
            status: 'em_breve',
            icon: '💾'
        },
        {
            title: 'Configuração Inicial do OBS',
            slug: 'config-inicial-obs',
            description: 'Primeira configuração e cenas básicas',
            content: '# Configurando Cenas...',
            order: 3,
            status: 'em_breve',
            icon: '⚙️'
        }
    ];

    for (const module of modules) {
        const mod = await prisma.module.upsert({
            where: { slug: module.slug },
            update: {},
            create: module
        });
        console.log(`Created module: ${mod.title}`);
    }

    console.log('Seeding finished.');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
