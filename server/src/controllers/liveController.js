const prisma = require('../config/database');
const { z } = require('zod');

// Schemas
const startLiveSchema = z.object({
    followersStart: z.number().int(),
    coinsStart: z.number()
});

const updateLiveSchema = z.object({
    peakViewers: z.number().int().optional(),
    chatInteractions: z.number().int().optional(),
    notes: z.string().optional()
});

const finishLiveSchema = z.object({
    followersEnd: z.number().int(),
    coinsEnd: z.number()
});

exports.startLive = async (req, res) => {
    try {
        const { followersStart, coinsStart } = req.body;
        const userId = req.user.id;

        // 1. Verificar se o usuário completou todos os módulos obrigatórios
        // Ignora para ADMIN se quiser, mas para garantir qualidade, todos fazem.
        // Vamos contar quantos módulos existem e quantos o usuário completou.
        const totalModules = await prisma.module.count({
            where: { status: 'completo' } // Considera apenas módulos ativos/publicados
        });

        const completedModules = await prisma.userModuleProgress.count({
            where: {
                userId,
                completed: true,
                module: { status: 'completo' } // Garante que é um módulo ativo
            }
        });

        if (completedModules < totalModules) {
            return res.status(403).json({
                error: 'Treinamento Incompleto',
                message: `Você precisa concluir todos os ${totalModules} módulos de treinamento antes de iniciar uma live.`,
                completed: completedModules,
                total: totalModules
            });
        }

        const live = await prisma.live.create({
            data: {
                userId,
                followersStart: parseInt(followersStart),
                coinsStart: parseFloat(coinsStart),
                status: 'IN_PROGRESS'
            }
        });

        res.status(201).json(live);
    } catch (error) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({ error: error.errors });
        }
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

exports.updateLive = async (req, res) => {
    try {
        const { id } = req.params;
        const data = updateLiveSchema.parse(req.body);

        const live = await prisma.live.update({
            where: { id, userId: req.user.id },
            data
        });

        res.json(live);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

exports.finishLive = async (req, res) => {
    try {
        const { id } = req.params;
        const data = finishLiveSchema.parse(req.body);

        // Buscar live atual para cálculos
        const currentLive = await prisma.live.findUnique({
            where: { id, userId: req.user.id }
        });

        if (!currentLive) return res.status(404).json({ error: 'Live not found' });

        const finishedAt = new Date();
        const duration = Math.floor((finishedAt - new Date(currentLive.startedAt)) / 60000); // minutos
        const followersGained = data.followersEnd - currentLive.followersStart;
        const coinsSpent = currentLive.coinsStart - data.coinsEnd;

        // Nota: ROI e Revenue serão atualizados posteriormente com a extração da IA/Excel

        const updatedLive = await prisma.live.update({
            where: { id },
            data: {
                status: 'FINISHED',
                finishedAt,
                duration,
                followersEnd: data.followersEnd,
                followersGained,
                coinsEnd: data.coinsEnd,
                coinsSpent
            }
        });

        res.json(updatedLive);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

exports.getLiveHistory = async (req, res) => {
    try {
        const lives = await prisma.live.findMany({
            where: { userId: req.user.id },
            orderBy: { createdAt: 'desc' }
        });
        res.json(lives);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

exports.getLiveDetails = async (req, res) => {
    try {
        const { id } = req.params;
        const live = await prisma.live.findUnique({
            where: { id, userId: req.user.id },
            include: { products: true }
        });

        if (!live) return res.status(404).json({ error: 'Live not found' });

        res.json(live);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
