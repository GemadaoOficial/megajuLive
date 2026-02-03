const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { authMiddleware, roleMiddleware } = require('../middlewares/auth');

// Apply Auth and Role check to all admin routes
router.use(authMiddleware);
router.use(roleMiddleware(['ADMIN']));

router.get('/dashboard', adminController.getDashboardStats);
router.get('/users', adminController.getUsers);
router.get('/users/:id', adminController.getUserDetails);
router.patch('/users/:id/status', adminController.updateUserStatus);

module.exports = router;
