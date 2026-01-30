const express = require('express');
const router = express.Router();
const analyticsController = require('../controllers/analyticsController');
const { authMiddleware } = require('../middlewares/auth');

router.get('/my-stats', authMiddleware, analyticsController.getMyStats);

module.exports = router;
