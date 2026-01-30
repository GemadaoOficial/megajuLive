const express = require('express');
const router = express.Router();
const aiController = require('../controllers/aiController');
const upload = require('../middlewares/upload');
const { authMiddleware } = require('../middlewares/auth');

router.post('/extract-screenshot', authMiddleware, upload.array('screenshots', 10), aiController.extractScreenshot);

module.exports = router;
