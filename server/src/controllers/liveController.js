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
        const { followersStart, coinsStart, liveLink } = req.body;
        const userId = req.user.id;

        // 1. Verificar se o usuário completou todos os módulos obrigatórios
        // Ignora se for ADMIN ou tiver flag skipTutorial
        const user = await prisma.user.findUnique({ where: { id: userId } });

        if (user.role !== 'ADMIN' && !user.skipTutorial) {
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
        }

        const live = await prisma.live.create({
            data: {
                userId,
                followersStart: parseInt(followersStart),
                coinsStart: parseFloat(coinsStart),
                liveLink, // Optional field
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
        // When using FormData, field numbers might need conversion
        const bodyObj = {
            followersEnd: parseInt(req.body.followersEnd),
            coinsEnd: parseFloat(req.body.coinsEnd)
        };
        const data = finishLiveSchema.parse(bodyObj);

        // Buscar live atual para cálculos
        const currentLive = await prisma.live.findUnique({
            where: { id, userId: req.user.id }
        });

        if (!currentLive) return res.status(404).json({ error: 'Live not found' });

        const finishedAt = new Date();
        const duration = Math.floor((finishedAt - new Date(currentLive.startedAt)) / 60000); // minutos
        const followersGained = data.followersEnd - currentLive.followersStart;
        const coinsSpent = currentLive.coinsStart - data.coinsEnd;

        // Process AI metrics if available
        const aiMetrics = {};
        if (req.body.likes) aiMetrics.likes = parseInt(req.body.likes);
        if (req.body.shares) aiMetrics.shares = parseInt(req.body.shares);
        if (req.body.chatInteractions) aiMetrics.chatInteractions = parseInt(req.body.chatInteractions);
        if (req.body.totalViews) aiMetrics.totalViews = parseInt(req.body.totalViews);
        if (req.body.engagementRate) aiMetrics.engagementRate = parseFloat(req.body.engagementRate);
        if (req.body.aiExtractedData) aiMetrics.aiExtractedData = req.body.aiExtractedData; // String

        const updatedLive = await prisma.live.update({
            where: { id },
            data: {
                status: 'FINISHED',
                finishedAt,
                duration,
                followersEnd: data.followersEnd,
                followersGained,
                coinsEnd: data.coinsEnd,
                coinsSpent,
                ...aiMetrics
            }
        });

        // Save Screenshots if any
        if (req.files && req.files.length > 0) {
            const screenshotsData = req.files.map(file => ({
                liveId: id,
                url: file.path // Or a relative URL depending on setup. Using path for now.
            }));

            await prisma.liveScreenshot.createMany({
                data: screenshotsData
            });
        }

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
// Schedule Live Schema
const scheduleLiveSchema = z.object({
    title: z.string().min(1, "O título é obrigatório"),
    scheduledDate: z.string().datetime(), // ISO Date String
    description: z.string().optional(),
    products: z.array(z.object({
        productName: z.string(),
        productPrice: z.number(),
        productSku: z.string().optional()
    })).optional()
});

exports.scheduleLive = async (req, res) => {
    try {
        const data = scheduleLiveSchema.parse(req.body);
        const userId = req.user.id;

        const live = await prisma.live.create({
            data: {
                userId,
                title: data.title,
                scheduledDate: new Date(data.scheduledDate),
                status: 'SCHEDULED',
                notes: data.description,
                // Initialize optional fields as null/0 where appropriate? No, allow null.
                followersStart: null,
                coinsStart: null,
                products: {
                    create: data.products || []
                }
            },
            include: {
                products: true
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

exports.getScheduledLives = async (req, res) => {
    try {
        const userId = req.user.id;
        const lives = await prisma.live.findMany({
            where: {
                userId,
                status: 'SCHEDULED'
            },
            orderBy: {
                scheduledDate: 'asc'
            },
            include: {
                products: true
            }
        });
        res.json(lives);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

exports.updateScheduledLive = async (req, res) => {
    try {
        const { id } = req.params;
        const data = scheduleLiveSchema.partial().parse(req.body); // Allow partial updates

        // Check if live exists and is scheduled
        const existingLive = await prisma.live.findUnique({
            where: { id, userId: req.user.id }
        });

        if (!existingLive || existingLive.status !== 'SCHEDULED') {
            return res.status(404).json({ error: 'Scheduled live not found or cannot be edited' });
        }

        const updateData = {
            ...data,
            scheduledDate: data.scheduledDate ? new Date(data.scheduledDate) : undefined,
            products: undefined // Handle products separately if needed
        };

        // If products are updated, we might need to delete old ones and create new ones, 
        // or just add new ones. For simplicity, let's treat it as a replace if provided.
        // But Prisma update with relations is tricky. Let's stick to basic field updates for now.
        // If the user sends products, we replace them.

        let productOperations = {};
        if (data.products) {
            productOperations = {
                products: {
                    deleteMany: {}, // Delete all existing products for this live
                    create: data.products // Create new ones
                }
            };
        }

        const live = await prisma.live.update({
            where: { id },
            data: {
                title: updateData.title,
                scheduledDate: updateData.scheduledDate,
                notes: updateData.description,
                ...productOperations
            },
            include: { products: true }
        });

        res.json(live);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

exports.deleteScheduledLive = async (req, res) => {
    try {
        const { id } = req.params;
        const live = await prisma.live.findUnique({
            where: { id, userId: req.user.id }
        });

        if (!live || live.status !== 'SCHEDULED') {
            return res.status(404).json({ error: 'Live not found or active' });
        }

        await prisma.live.delete({
            where: { id }
        });

        res.json({ message: 'Live scheduled deleted successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
