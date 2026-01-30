const express = require('express');
const router = express.Router();
const moduleController = require('../controllers/moduleController');
const { authMiddleware } = require('../middlewares/auth');

router.use(authMiddleware);

router.get('/', moduleController.getAllModules);
router.get('/:slug', moduleController.getModuleBySlug);
router.post('/:id/complete', moduleController.completeModule);

module.exports = router;
