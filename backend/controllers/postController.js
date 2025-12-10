// backend/controllers/postController.js
const { pool } = require('../config/db'); // Utiliser la configuration DB centralisée

// 1. Publier un nouveau post
exports.createPost = async (req, res) => {
    // req.user.id vient du token JWT (Middleware 'protect')
    const userId = req.user.id; 
    const { content, imageUrl } = req.body; // imageUrl est optionnel

    if (!content) {
        return res.status(400).json({ message: "Le contenu de la publication est requis." });
    }

    try {
        const result = await pool.query(
            'INSERT INTO posts (user_id, content, image_url) VALUES ($1, $2, $3) RETURNING *',
            [userId, content, imageUrl || null]
        );
        res.status(201).json({ 
            message: "Publication créée avec succès.", 
            post: result.rows[0] 
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Erreur serveur lors de la publication." });
    }
};

// 2. Récupérer le fil d'actualité (Timeline)
exports.getTimeline = async (req, res) => {
    // Dans un vrai réseau, on filtrerait par amis. Ici, on prend les 20 derniers posts avec le nom de l'auteur.
    try {
        const result = await pool.query(
            `SELECT 
                p.id, p.content, p.image_url, p.created_at, 
                u.id AS user_id, u.username, COALESCE(u.avatarurl, 'https://i.pravatar.cc/150') AS avatarurl 
            FROM posts p
            JOIN users u ON p.user_id = u.id
            ORDER BY p.created_at DESC
            LIMIT 20`
        );
        res.status(200).json(result.rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Erreur serveur lors de la récupération du fil." });
    }
};