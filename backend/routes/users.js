// backend/routes/users.js
const express = require('express');
const router = express.Router();

// 1. Contrôleur
const userController = require('../controllers/userController'); 

// 2. Middleware
// Assurez-vous que le fichier '../middleware/auth' existe et exporte 'protect'
const { protect } = require('../middleware/auth'); 

// GET /api/users/me (Récupère le profil de l'utilisateur connecté)
router.get('/me', protect, userController.getMe);

// PUT /api/users/me (Mise à jour du profil)
router.put('/me', protect, userController.updateProfile);

module.exports = router;