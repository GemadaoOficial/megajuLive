require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');

const app = express();

const logger = require('./utils/logger');

// Middlewares
app.use(helmet());
app.use(cors({ origin: process.env.CLIENT_URL || "http://localhost:5173" }));
app.use(express.json());

// Request Logger Middleware
app.use((req, res, next) => {
    logger.info(`${req.method} ${req.url}`);
    next();
});

// Rate Limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
});
app.use('/api', limiter);

// Static files for uploads (temporário/local)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Basic Route
app.get('/', (req, res) => {
    res.send('Shopee Live System API is running');
});

// Import Routes (Placeholder)
const authRoutes = require('./routes/auth.routes');
const liveRoutes = require('./routes/live.routes');
const analyticsRoutes = require('./routes/analytics.routes');
const aiRoutes = require('./routes/ai.routes');
const moduleRoutes = require('./routes/module.routes');

app.use('/api/auth', authRoutes);
app.use('/api/lives', liveRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/modules', moduleRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/admin', require('./routes/admin.routes'));

// Error Handler
app.use((err, req, res, next) => {
    logger.error(`${err.status || 500} - ${err.message} - ${req.originalUrl} - ${req.method} - ${req.ip}`);
    logger.error(err.stack);
    res.status(500).json({ error: 'Something went wrong!' });
});

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    logger.info(`Server running on port ${PORT}`);
});
