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
            icon: 'BookOpen'
        },
        {
            title: 'Download e Instalação do OBS',
            slug: 'instalacao-obs',
            description: 'Baixe e instale o OBS Studio paso a passo',
            content: '# Instalação do OBS\n\n1. Acesse obsproject.com\n2. Baixe a versão Windows...',
            order: 2,
            status: 'completo',
            icon: 'Video'
        },
        {
            title: 'Configuração Inicial do OBS',
            slug: 'config-inicial-obs',
            description: 'Primeira configuração e criação de cenas básicas de alta conversão',
            content: '# Configurando Cenas...',
            order: 3,
            status: 'completo',
            icon: 'Settings'
        },
        {
            title: 'Iluminação e Áudio Profissional',
            slug: 'iluminacao-audio',
            description: 'Como montar um setup profissional gastando pouco',
            content: '# Iluminação\n\nA luz é 50% da qualidade da sua live...',
            order: 4,
            status: 'completo',
            icon: 'Star'
        },
        {
            title: 'Roteiro de Vendas e Gatilhos',
            slug: 'roteiro-vendas',
            description: 'Técnicas de persuasão e scripts prontos para vender muito',
            content: '# Gatilhos Mentais\n\nEscassez, Urgência e Autoridade...',
            order: 5,
            status: 'completo',
            icon: 'Trophy'
        },
        {
            title: 'Análise de Dados e Métricas',
            slug: 'analise-metricas',
            description: 'Entenda os números para otimizar seus resultados',
            content: '# Métricas que Importam\n\nTaxa de Retenção, CTR e Conversão...',
            order: 6,
            status: 'completo',
            icon: 'Settings'
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
