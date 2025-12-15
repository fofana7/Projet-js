// backend/routes/notifications.js
const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationController');
const { protect } = require('../middleware/auth');

// GET /api/notifications - Récupérer les notifications
router.get('/', protect, notificationController.getNotifications);

// POST /api/notifications/accept - Accepter une demande d'ami
router.post('/accept', protect, notificationController.acceptFriendRequest);

// POST /api/notifications/reject - Refuser une demande d'ami
router.post('/reject', protect, notificationController.rejectFriendRequest);

module.exports = router;
