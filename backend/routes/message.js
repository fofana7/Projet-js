// backend/routes/messages.js
const express = require("express");
const router = express.Router();

const messageController = require("../controllers/messageController.js");

router.get("/private", messageController.getPrivateMessages);
router.post("/send", messageController.sendMessage);

module.exports = router;
