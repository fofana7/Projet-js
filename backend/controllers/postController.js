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

// 2. Récupérer le fil d'actualité (Timeline) - seulement les amis acceptés + ses propres posts
exports.getTimeline = async (req, res) => {
    const userId = req.user.id; // L'utilisateur connecté
    
    try {
        const result = await pool.query(
            `SELECT 
                p.id, p.content, p.image_url, p.image_data, p.created_at, 
                u.id AS user_id, u.username, COALESCE(u.avatarurl, 'https://i.pravatar.cc/150') AS avatarurl 
            FROM posts p
            JOIN users u ON p.user_id = u.id
            WHERE 
                -- Posts de l'utilisateur lui-même
                p.user_id = $1
                OR
                -- Posts des amis acceptés
                p.user_id IN (
                    SELECT DISTINCT 
                        CASE 
                            WHEN user_id_1 = $1 THEN user_id_2
                            WHEN user_id_2 = $1 THEN user_id_1
                        END AS friend_id
                    FROM friendships
                    WHERE status = 'accepted' 
                        AND (user_id_1 = $1 OR user_id_2 = $1)
                )
            ORDER BY p.created_at DESC
            LIMIT 20`,
            [userId]
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

// 4. LIKES - Aimer un post
exports.likePost = async (req, res) => {
    const userId = req.user.id;
    const postId = parseInt(req.params.postId, 10);

    if (Number.isNaN(postId)) {
        return res.status(400).json({ message: 'ID de post invalide.' });
    }

    try {
        // Vérifier que le post existe
        const postCheck = await pool.query('SELECT id FROM posts WHERE id = $1', [postId]);
        if (postCheck.rows.length === 0) {
            return res.status(404).json({ message: 'Post introuvable.' });
        }

        // Ajouter le like
        const result = await pool.query(
            'INSERT INTO post_likes (post_id, user_id) VALUES ($1, $2) RETURNING *',
            [postId, userId]
        );

        res.status(201).json({ message: 'Post aimé', like: result.rows[0] });
    } catch (error) {
        if (error.code === '23505') {
            return res.status(400).json({ message: 'Vous avez déjà aimé ce post.' });
        }
        console.error('Erreur like:', error);
        res.status(500).json({ message: 'Erreur serveur lors du like.' });
    }
};

// 5. UNLIKE - Retirer le like
exports.unlikePost = async (req, res) => {
    const userId = req.user.id;
    const postId = parseInt(req.params.postId, 10);

    if (Number.isNaN(postId)) {
        return res.status(400).json({ message: 'ID de post invalide.' });
    }

    try {
        await pool.query(
            'DELETE FROM post_likes WHERE post_id = $1 AND user_id = $2',
            [postId, userId]
        );
        res.status(200).json({ message: 'Like supprimé' });
    } catch (error) {
        console.error('Erreur unlike:', error);
        res.status(500).json({ message: 'Erreur serveur lors de la suppression du like.' });
    }
};

// 6. GET LIKES - Récupérer les likes d'un post
exports.getLikes = async (req, res) => {
    const postId = parseInt(req.params.postId, 10);

    if (Number.isNaN(postId)) {
        return res.status(400).json({ message: 'ID de post invalide.' });
    }

    try {
        const result = await pool.query(
            `SELECT pl.id, u.id AS user_id, u.username, u.avatarurl 
             FROM post_likes pl
             JOIN users u ON pl.user_id = u.id
             WHERE pl.post_id = $1
             ORDER BY pl.created_at DESC`,
            [postId]
        );
        res.status(200).json(result.rows);
    } catch (error) {
        console.error('Erreur récupération likes:', error);
        res.status(500).json({ message: 'Erreur serveur.' });
    }
};

// 7. ADD COMMENT - Ajouter un commentaire
exports.addComment = async (req, res) => {
    const userId = req.user.id;
    const postId = parseInt(req.params.postId, 10);
    const { content } = req.body;

    if (Number.isNaN(postId)) {
        return res.status(400).json({ message: 'ID de post invalide.' });
    }

    if (!content || content.trim().length === 0) {
        return res.status(400).json({ message: 'Le commentaire ne peut pas être vide.' });
    }

    try {
        // Vérifier que le post existe
        const postCheck = await pool.query('SELECT id FROM posts WHERE id = $1', [postId]);
        if (postCheck.rows.length === 0) {
            return res.status(404).json({ message: 'Post introuvable.' });
        }

        // Ajouter le commentaire
        const result = await pool.query(
            'INSERT INTO post_comments (post_id, user_id, content) VALUES ($1, $2, $3) RETURNING *',
            [postId, userId, content]
        );

        res.status(201).json({ message: 'Commentaire ajouté', comment: result.rows[0] });
    } catch (error) {
        console.error('Erreur ajout commentaire:', error);
        res.status(500).json({ message: 'Erreur serveur lors de l\'ajout du commentaire.' });
    }
};

// 8. GET COMMENTS - Récupérer les commentaires d'un post
exports.getComments = async (req, res) => {
    const postId = parseInt(req.params.postId, 10);

    if (Number.isNaN(postId)) {
        return res.status(400).json({ message: 'ID de post invalide.' });
    }

    try {
        const result = await pool.query(
            `SELECT pc.id, pc.content, pc.created_at, u.id AS user_id, u.username, u.avatarurl
             FROM post_comments pc
             JOIN users u ON pc.user_id = u.id
             WHERE pc.post_id = $1
             ORDER BY pc.created_at ASC`,
            [postId]
        );
        res.status(200).json(result.rows);
    } catch (error) {
        console.error('Erreur récupération commentaires:', error);
        res.status(500).json({ message: 'Erreur serveur.' });
    }
};

// 9. DELETE COMMENT - Supprimer un commentaire
exports.deleteComment = async (req, res) => {
    const userId = req.user.id;
    const commentId = parseInt(req.params.commentId, 10);

    if (Number.isNaN(commentId)) {
        return res.status(400).json({ message: 'ID de commentaire invalide.' });
    }

    try {
        // Vérifier que le commentaire appartient à l'utilisateur
        const check = await pool.query('SELECT id, user_id FROM post_comments WHERE id = $1', [commentId]);
        const comment = check.rows[0];

        if (!comment) {
            return res.status(404).json({ message: 'Commentaire introuvable.' });
        }

        if (comment.user_id !== userId) {
            return res.status(403).json({ message: 'Vous ne pouvez supprimer que vos propres commentaires.' });
        }

        await pool.query('DELETE FROM post_comments WHERE id = $1', [commentId]);
        res.status(200).json({ message: 'Commentaire supprimé' });
    } catch (error) {
        console.error('Erreur suppression commentaire:', error);
        res.status(500).json({ message: 'Erreur serveur lors de la suppression.' });
    }
};