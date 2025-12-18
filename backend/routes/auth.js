// backend/routes/auth.js
// Ce fichier définit les chemins d'accès pour l'API d'authentification.
const express = require('express');
const router = express.Router();
// Importe les fonctions de gestion (register, login) du contrôleur.
const authController = require('../controllers/authController'); 
const { protect } = require('../middleware/auth');

// Route POST /api/auth/register : Enregistrement d'un nouvel utilisateur
router.post('/register', authController.register);

// Route POST /api/auth/login : Connexion d'un utilisateur existant
router.post('/login', authController.login);

// Route POST /api/auth/change-password : Changer son mot de passe (utilisateur connecté)
router.post('/change-password', protect, authController.changePassword);

module.exports = router;