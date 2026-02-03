const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Iniciando seed de módulos...');

    const modulesData = [
        {
            title: "1. Introdução às Lives Shopee",
            slug: "introducao-lives",
            description: "Entenda o básico sobre como funcionam as transmissões e por que elas são essenciais para vender mais.",
            content: `
# Introdução às Lives Shopee 🛍️

As Lives na Shopee são uma ferramenta poderosa para conectar vendedores e compradores em tempo real.

## Por que fazer Lives?
- **Engajamento:** Interaja diretamente com seu público.
- **Vendas:** Mostre produtos em detalhes e tire dúvidas na hora.
- **Alcance:** A Shopee impulsiona lives para novos usuários.

## Requisitos Básicos
- Conta de vendedor ativa.
- Computador com OBS Studio ou celular com boa câmera.
- Internet estável (mínimo 10Mbps de upload).

## Regras de Ouro
1. Seja pontual.
2. Mantenha energia alta.
3. Tenha produtos em mãos.
      `,
            order: 1,
            status: "completo", // Disponível
            icon: "Star"
        },
        {
            title: "2. Configurando o OBS Studio",
            slug: "configurando-obs",
            description: "Passo a passo completo para baixar, instalar e configurar o OBS para streamar na Shopee.",
            content: `
# Configurando o OBS Studio 🎥

O OBS (Open Broadcaster Software) é o padrão da indústria para transmissões.

## Passo 1: Download
Baixe em [obsproject.com](https://obsproject.com).

## Passo 2: Configuração de Saída
- **Encoder:** NVIDIA NVENC (se tiver placa de vídeo) ou x264.
- **Bitrate:** 2500 Kbps a 4000 Kbps.
- **Keyframe Interval:** 2 segundos.

## Passo 3: Conectando à Shopee
1. Vá no Seller Centre > Lives.
2. Copie a **URL do Servidor** e a **Chave da Stream**.
3. No OBS: Configurações > Transmissão > Personalizado.
4. Cole os dados e clique em Aplicar.
      `,
            order: 2,
            status: "completo",
            icon: "Settings"
        },
        {
            title: "3. Roteiro de Vendas",
            slug: "roteiro-vendas",
            description: "Templates matadores para manter a audiência engajada e converter espectadores em compradores.",
            content: `
# Roteiro de Vendas (Script) 📝

Uma live sem roteiro é uma live perdida. Siga esta estrutura:

## 1. Aquecimento (5 min)
- Cumprimente quem está chegando.
- Fale o tema da live ("Hoje vamos queimar o estoque de Verão!").
- Peça compartilhamentos.

## 2. Apresentação (10 min por bloco)
- Mostre o produto.
- Fale o benefício principal (não só características técnica).
- **CTA (Chamada para Ação):** "Clica na sacolinha agora!".

## 3. Flash Sale (Momentos de Pico)
- "Apenas para os 10 primeiros!"
- Gere escassez real.

## 4. Encerramento
- Agradeça.
- Fale quando será a próxima live.
      `,
            order: 3,
            status: "completo",
            icon: "BookOpen"
        },
        {
            title: "4. Ferramentas da Live",
            slug: "ferramentas-live",
            description: "Como usar enquetes, fixar produtos, lançar cupons e fazer flash sales ao vivo.",
            content: `
# Ferramentas da Live 🛠️

A Shopee oferece várias ferramentas para aumentar vendas.

## Sacolinha (Shopping Bag)
Adicione os produtos ANTES da live. Durante a live, você pode "Fixar" um produto para ele aparecer no topo da tela do cliente.

## Cupons
Crie cupons exclusivos para a Live (Live Exclusive Vouchers). Eles têm conversão 3x maior que cupons normais.

## Leilão
Ótimo para engajar. Defina um preço mínimo e deixe o chat disputar nos comentários.

## Enquetes
Use para decidir qual próximo produto mostrar. "Querem ver o Vestido Vermelho ou a blusa Azul?".
      `,
            order: 4,
            status: "completo",
            icon: "Video"
        }
    ];

    for (const mod of modulesData) {
        await prisma.module.upsert({
            where: { slug: mod.slug },
            update: mod,
            create: mod
        });
    }

    console.log('✅ Módulos criados com sucesso!');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
