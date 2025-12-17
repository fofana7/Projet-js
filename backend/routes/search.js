// backend/routes/search.js
const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const searchController = require('../controllers/searchController');

// Recherche globale (utilisateurs, posts, amis)
router.get('/', protect, searchController.globalSearch);

// Recherche utilisateurs
router.get('/users', protect, searchController.searchUsers);

// Recherche posts
router.get('/posts', protect, searchController.searchPosts);

// Recherche amis
router.get('/friends', protect, searchController.searchFriends);

module.exports = router;
