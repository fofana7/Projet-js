// backend/controllers/notificationController.js
const { pool } = require('../config/db');

// Récupérer les notifications de l'utilisateur connecté
exports.getNotifications = async (req, res) => {
    const userId = req.user.id;
    
    try {
        // Notifications de demandes d'amis
        const friendRequestsResult = await pool.query(
            `SELECT 
                f.id, 
                f.user_id_1 as from_user_id,
                u.username, 
                u.first_name, 
                u.last_name,
                u.avatarurl,
                f.created_at,
                f.status,
                'friend_request' as type
            FROM friendships f
            JOIN users u ON f.user_id_1 = u.id
            WHERE f.user_id_2 = $1 AND f.status = 'pending'
            ORDER BY f.created_at DESC
            LIMIT 20`,
            [userId]
        );

        // Notifications de photos postées par les amis
        const photoNotificationsResult = await pool.query(
            `SELECT DISTINCT
                p.id,
                p.user_id as from_user_id,
                u.username,
                u.first_name,
                u.last_name,
                u.avatarurl,
                p.created_at,
                'photo_post' as type,
                SUBSTRING(p.content, 1, 100) as preview
            FROM posts p
            JOIN users u ON p.user_id = u.id
            JOIN friendships f ON (
                (f.user_id_1 = $1 AND f.user_id_2 = p.user_id) OR
                (f.user_id_2 = $1 AND f.user_id_1 = p.user_id)
            )
            WHERE f.status = 'accepted'
            AND (p.image_url IS NOT NULL OR p.image_data IS NOT NULL)
            AND p.created_at > NOW() - INTERVAL '7 days'
            ORDER BY p.created_at DESC
            LIMIT 20`,
            [userId]
        );

        // Notifications de commentaires sur les posts de l'utilisateur
        const commentNotificationsResult = await pool.query(
            `SELECT DISTINCT
                cn.id,
                cn.from_user_id,
                u.username,
                u.first_name,
                u.last_name,
                u.avatarurl,
                cn.created_at,
                'comment_reply' as type,
                SUBSTRING(pc.content, 1, 100) as preview,
                cn.post_id,
                pc.content
            FROM comment_notifications cn
            JOIN users u ON cn.from_user_id = u.id
            JOIN post_comments pc ON cn.comment_id = pc.id
            WHERE cn.to_user_id = $1 AND cn.is_read = FALSE
            ORDER BY cn.created_at DESC
            LIMIT 20`,
            [userId]
        );

        // Notifications de likes sur les posts de l'utilisateur
        const likeNotificationsResult = await pool.query(
            `SELECT DISTINCT
                ln.id,
                ln.from_user_id,
                u.username,
                u.first_name,
                u.last_name,
                u.avatarurl,
                ln.created_at,
                'like_post' as type,
                SUBSTRING(p.content, 1, 100) as preview,
                ln.post_id
            FROM like_notifications ln
            JOIN users u ON ln.from_user_id = u.id
            JOIN posts p ON ln.post_id = p.id
            WHERE ln.to_user_id = $1 AND ln.is_read = FALSE
            ORDER BY ln.created_at DESC
            LIMIT 20`,
            [userId]
        );

        // Notifications d'annonces
        const announcementNotificationsResult = await pool.query(
            `SELECT DISTINCT
                an.id,
                a.id as announcement_id,
                a.author,
                an.created_at,
                'announcement' as type,
                SUBSTRING(a.title, 1, 100) as preview,
                a.title,
                a.class_name
            FROM announcement_notifications an
            JOIN announcements a ON an.announcement_id = a.id
            WHERE an.to_user_id = $1 AND an.is_read = FALSE
            ORDER BY an.created_at DESC
            LIMIT 20`,
            [userId]
        );

        // Combiner et trier tous les résultats
        const allNotifications = [
            ...friendRequestsResult.rows,
            ...photoNotificationsResult.rows,
            ...commentNotificationsResult.rows,
            ...likeNotificationsResult.rows,
            ...announcementNotificationsResult.rows
        ].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

        res.status(200).json(allNotifications.slice(0, 20));
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Erreur serveur lors de la récupération des notifications." });
    }
};

// Accepter une demande d'ami
exports.acceptFriendRequest = async (req, res) => {
    const userId = req.user.id;
    const { friendshipId } = req.body;
    
    try {
        const result = await pool.query(
            'UPDATE friendships SET status = $1 WHERE id = $2 AND user_id_2 = $3 RETURNING *',
            ['accepted', friendshipId, userId]
        );
        
        if (result.rows.length === 0) {
            return res.status(404).json({ message: "Friendship request not found" });
        }
        
        res.status(200).json({ message: "Friend request accepted", friendship: result.rows[0] });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Erreur serveur lors de l'acceptation de la demande." });
    }
};

// Refuser une demande d'ami
exports.rejectFriendRequest = async (req, res) => {
    const userId = req.user.id;
    const { friendshipId } = req.body;
    
    try {
        const result = await pool.query(
            'DELETE FROM friendships WHERE id = $1 AND user_id_2 = $2 RETURNING *',
            [friendshipId, userId]
        );
        
        if (result.rows.length === 0) {
            return res.status(404).json({ message: "Friendship request not found" });
        }
        
        res.status(200).json({ message: "Friend request rejected" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Erreur serveur lors du refus de la demande." });
    }
};
