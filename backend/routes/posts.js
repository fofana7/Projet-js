// backend/routes/posts.js
const express = require('express');
const router = express.Router();
const postController = require('../controllers/postController');
const { protect, requireRole } = require('../middleware/auth'); 

// 1. Récupérer le fil d'actualité (Timeline) - REQUIERT LE TOKEN pour filtrer par amis acceptés
// GET /api/posts/timeline 
router.get('/timeline', protect, postController.getTimeline); 

// 2. Créer une nouvelle publication - REQUIERT LE TOKEN (protection)
// POST /api/posts
router.post('/', protect, requireRole(['eleve', 'enseignant', 'personnel']), postController.createPost); 

// 3. Supprimer une publication - REQUIERT LE TOKEN (seul l'auteur peut la supprimer)
// DELETE /api/posts/:id
router.delete('/:id', protect, requireRole(['eleve', 'enseignant', 'personnel']), postController.deletePost);

module.exports = router;