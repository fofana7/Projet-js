// backend/controllers/notificationController.js
const { pool } = require('../config/db');

// Récupérer les notifications de l'utilisateur connecté
exports.getNotifications = async (req, res) => {
    const userId = req.user.id;
    
    try {
        const result = await pool.query(
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
        
        res.status(200).json(result.rows);
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
