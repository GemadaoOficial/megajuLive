const express = require('express');
const router = express.Router();
const liveController = require('../controllers/liveController');
const { authMiddleware } = require('../middlewares/auth');

router.use(authMiddleware);

router.post('/start', liveController.startLive);
router.patch('/:id/update', liveController.updateLive);
router.post('/:id/finish', liveController.finishLive);
router.get('/', liveController.getLiveHistory);
router.get('/:id', liveController.getLiveDetails);

module.exports = router;
