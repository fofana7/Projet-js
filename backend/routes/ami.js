const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const amiController = require('../controllers/amiController');

// Routes publiques (récupérer tous les utilisateurs)
router.get('/', protect, amiController.getAllUsers);

// Routes protégées (demandes, amis, groupes)
router.get('/friends', protect, amiController.getMyFriends);
router.get('/requests', protect, amiController.getFriendRequests);
router.get('/groups', protect, amiController.getMyGroups);
router.get('/check/:friendId', protect, amiController.checkFriendship);

// Actions sur les amis
router.post('/add', protect, amiController.addFriend);
router.post('/accept', protect, amiController.acceptRequest);
router.post('/reject', protect, amiController.rejectRequest);
router.post('/remove', protect, amiController.removeFriend);

// Groupes
router.post('/groups/create', protect, amiController.createGroup);
router.post('/groups/leave', protect, amiController.leaveGroup);

module.exports = router;
