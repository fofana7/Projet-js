const express = require('express');
const router = express.Router();
const content = require('../controllers/contentController');
const { protect, requireRole } = require('../middleware/auth');

// Docs
router.post('/docs', protect, content.createDoc);
router.get('/docs', content.listDocs);

// Events
router.post('/events', protect, content.createEvent);
router.get('/events', content.listEvents);

// Announcements - réservé au personnel académique
router.post('/announcements', protect, requireRole('personnel'), content.createAnnouncement);
router.get('/announcements', content.listAnnouncements);

// Polls
router.post('/polls', protect, content.createPoll);
router.get('/polls', content.listPolls);
router.post('/polls/:id/vote', protect, content.votePoll);

router.post('/ressource', protect, requireRole('enseignant'), content.createResource);
router.post('/classe', protect, requireRole('enseignant'), content.createClassInfo);
module.exports = router;
