const express = require('express');
const router = express.Router();
const moduleController = require('../controllers/moduleController');
const { authMiddleware } = require('../middlewares/auth');

router.use(authMiddleware);

router.get('/', moduleController.getAllModules);
router.get('/:slug', moduleController.getModuleBySlug);
router.post('/:id/complete', moduleController.completeModule);

// Admin Routes
const { roleMiddleware } = require('../middlewares/auth');
router.post('/', roleMiddleware(['ADMIN']), moduleController.createModule);
router.patch('/:id', roleMiddleware(['ADMIN']), moduleController.updateModule);
router.delete('/:id', roleMiddleware(['ADMIN']), moduleController.deleteModule);

module.exports = router;
