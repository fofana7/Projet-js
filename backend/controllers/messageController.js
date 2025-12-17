// backend/controllers/messageController.js

const { pool } = require('../config/db');

module.exports = {
    // Récupérer les conversations de l'utilisateur connecté
    getConversations: async (req, res) => {
        try {
            const userId = req.user.id;
            
            // Récupérer les conversations avec le dernier message
            const result = await pool.query(`
                SELECT DISTINCT 
                    CASE 
                        WHEN sender_id = $1 THEN recipient_id 
                        ELSE sender_id 
                    END as other_user_id,
                    u.username,
                    u.avatarurl,
                    (SELECT text FROM messages m2 
                     WHERE (m2.sender_id = $1 AND m2.recipient_id = CASE WHEN sender_id = $1 THEN recipient_id ELSE sender_id END)
                     OR (m2.recipient_id = $1 AND m2.sender_id = CASE WHEN sender_id = $1 THEN recipient_id ELSE sender_id END)
                     ORDER BY m2.created_at DESC LIMIT 1) as last_message,
                    (SELECT created_at FROM messages m2 
                     WHERE (m2.sender_id = $1 AND m2.recipient_id = CASE WHEN sender_id = $1 THEN recipient_id ELSE sender_id END)
                     OR (m2.recipient_id = $1 AND m2.sender_id = CASE WHEN sender_id = $1 THEN recipient_id ELSE sender_id END)
                     ORDER BY m2.created_at DESC LIMIT 1) as last_message_time,
                    COUNT(CASE WHEN m.recipient_id = $1 AND m.is_read = false THEN 1 END) as unread_count
                FROM messages m
                JOIN users u ON u.id = CASE WHEN sender_id = $1 THEN recipient_id ELSE sender_id END
                WHERE sender_id = $1 OR recipient_id = $1
                GROUP BY other_user_id, u.username, u.avatarurl
                ORDER BY last_message_time DESC
            `, [userId]);

            res.json(result.rows);
        } catch (error) {
            console.error('Erreur récupération conversations:', error);
            res.status(500).json({ error: 'Erreur serveur' });
        }
    },

    // Récupérer les messages d'une conversation
    getMessages: async (req, res) => {
        try {
            const { userId } = req.params;
            const currentUserId = req.user.id;

            const result = await pool.query(`
                SELECT 
                    id, sender_id, recipient_id, text, file_url, created_at, is_read
                FROM messages
                WHERE (sender_id = $1 AND recipient_id = $2) OR (sender_id = $2 AND recipient_id = $1)
                ORDER BY created_at ASC
            `, [currentUserId, userId]);

            // Marquer les messages comme lus
            await pool.query(`
                UPDATE messages 
                SET is_read = true 
                WHERE recipient_id = $1 AND sender_id = $2 AND is_read = false
            `, [currentUserId, userId]);

            res.json(result.rows);
        } catch (error) {
            console.error('Erreur récupération messages:', error);
            res.status(500).json({ error: 'Erreur serveur' });
        }
    },

    // Envoyer un message
    sendMessage: async (req, res) => {
        try {
            const { recipientId, text, fileUrl } = req.body;
            const senderId = req.user.id;

            if (!recipientId || !text.trim()) {
                return res.status(400).json({ error: 'Destinataire et texte requis' });
            }

            const result = await pool.query(`
                INSERT INTO messages (sender_id, recipient_id, text, file_url, created_at, is_read)
                VALUES ($1, $2, $3, $4, NOW(), false)
                RETURNING *
            `, [senderId, recipientId, text, fileUrl || null]);

            res.status(201).json(result.rows[0]);
        } catch (error) {
            console.error('Erreur envoi message:', error);
            res.status(500).json({ error: 'Erreur serveur' });
        }
    },

    // Récupérer tous les utilisateurs pour la liste de contacts
    getContacts: async (req, res) => {
        try {
            const currentUserId = req.user.id;

            // Récupérer tous les utilisateurs (sauf l'utilisateur courant)
            const result = await pool.query(`
                SELECT u.id, u.username, u.email, u.avatarurl
                FROM users u
                WHERE u.id != $1
                ORDER BY u.username ASC
            `, [currentUserId]);

            res.json(result.rows);
        } catch (error) {
            console.error('Erreur récupération contacts:', error);
            res.status(500).json({ error: 'Erreur serveur' });
        }
    },

    // Marquer une conversation comme archivée
    archiveConversation: async (req, res) => {
        try {
            const { userId } = req.params;
            const currentUserId = req.user.id;

            await pool.query(`
                INSERT INTO archived_conversations (user_id, archived_with_user_id)
                VALUES ($1, $2)
                ON CONFLICT (user_id, archived_with_user_id) DO NOTHING
            `, [currentUserId, userId]);

            res.json({ success: true });
        } catch (error) {
            console.error('Erreur archivage:', error);
            res.status(500).json({ error: 'Erreur serveur' });
        }
    },

    // === MESSAGES DE GROUPE ===

    // Récupérer les messages d'un groupe (seulement si l'utilisateur en est membre)
    getGroupMessages: async (req, res) => {
        try {
            const { groupId } = req.params;
            const currentUserId = req.user.id;

            // Vérifier que l'utilisateur est membre du groupe
            const memberCheck = await pool.query(
                `SELECT id FROM group_members WHERE group_id = $1 AND user_id = $2`,
                [groupId, currentUserId]
            );

            if (memberCheck.rows.length === 0) {
                return res.status(403).json({ error: 'Vous n\'êtes pas membre de ce groupe' });
            }

            // Récupérer les messages du groupe
            const result = await pool.query(`
                SELECT 
                    gm.id, gm.sender_id, gm.text, gm.file_url, gm.created_at,
                    u.username, u.avatarurl
                FROM group_messages gm
                JOIN users u ON u.id = gm.sender_id
                WHERE gm.group_id = $1
                ORDER BY gm.created_at ASC
            `, [groupId]);

            res.json(result.rows);
        } catch (error) {
            console.error('Erreur récupération messages groupe:', error);
            res.status(500).json({ error: 'Erreur serveur' });
        }
    },

    // Envoyer un message à un groupe (seulement si l'utilisateur en est membre)
    sendGroupMessage: async (req, res) => {
        try {
            const { groupId, text, fileUrl } = req.body;
            const senderId = req.user.id;

            if (!groupId || !text.trim()) {
                return res.status(400).json({ error: 'ID groupe et texte requis' });
            }

            // Vérifier que l'utilisateur est membre du groupe
            const memberCheck = await pool.query(
                `SELECT id FROM group_members WHERE group_id = $1 AND user_id = $2`,
                [groupId, senderId]
            );

            if (memberCheck.rows.length === 0) {
                return res.status(403).json({ error: 'Vous n\'êtes pas membre de ce groupe' });
            }

            // Envoyer le message
            const result = await pool.query(`
                INSERT INTO group_messages (group_id, sender_id, text, file_url, created_at)
                VALUES ($1, $2, $3, $4, NOW())
                RETURNING *
            `, [groupId, senderId, text, fileUrl || null]);

            res.status(201).json(result.rows[0]);
        } catch (error) {
            console.error('Erreur envoi message groupe:', error);
            res.status(500).json({ error: 'Erreur serveur' });
        }
    }
};
