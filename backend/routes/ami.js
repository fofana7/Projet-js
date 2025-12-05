const express = require('express');
const router = express.Router();

const friendsController = require('../controllers/amiController');

router.get('/', friendsController.getAllUsers);
router.post('/add', friendsController.sendFriendRequest);
router.post('/accept', friendsController.acceptFriendRequest);
router.post('/remove', friendsController.removeFriend);

module.exports = router;
