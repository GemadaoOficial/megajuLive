import rateLimit from 'express-rate-limit'

// Auth rate limiter: protect login/register against brute force
export const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 10, // 10 attempts per window
    standardHeaders: true,
    legacyHeaders: false,
    message: { message: 'Muitas tentativas. Tente novamente em 15 minutos.' },
})

// AI rate limiter: prevent API cost abuse
export const aiLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 20, // 20 AI requests per hour
    standardHeaders: true,
    legacyHeaders: false,
    message: { message: 'Limite de requisicoes de IA atingido. Tente novamente em 1 hora.' },
})
