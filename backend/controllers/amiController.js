// backend/controllers/amiController.js
const { pool } = require('../config/db');

module.exports = {
    // Récupérer tous les utilisateurs
    getAllUsers: async (req, res) => {
        try {
            const result = await pool.query(
                'SELECT id, username, email, first_name, last_name, bio FROM users WHERE id != $1 ORDER BY first_name',
                [req.user.id]
            );
            res.json(result.rows);
        } catch (error) {
            console.error('❌ Erreur utilisateurs:', error);
            res.status(500).json({ error: 'Erreur serveur' });
        }
    },

    // Obtenir mes amis
    getMyFriends: async (req, res) => {
        try {
            const result = await pool.query(
                `SELECT DISTINCT u.id, u.username, u.email, u.first_name, u.last_name, u.bio
                 FROM users u
                 JOIN friendships f ON (
                    (f.user_id_1 = $1 AND f.user_id_2 = u.id) OR
                    (f.user_id_2 = $1 AND f.user_id_1 = u.id)
                 )
                 WHERE f.status = 'accepted'
                 ORDER BY u.first_name`,
                [req.user.id]
            );
            console.log(`✓ Amis chargés: ${result.rows.length}`);
            res.json(result.rows);
        } catch (error) {
            console.error('❌ Erreur amis:', error);
            res.status(500).json({ error: 'Erreur serveur' });
        }
    },

    // Obtenir les demandes d'amitié reçues
    getFriendRequests: async (req, res) => {
        try {
            const result = await pool.query(
                `SELECT u.id, u.username, u.email, u.first_name, u.last_name, u.bio
                 FROM users u
                 JOIN friendships f ON f.user_id_1 = u.id
                 WHERE f.user_id_2 = $1 AND f.status = 'pending'
                 ORDER BY u.first_name`,
                [req.user.id]
            );
            console.log(`✓ Demandes chargées: ${result.rows.length}`);
            res.json(result.rows);
        } catch (error) {
            console.error('❌ Erreur demandes:', error);
            res.status(500).json({ error: 'Erreur serveur' });
        }
    },

    // Envoyer une demande d'amitié
    addFriend: async (req, res) => {
        try {
            const { toId } = req.body;
            const fromId = req.user.id;

            console.log(`Demande d'amitié: ${fromId} -> ${toId}`);

            if (!toId) {
                return res.status(400).json({ error: 'toId requis' });
            }

            // Vérifier que l'utilisateur existe
            const userExists = await pool.query('SELECT id FROM users WHERE id = $1', [toId]);
            if (userExists.rows.length === 0) {
                return res.status(404).json({ error: 'Utilisateur introuvable' });
            }

            // Vérifier s'il n'y a pas déjà une relation
            const existing = await pool.query(
                `SELECT id, user_id_1, user_id_2, status FROM friendships 
                 WHERE (user_id_1 = $1 AND user_id_2 = $2) OR (user_id_1 = $2 AND user_id_2 = $1)`,
                [fromId, toId]
            );

            if (existing.rows.length > 0) {
                const rel = existing.rows[0];

                // 1) Déjà amis
                if (rel.status === 'accepted') {
                    return res.json({ success: true, message: 'Vous êtes déjà amis.' });
                }

                // 2) Demande déjà envoyée par moi
                if (rel.status === 'pending' && rel.user_id_1 === fromId) {
                    return res.json({ success: true, message: 'Demande déjà envoyée.' });
                }

                // 3) Demande reçue de l'autre utilisateur → l'accepter automatiquement
                if (rel.status === 'pending' && rel.user_id_2 === fromId) {
                    await pool.query(
                        `UPDATE friendships 
                         SET status = 'accepted' 
                         WHERE id = $1`,
                        [rel.id]
                    );
                    console.log(`✓ Demande existante acceptée automatiquement: ${toId} <-> ${fromId}`);
                    return res.json({ success: true, message: 'Demande existante acceptée. Vous êtes maintenant amis.' });
                }

                // Cas de repli (devrait être rare)
                return res.status(400).json({ error: 'Relation déjà existante' });
            }

            // Créer la demande
            await pool.query(
                'INSERT INTO friendships (user_id_1, user_id_2, status) VALUES ($1, $2, $3)',
                [fromId, toId, 'pending']
            );

            console.log(`✓ Demande d'amitié envoyée`);
            res.json({ success: true, message: 'Demande envoyée' });
        } catch (error) {
            console.error('❌ Erreur ajout ami:', error);
            res.status(500).json({ error: 'Erreur serveur' });
        }
    },

    // Accepter une demande d'amitié
    acceptRequest: async (req, res) => {
        try {
            const { fromId } = req.body;
            const toId = req.user.id;

            console.log(`Accepter demande: ${fromId} -> ${toId}`);

            if (!fromId) {
                return res.status(400).json({ error: 'fromId requis' });
            }

            // Mettre à jour le statut à 'accepted'
            const result = await pool.query(
                `UPDATE friendships 
                 SET status = 'accepted' 
                 WHERE user_id_1 = $1 AND user_id_2 = $2 AND status = 'pending'
                 RETURNING *`,
                [fromId, toId]
            );

            if (result.rows.length === 0) {
                return res.status(404).json({ error: 'Demande introuvable' });
            }

            console.log(`✓ Ami accepté: ${fromId} <-> ${toId}`);
            res.json({ success: true, message: 'Ami ajouté' });
        } catch (error) {
            console.error('❌ Erreur acceptation:', error);
            res.status(500).json({ error: 'Erreur serveur' });
        }
    },

    // Rejeter une demande d'amitié
    rejectRequest: async (req, res) => {
        try {
            const { fromId } = req.body;
            const toId = req.user.id;

            if (!fromId) {
                return res.status(400).json({ error: 'fromId requis' });
            }

            // Supprimer la demande
            const result = await pool.query(
                `DELETE FROM friendships 
                 WHERE user_id_1 = $1 AND user_id_2 = $2 AND status = 'pending'
                 RETURNING *`,
                [fromId, toId]
            );

            if (result.rows.length === 0) {
                return res.status(404).json({ error: 'Demande introuvable' });
            }

            console.log(`✓ Demande rejetée`);
            res.json({ success: true, message: 'Demande rejetée' });
        } catch (error) {
            console.error('❌ Erreur rejet:', error);
            res.status(500).json({ error: 'Erreur serveur' });
        }
    },

    // Retirer un ami
    removeFriend: async (req, res) => {
        try {
            const { friendId } = req.body;
            const userId = req.user.id;

            if (!friendId) {
                return res.status(400).json({ error: 'friendId requis' });
            }

            // Supprimer la relation (dans les deux sens)
            const result = await pool.query(
                `DELETE FROM friendships 
                 WHERE (user_id_1 = $1 AND user_id_2 = $2) OR (user_id_1 = $2 AND user_id_2 = $1)
                 AND status = 'accepted'
                 RETURNING *`,
                [userId, friendId]
            );

            if (result.rows.length === 0) {
                return res.status(404).json({ error: 'Ami introuvable' });
            }

            console.log(`✓ Ami supprimé`);
            res.json({ success: true, message: 'Ami supprimé' });
        } catch (error) {
            console.error('❌ Erreur suppression ami:', error);
            res.status(500).json({ error: 'Erreur serveur' });
        }
    },

    // Récupérer mes groupes
    getMyGroups: async (req, res) => {
        try {
            const result = await pool.query(
                `SELECT g.id, g.name, g.description, COUNT(gm.user_id) as memberCount
                 FROM groups g
                 LEFT JOIN group_members gm ON g.id = gm.group_id
                 WHERE g.id IN (
                    SELECT group_id FROM group_members WHERE user_id = $1
                 )
                 GROUP BY g.id, g.name, g.description
                 ORDER BY g.created_at DESC`,
                [req.user.id]
            );
            res.json(result.rows);
        } catch (error) {
            console.error('❌ Erreur groupes:', error);
            res.status(500).json({ error: 'Erreur serveur' });
        }
    },

    // Créer un groupe
    createGroup: async (req, res) => {
        try {
            const { name, description, memberIds } = req.body;
            const creatorId = req.user.id;

            if (!name) {
                return res.status(400).json({ error: 'Nom requis' });
            }

            // Créer le groupe
            const groupResult = await pool.query(
                'INSERT INTO groups (name, description, creator_id, created_at) VALUES ($1, $2, $3, NOW()) RETURNING id',
                [name, description || '', creatorId]
            );

            const groupId = groupResult.rows[0].id;

            // Ajouter le créateur
            await pool.query(
                'INSERT INTO group_members (group_id, user_id, joined_at) VALUES ($1, $2, NOW())',
                [groupId, creatorId]
            );

            // Ajouter les autres membres si fournis
            if (memberIds && memberIds.length > 0) {
                for (const memberId of memberIds) {
                    await pool.query(
                        'INSERT INTO group_members (group_id, user_id, joined_at) VALUES ($1, $2, NOW())',
                        [groupId, memberId]
                    );
                }
            }

            console.log(`✓ Groupe créé: ${name}`);
            res.json({ success: true, groupId, message: 'Groupe créé' });
        } catch (error) {
            console.error('❌ Erreur groupe:', error);
            res.status(500).json({ error: 'Erreur serveur' });
        }
    }
};
