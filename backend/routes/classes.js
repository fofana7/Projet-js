const express = require('express');
const router = express.Router();
const classController = require('../controllers/classController');
const { protect, requireRole } = require('../middleware/auth');

// Liste des classes : accessible sans authentification (utilisée à l'inscription)
router.get('/', classController.listClasses);

// Création / désactivation réservées au personnel ou admin
router.post('/', protect, requireRole(['personnel', 'admin']), classController.createClass);
router.patch('/:id/deactivate', protect, requireRole(['personnel', 'admin']), classController.deactivateClass);

module.exports = router;
