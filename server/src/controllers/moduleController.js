const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

exports.getAllModules = async (req, res) => {
    try {
        const userId = req.user.id;

        const modules = await prisma.module.findMany({
            orderBy: { order: 'asc' },
            include: {
                userProgress: {
                    where: { userId },
                    select: { completed: true }
                }
            }
        });

        // Formata retorno para incluir flag 'completed' no objeto raiz
        const formattedModules = modules.map(m => ({
            ...m,
            completed: m.userProgress.length > 0 ? m.userProgress[0].completed : false,
            userProgress: undefined
        }));

        res.json(formattedModules);
    } catch (error) {
        console.error('Erro ao buscar módulos:', error);
        res.status(500).json({ error: 'Erro ao buscar módulos' });
    }
};

exports.getModuleBySlug = async (req, res) => {
    try {
        const { slug } = req.params;
        const userId = req.user.id;

        const module = await prisma.module.findUnique({
            where: { slug },
            include: {
                userProgress: {
                    where: { userId }
                }
            }
        });

        if (!module) {
            return res.status(404).json({ error: 'Módulo não encontrado' });
        }

        const formattedModule = {
            ...module,
            completed: module.userProgress.length > 0 ? module.userProgress[0].completed : false,
            userProgress: undefined
        };

        res.json(formattedModule);
    } catch (error) {
        console.error('Erro ao buscar módulo:', error);
        res.status(500).json({ error: 'Erro ao buscar módulo' });
    }
};

exports.completeModule = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;

        // Verifica se o módulo existe
        const module = await prisma.module.findUnique({ where: { id } });
        if (!module) {
            return res.status(404).json({ error: 'Módulo não encontrado' });
        }

        // Upsert: Cria ou Atualiza o progresso
        const progress = await prisma.userModuleProgress.upsert({
            where: {
                userId_moduleId: {
                    userId,
                    moduleId: id
                }
            },
            update: {
                completed: true,
                completedAt: new Date()
            },
            create: {
                userId,
                moduleId: id,
                completed: true,
                completedAt: new Date()
            }
        });

        res.json({ success: true, progress });
    } catch (error) {
        console.error('Erro ao completar módulo:', error);
        res.status(500).json({ error: 'Erro ao completar módulo' });
    }
};
