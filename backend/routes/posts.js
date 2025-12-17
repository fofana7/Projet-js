// backend/routes/posts.js
const express = require('express');
const router = express.Router();
const postController = require('../controllers/postController');
const { protect, requireRole } = require('../middleware/auth'); 

// Routes spécifiques AVANT les routes dynamiques

// 1. Récupérer le fil d'actualité (Timeline) - REQUIERT LE TOKEN pour filtrer par amis acceptés
// GET /api/posts/timeline 
router.get('/timeline', protect, postController.getTimeline); 

// 2. Créer une nouvelle publication - REQUIERT LE TOKEN (protection)
// POST /api/posts
router.post('/', protect, requireRole(['eleve', 'enseignant', 'personnel']), postController.createPost); 

// 3. Comment DELETE spécifique - /comments/:commentId AVANT /:postId/*
router.delete('/comments/:commentId', protect, postController.deleteComment);

// 4. Like/Unlike routes - /:postId/like
router.post('/:postId/like', protect, postController.likePost);
router.delete('/:postId/like', protect, postController.unlikePost);
router.get('/:postId/likes', protect, postController.getLikes);

// 5. Comment routes - /:postId/comments
router.post('/:postId/comments', protect, postController.addComment);
router.get('/:postId/comments', protect, postController.getComments);

// 6. Récupérer les posts d'un utilisateur spécifique - /user/:userId AVANT /:id
// GET /api/posts/user/:userId
router.get('/user/:userId', protect, postController.getUserPosts);

// 7. Supprimer une publication - /:id (DERNIÈRE car la plus générique)
// DELETE /api/posts/:id
router.delete('/:id', protect, requireRole(['eleve', 'enseignant', 'personnel']), postController.deletePost);

module.exports = router;