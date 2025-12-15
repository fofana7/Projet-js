// backend/routes/postInteractions.js
const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const postController = require('../controllers/postController');

// LIKES
router.post('/:postId/like', protect, postController.likePost);
router.delete('/:postId/like', protect, postController.unlikePost);
router.get('/:postId/likes', protect, postController.getLikes);

// COMMENTS
router.post('/:postId/comments', protect, postController.addComment);
router.get('/:postId/comments', protect, postController.getComments);
router.delete('/comments/:commentId', protect, postController.deleteComment);

module.exports = router;
