// backend/routes/posts.js
const express = require('express');
const router = express.Router();
const postController = require('../controllers/postController');
const { protect } = require('../middleware/auth'); 

// 1. Récupérer le fil d'actualité (Timeline) - Ne nécessite pas toujours le token, mais c'est mieux si on veut personnaliser le fil
// GET /api/posts/timeline 
router.get('/timeline', postController.getTimeline); 

// 2. Créer une nouvelle publication - REQUIERT LE TOKEN (protection)
// POST /api/posts
router.post('/', protect, postController.createPost); 

module.exports = router;