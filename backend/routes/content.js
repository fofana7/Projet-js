const express = require('express');
const router = express.Router();
const content = require('../controllers/contentController');
const { protect } = require('../middleware/auth');

// Docs
router.post('/docs', protect, content.createDoc);
router.get('/docs', content.listDocs);

// Events
router.post('/events', protect, content.createEvent);
router.get('/events', content.listEvents);

// Announcements
router.post('/announcements', protect, content.createAnnouncement);
router.get('/announcements', content.listAnnouncements);

// Polls
router.post('/polls', protect, content.createPoll);
router.get('/polls', content.listPolls);
router.post('/polls/:id/vote', protect, content.votePoll);

module.exports = router;
