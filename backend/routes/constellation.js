const express = require('express');
const router = express.Router();
const { pool } = require('../config/db');
const { protect } = require('../middleware/auth');

// GET /api/constellation — renvoie l'utilisateur courant + ses amis
router.get('/', protect, async (req, res) => {
  try {
    const userId = req.user.id;

    // Utilisateur courant
    const meRes = await pool.query(
      'SELECT id, username, first_name, last_name, avatarurl, bio FROM users WHERE id = $1',
      [userId]
    );
    const me = meRes.rows[0];

    // Amis acceptés
    const friendsRes = await pool.query(
      `SELECT DISTINCT u.id, u.username, u.first_name, u.last_name, u.avatarurl, u.bio
       FROM users u
       JOIN friendships f ON (
          (f.user_id_1 = $1 AND f.user_id_2 = u.id) OR
          (f.user_id_2 = $1 AND f.user_id_1 = u.id)
       )
       WHERE f.status = 'accepted'
       ORDER BY u.first_name NULLS LAST, u.username`,
      [userId]
    );

    const friends = friendsRes.rows;

    // Représenter les liens du user vers chaque ami
    const friendships = friends.map(f => ({
      user_id_1: userId,
      user_id_2: f.id,
      status: 'accepted'
    }));

    res.json({ me, friends, friendships });
  } catch (err) {
    console.error('Erreur API constellation:', err);
    res.status(500).json({ error: 'Erreur serveur constellation' });
  }
});

module.exports = router;
