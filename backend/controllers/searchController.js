// backend/controllers/searchController.js
const { pool } = require('../config/db');

// Recherche globale
exports.globalSearch = async (req, res) => {
    const userId = req.user.id;
    const query = req.query.q || '';
    
    if (!query || query.trim().length < 2) {
        return res.status(400).json({ message: 'La recherche doit contenir au moins 2 caractères.' });
    }

    const searchTerm = `%${query}%`;

    try {
        // Rechercher utilisateurs
        const usersResult = await pool.query(
            `SELECT id, username, email, first_name, last_name, avatarurl, classe
             FROM users
             WHERE (username ILIKE $1 OR first_name ILIKE $1 OR last_name ILIKE $1 OR email ILIKE $1)
             AND id != $2
             LIMIT 10`,
            [searchTerm, userId]
        );

        // Rechercher posts
        const postsResult = await pool.query(
            `SELECT p.id, p.content, p.created_at, p.image_url, u.id AS user_id, u.username, u.first_name, u.last_name, u.avatarurl,
                    (SELECT COUNT(*) FROM post_likes WHERE post_id = p.id) as likes_count,
                    (SELECT COUNT(*) FROM post_comments WHERE post_id = p.id) as comments_count
             FROM posts p
             JOIN users u ON p.user_id = u.id
             WHERE p.content ILIKE $1
             AND (
                p.user_id = $2
                OR p.user_id IN (
                    SELECT DISTINCT CASE WHEN user_id_1 = $2 THEN user_id_2 ELSE user_id_1 END
                    FROM friendships
                    WHERE status = 'accepted' AND (user_id_1 = $2 OR user_id_2 = $2)
                )
             )
             ORDER BY p.created_at DESC
             LIMIT 10`,
            [searchTerm, userId]
        );

        // Rechercher amis
        const friendsResult = await pool.query(
            `SELECT DISTINCT
                CASE WHEN f.user_id_1 = $1 THEN f.user_id_2 ELSE f.user_id_1 END as friend_id,
                u.username, u.email, u.first_name, u.last_name, u.avatarurl, u.classe
             FROM friendships f
             JOIN users u ON (CASE WHEN f.user_id_1 = $1 THEN f.user_id_2 ELSE f.user_id_1 END) = u.id
             WHERE (f.user_id_1 = $1 OR f.user_id_2 = $1)
             AND f.status = 'accepted'
             AND (u.username ILIKE $2 OR u.first_name ILIKE $2 OR u.last_name ILIKE $2)
             LIMIT 10`,
            [userId, searchTerm]
        );

        res.status(200).json({
            users: usersResult.rows,
            posts: postsResult.rows,
            friends: friendsResult.rows
        });
    } catch (error) {
        console.error('Erreur recherche globale:', error);
        res.status(500).json({ message: 'Erreur serveur lors de la recherche.' });
    }
};

// Recherche utilisateurs uniquement
exports.searchUsers = async (req, res) => {
    const userId = req.user.id;
    const query = req.query.q || '';

    if (!query || query.trim().length < 2) {
        return res.status(400).json({ message: 'La recherche doit contenir au moins 2 caractères.' });
    }

    const searchTerm = `%${query}%`;

    try {
        const result = await pool.query(
            `SELECT id, username, email, first_name, last_name, avatarurl, classe, bio
             FROM users
             WHERE (username ILIKE $1 OR first_name ILIKE $1 OR last_name ILIKE $1 OR email ILIKE $1)
             AND id != $2
             ORDER BY username ASC
             LIMIT 20`,
            [searchTerm, userId]
        );

        // Pour chaque utilisateur, vérifier le statut d'amitié
        const enrichedUsers = await Promise.all(result.rows.map(async (user) => {
            const friendshipResult = await pool.query(
                `SELECT status FROM friendships
                 WHERE (user_id_1 = $1 AND user_id_2 = $2) OR (user_id_1 = $2 AND user_id_2 = $1)`,
                [userId, user.id]
            );
            const friendship = friendshipResult.rows[0];
            return {
                ...user,
                friendship_status: friendship ? friendship.status : null // null, 'pending', 'accepted'
            };
        }));

        res.status(200).json(enrichedUsers);
    } catch (error) {
        console.error('Erreur recherche utilisateurs:', error);
        res.status(500).json({ message: 'Erreur serveur lors de la recherche.' });
    }
};

// Recherche posts uniquement
exports.searchPosts = async (req, res) => {
    const userId = req.user.id;
    const query = req.query.q || '';

    if (!query || query.trim().length < 2) {
        return res.status(400).json({ message: 'La recherche doit contenir au moins 2 caractères.' });
    }

    const searchTerm = `%${query}%`;

    try {
        const result = await pool.query(
            `SELECT p.id, p.content, p.created_at, p.image_url, u.id AS user_id, u.username, u.first_name, u.last_name, u.avatarurl,
                    (SELECT COUNT(*) FROM post_likes WHERE post_id = p.id) as likes_count,
                    (SELECT COUNT(*) FROM post_comments WHERE post_id = p.id) as comments_count
             FROM posts p
             JOIN users u ON p.user_id = u.id
             WHERE p.content ILIKE $1
             AND (
                p.user_id = $2
                OR p.user_id IN (
                    SELECT DISTINCT CASE WHEN user_id_1 = $2 THEN user_id_2 ELSE user_id_1 END
                    FROM friendships
                    WHERE status = 'accepted' AND (user_id_1 = $2 OR user_id_2 = $2)
                )
             )
             ORDER BY p.created_at DESC
             LIMIT 20`,
            [searchTerm, userId]
        );

        res.status(200).json(result.rows);
    } catch (error) {
        console.error('Erreur recherche posts:', error);
        res.status(500).json({ message: 'Erreur serveur lors de la recherche.' });
    }
};

// Recherche amis uniquement
exports.searchFriends = async (req, res) => {
    const userId = req.user.id;
    const query = req.query.q || '';

    if (!query || query.trim().length < 2) {
        return res.status(400).json({ message: 'La recherche doit contenir au moins 2 caractères.' });
    }

    const searchTerm = `%${query}%`;

    try {
        const result = await pool.query(
            `SELECT DISTINCT
                CASE WHEN user_id_1 = $1 THEN user_id_2 ELSE user_id_1 END as friend_id,
                u.username, u.email, u.first_name, u.last_name, u.avatarurl, u.classe, u.bio
             FROM friendships f
             JOIN users u ON (CASE WHEN f.user_id_1 = $1 THEN f.user_id_2 ELSE f.user_id_1 END) = u.id
             WHERE f.status = 'accepted'
             AND (u.username ILIKE $2 OR u.first_name ILIKE $2 OR u.last_name ILIKE $2)
             ORDER BY u.username ASC
             LIMIT 20`,
            [userId, searchTerm]
        );

        res.status(200).json(result.rows);
    } catch (error) {
        console.error('Erreur recherche amis:', error);
        res.status(500).json({ message: 'Erreur serveur lors de la recherche.' });
    }
};
