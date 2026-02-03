const express = require('express');
const router = express.Router();
const liveController = require('../controllers/liveController');
const { authMiddleware } = require('../middlewares/auth');
const upload = require('../middlewares/upload');

router.use(authMiddleware);

router.post('/start', liveController.startLive);
router.patch('/:id/update', liveController.updateLive);
router.post('/:id/finish', authMiddleware, upload.array('screenshots', 10), liveController.finishLive);

// Scheduling Routes
router.post('/schedule', liveController.scheduleLive);
router.get('/schedule', liveController.getScheduledLives);
router.patch('/schedule/:id', liveController.updateScheduledLive);
router.delete('/schedule/:id', liveController.deleteScheduledLive);

router.get('/', liveController.getLiveHistory);
router.get('/:id', liveController.getLiveDetails);

module.exports = router;
