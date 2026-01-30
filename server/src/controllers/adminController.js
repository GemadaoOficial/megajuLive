const prisma = require('../config/database');
const bcrypt = require('bcrypt');

exports.getDashboardStats = async (req, res) => {
    try {
        // 1. Basic Counts
        const totalUsers = await prisma.user.count({ where: { role: 'COLLABORATOR' } });
        const totalLives = await prisma.live.count();
        const activeLives = await prisma.live.count({ where: { status: 'IN_PROGRESS' } });

        // 2. Financial & Performance Aggregates
        const aggregates = await prisma.live.aggregate({
            _sum: {
                totalRevenue: true,
                totalViews: true,
                coinsSpent: true,
                totalOrders: true
            },
            _avg: {
                engagementRate: true
            }
        });

        // 3. Top Performers (Streamers by Revenue)
        // Group by userId, sum totalRevenue, take top 5
        // Prisma groupBy doesn't support including relation data easily in one go, 
        // so we might do a raw query or a findMany with include and manual sort for small datasets.
        // For scalability, raw query is better, but let's use findMany users with simple logic for now (MVP).

        const topStreamers = await prisma.user.findMany({
            where: { role: 'COLLABORATOR' },
            select: {
                id: true,
                name: true,
                avatar: true,
                lives: {
                    select: {
                        totalRevenue: true
                    }
                }
            }
        });

        // Process top streamers in JS (fine for < 1000 users)
        const computedStreamers = topStreamers.map(user => {
            const revenue = user.lives.reduce((acc, live) => acc + (live.totalRevenue || 0), 0);
            return {
                id: user.id,
                name: user.name,
                avatar: user.avatar,
                totalRevenue: revenue
            };
        }).sort((a, b) => b.totalRevenue - a.totalRevenue).slice(0, 5);


        // 4. Get Actual Active Lives List
        const activeLivesList = await prisma.live.findMany({
            where: { status: 'IN_PROGRESS' },
            include: {
                user: {
                    select: {
                        name: true,
                        avatar: true
                    }
                }
            },
            orderBy: { startedAt: 'desc' }
        });

        res.json({
            stats: {
                totalUsers,
                totalLives,
                activeLives,
                totalRevenue: aggregates._sum.totalRevenue || 0,
                totalViews: aggregates._sum.totalViews || 0,
                avgEngagement: aggregates._avg.engagementRate || 0,
                totalOrders: aggregates._sum.totalOrders || 0
            },
            topStreamers: computedStreamers,
            activeLivesList
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch admin dashboard stats' });
    }
};

exports.getUsers = async (req, res) => {
    try {
        const users = await prisma.user.findMany({
            // where: { role: 'COLLABORATOR' }, // Removed filter to list ALL users
            select: {
                id: true,
                name: true,
                role: true, // Added role to identifying admins in frontend if needed
                email: true,
                email: true,
                createdAt: true,
                roleTitle: true,
                skipTutorial: true,
                // Simple stats
                _count: {
                    select: { lives: true }
                }
            },
            orderBy: { createdAt: 'desc' }
        });
        res.json(users);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch users' });
    }
};

exports.getUserDetails = async (req, res) => {
    try {
        const { id } = req.params;
        const user = await prisma.user.findUnique({
            where: { id },
            include: {
                lives: {
                    orderBy: { createdAt: 'desc' },
                    take: 10
                },
                moduleProgress: {
                    include: { module: true }
                }
            }
        });

        if (!user) return res.status(404).json({ error: 'User not found' });

        // Remove password
        const { password, ...userData } = user;
        res.json(userData);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch user details' });
    }
};

exports.updateUserStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { skipTutorial, roleTitle } = req.body;

        const updatedUser = await prisma.user.update({
            where: { id },
            data: {
                skipTutorial,
                roleTitle
            }
        });

        // remove password
        const { password, ...userData } = updatedUser;
        res.json(userData);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to update user' });
    }
};
