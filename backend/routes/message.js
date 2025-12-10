// backend/routes/message.js
const express = require("express");
const router = express.Router();
const messageController = require("../controllers/messageController.js");
const { protect } = require("../middleware/auth");

// GET /api/messages/conversations - Récupérer toutes les conversations
router.get("/conversations", protect, messageController.getConversations);

// GET /api/messages/contacts - Récupérer tous les contacts
router.get("/contacts", protect, messageController.getContacts);

// GET /api/messages/:userId - Récupérer les messages avec un utilisateur
router.get("/:userId", protect, messageController.getMessages);

// POST /api/messages/send - Envoyer un message
router.post("/send", protect, messageController.sendMessage);

// POST /api/messages/:userId/archive - Archiver une conversation
router.post("/:userId/archive", protect, messageController.archiveConversation);

module.exports = router;
