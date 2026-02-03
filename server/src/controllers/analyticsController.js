const prisma = require('../config/database');

exports.getMyStats = async (req, res) => {
    try {
        const userId = req.user.id;

        // Resumo Geral
        const lives = await prisma.live.findMany({
            where: { userId, status: 'FINISHED' }
        });

        const summary = lives.reduce((acc, live) => {
            acc.totalLives++;
            acc.totalRevenue += live.revenue || 0;
            acc.totalCoinsSpent += live.coinsSpent || 0;
            acc.totalFollowersGained += live.followersGained || 0;
            acc.totalViews += live.totalViews || 0;
            acc.totalLikes += live.likes || 0;
            acc.totalShares += live.shares || 0;
            acc.totalChatInteractions += live.chatInteractions || 0;
            return acc;
        }, {
            totalLives: 0,
            totalRevenue: 0,
            totalCoinsSpent: 0,
            totalFollowersGained: 0,
            totalViews: 0,
            totalLikes: 0,
            totalShares: 0,
            totalChatInteractions: 0
        });

        summary.averageROI = summary.totalCoinsSpent > 0
            ? ((summary.totalRevenue - summary.totalCoinsSpent) / summary.totalCoinsSpent) * 100
            : 0;

        // Histórico Recentes
        const recentLives = await prisma.live.findMany({
            where: { userId },
            take: 5,
            orderBy: { createdAt: 'desc' }
        });

        res.json({
            summary,
            recentLives
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
