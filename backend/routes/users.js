// backend/routes/users.js
const express = require('express');
const router = express.Router();

// 1. Contrôleur
const userController = require('../controllers/userController'); 

// 2. Middleware
// Assurez-vous que le fichier '../middleware/auth' existe et exporte 'protect'
const { protect } = require('../middleware/auth'); 

// GET /api/users/me (Récupère le profil de l'utilisateur connecté)
// IMPORTANT: Doit être AVANT /:id sinon 'me' est traité comme un ID !
router.get('/me', protect, userController.getMe);

// GET /api/users/:id/friends (Récupère les amis d'un utilisateur)
// IMPORTANT: Doit être AVANT /:id sinon 'friends' est traité comme un ID !
router.get('/:id/friends', protect, userController.getUserFriends);

// GET /api/users/:id (Récupère le profil d'un utilisateur par ID)
router.get('/:id', protect, userController.getUserById);

// PUT /api/users/me (Mise à jour du profil)
router.put('/me', protect, userController.updateProfile);

module.exports = router;