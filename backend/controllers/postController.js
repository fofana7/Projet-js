// backend/controllers/postController.js
const { pool } = require('../config/db'); // Utiliser la configuration DB centralisée

// 1. Publier un nouveau post
exports.createPost = async (req, res) => {
    // req.user.id vient du token JWT (Middleware 'protect')
    const userId = req.user.id; 
    const { content, imageUrl, imageData } = req.body; // imageUrl ou imageData sont optionnels

    if (!content) {
        return res.status(400).json({ message: "Le contenu de la publication est requis." });
    }

    try {
        const result = await pool.query(
            'INSERT INTO posts (user_id, content, image_url, image_data) VALUES ($1, $2, $3, $4) RETURNING *',
            [userId, content, imageUrl || null, imageData || null]
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
                p.id, p.content, p.image_url, p.image_data, p.created_at, 
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

// 3. Supprimer un post existant (seulement par son auteur)
exports.deletePost = async (req, res) => {
    const userId = req.user.id;
    const postId = parseInt(req.params.id, 10);

    if (Number.isNaN(postId)) {
        return res.status(400).json({ message: 'ID de post invalide.' });
    }

    try {
        // Vérifier que le post appartient bien à l'utilisateur connecté
        const check = await pool.query('SELECT id, user_id FROM posts WHERE id = $1', [postId]);
        const post = check.rows[0];

        if (!post) {
            return res.status(404).json({ message: 'Post introuvable.' });
        }

        if (post.user_id !== userId) {
            return res.status(403).json({ message: 'Vous ne pouvez supprimer que vos propres posts.' });
        }

        await pool.query('DELETE FROM posts WHERE id = $1', [postId]);
        return res.status(200).json({ message: 'Post supprimé avec succès.' });
    } catch (error) {
        console.error('Erreur suppression post:', error);
        return res.status(500).json({ message: 'Erreur serveur lors de la suppression du post.' });
    }
};