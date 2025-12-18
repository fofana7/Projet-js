// backend/controllers/userController.js
const { pool } = require('../config/db'); 

// 1. Récupérer les informations de l'utilisateur connecté (route GET /api/users/me)
// L'ID utilisateur a été attaché à req.user par le middleware 'protect'
exports.getMe = async (req, res) => {
    const userId = req.user.id; 
    
    try {
        // Récupérer uniquement les informations non sensibles
        const result = await pool.query(
            'SELECT id, username, email, bio, avatarurl, created_at FROM users WHERE id = $1',
            [userId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ message: "Utilisateur non trouvé." });
        }

        // Renvoie l'objet utilisateur dans la clé `user` pour être cohérent avec les autres endpoints
        res.status(200).json({ user: result.rows[0] });

    } catch (error) {
        console.error('Erreur lors de la récupération du profil:', error);
        res.status(500).json({ message: "Erreur serveur lors de la récupération du profil." });
    }
};

// 1b. Récupérer les informations d'un utilisateur par ID (route GET /api/users/:id)
exports.getUserById = async (req, res) => {
    const { id } = req.params;
    
    try {
        // Récupérer uniquement les informations non sensibles
        const result = await pool.query(
            'SELECT id, username, email, bio, avatarurl, created_at, first_name, last_name, classe FROM users WHERE id = $1',
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ message: "Utilisateur non trouvé." });
        }

        // Renvoie l'objet utilisateur
        res.status(200).json(result.rows[0]);

    } catch (error) {
        console.error('Erreur lors de la récupération du profil utilisateur:', error);
        res.status(500).json({ message: "Erreur serveur lors de la récupération du profil." });
    }
};

// 1c. Récupérer les amis d'un utilisateur spécifique (route GET /api/users/:id/friends)
exports.getUserFriends = async (req, res) => {
    const { id } = req.params;
    
    try {
        // Récupérer les amis acceptés de l'utilisateur
        const result = await pool.query(
            `SELECT DISTINCT u.id, u.username, u.email, u.first_name, u.last_name, u.bio, u.avatarurl
             FROM users u
             JOIN friendships f ON (
                (f.user_id_1 = $1 AND f.user_id_2 = u.id) OR
                (f.user_id_2 = $1 AND f.user_id_1 = u.id)
             )
             WHERE f.status = 'accepted'
             ORDER BY u.first_name`,
            [id]
        );

        res.status(200).json(result.rows);

    } catch (error) {
        console.error('Erreur lors de la récupération des amis:', error);
        res.status(500).json({ message: "Erreur serveur lors de la récupération des amis." });
    }
};

// 2. Mettre à jour le profil (route PUT /api/users/me)
exports.updateProfile = async (req, res) => {
    const userId = req.user.id;
    const { username, bio, avatarurl } = req.body; 

    if (!username) {
        return res.status(400).json({ message: "Le nom d'utilisateur est requis." });
    }

    try {
        console.log('Mise à jour du profil pour userId:', userId, { username, bio, avatarurl: avatarurl ? avatarurl.substring(0, 50) + '...' : null });
        
        // Si avatarurl est un base64 long (image uploadée), le stocker; sinon garder la valeur existante
        let avatarToStore = avatarurl;
        if (avatarurl && avatarurl.startsWith('data:image')) {
            // C'est une image base64 - la stocker directement
            avatarToStore = avatarurl;
        } else if (avatarurl === '') {
            // Chaîne vide = garder l'avatar existant
            const currentUser = await pool.query('SELECT avatarurl FROM users WHERE id = $1', [userId]);
            avatarToStore = currentUser.rows[0]?.avatarurl || null;
        }
        
        const result = await pool.query(
            'UPDATE users SET username = $1, bio = $2, avatarurl = $3 WHERE id = $4 RETURNING id, username, email, bio, avatarurl, created_at',
            [username, bio || null, avatarToStore || null, userId]
        );
        
        if (result.rows.length === 0) {
            return res.status(404).json({ message: "Utilisateur non trouvé." });
        }

        console.log('✓ Profil mis à jour avec succès');
        res.status(200).json({ 
            message: "Profil mis à jour avec succès.", 
            user: result.rows[0] 
        });

    } catch (error) {
        console.error('❌ Erreur lors de la mise à jour du profil:', error.message);
        console.error('Code erreur:', error.code);
        console.error('Détails:', error);
        
        // Code 23505 est l'erreur d'unicité dans PostgreSQL
        if (error.code === '23505') {
            return res.status(400).json({ message: "Ce nom d'utilisateur est déjà pris." });
        }
        // Code 42703 = colonne n'existe pas
        if (error.code === '42703') {
            return res.status(500).json({ message: "Erreur de structure DB: colonne manquante. Veuillez contacter l'admin." });
        }
        res.status(500).json({ message: "Erreur serveur lors de la mise à jour." });
    }
};

// 3. Exporter toutes les données de l'utilisateur connecté (profil, amis, posts)
//    Route: GET /api/users/me/export
exports.exportMyData = async (req, res) => {
    const userId = req.user.id;

    try {
        const [userResult, friendsResult, postsResult] = await Promise.all([
            // Profil de base
            pool.query(
                `SELECT id, username, email, first_name, last_name, bio, avatarurl, classe, created_at
                 FROM users WHERE id = $1`,
                [userId]
            ),
            // Amis acceptés
            pool.query(
                `SELECT DISTINCT u.id, u.username, u.email, u.first_name, u.last_name, u.bio, u.avatarurl
                 FROM users u
                 JOIN friendships f ON (
                    (f.user_id_1 = $1 AND f.user_id_2 = u.id) OR
                    (f.user_id_2 = $1 AND f.user_id_1 = u.id)
                 )
                 WHERE f.status = 'accepted'
                 ORDER BY u.first_name`,
                [userId]
            ),
            // Posts de l'utilisateur
            pool.query(
                `SELECT 
                    p.id, p.content, p.image_url, p.image_data, p.created_at,
                    (SELECT COUNT(*) FROM post_likes WHERE post_id = p.id) as likes_count,
                    (SELECT COUNT(*) FROM post_comments WHERE post_id = p.id) as comments_count
                 FROM posts p
                 WHERE p.user_id = $1
                 ORDER BY p.created_at DESC
                 LIMIT 200`,
                [userId]
            )
        ]);

        if (userResult.rows.length === 0) {
            return res.status(404).json({ message: 'Utilisateur non trouvé.' });
        }

        const exportPayload = {
            generatedAt: new Date().toISOString(),
            user: userResult.rows[0],
            friends: friendsResult.rows,
            posts: postsResult.rows
        };

        return res.status(200).json(exportPayload);
    } catch (error) {
        console.error('❌ Erreur lors de l\'export des données utilisateur:', error);
        return res.status(500).json({ message: "Erreur serveur lors de l'export des données." });
    }
};

// 4. Supprimer définitivement le compte de l'utilisateur connecté
//    Route: DELETE /api/users/me
exports.deleteMe = async (req, res) => {
    const userId = req.user.id;

    try {
        // Supprimer d'abord les enregistrements dépendants non couverts par ON DELETE CASCADE
        await pool.query('DELETE FROM comment_notifications WHERE from_user_id = $1 OR to_user_id = $1', [userId]);
        await pool.query('DELETE FROM like_notifications WHERE from_user_id = $1 OR to_user_id = $1', [userId]);

        // Supprimer les amitiés
        await pool.query('DELETE FROM friendships WHERE user_id_1 = $1 OR user_id_2 = $1', [userId]);

        // Supprimer les appartenances aux groupes (les groupes créés par l'utilisateur
        // seront supprimés automatiquement grâce au ON DELETE CASCADE sur creator_id)
        await pool.query('DELETE FROM group_members WHERE user_id = $1', [userId]);

        // Supprimer les messages privés envoyés ou reçus
        await pool.query('DELETE FROM messages WHERE sender_id = $1 OR receiver_id = $1', [userId]);

        // Supprimer enfin l'utilisateur lui-même (les posts, likes, commentaires, groupes
        // reliés par ON DELETE CASCADE seront nettoyés automatiquement)
        await pool.query('DELETE FROM users WHERE id = $1', [userId]);

        // Même si aucune ligne n'était présente (compte déjà supprimé),
        // on considère l'opération comme réussie pour l'utilisateur.
        return res.status(200).json({ message: 'Compte supprimé définitivement.' });
    } catch (error) {
        console.error('❌ Erreur lors de la suppression du compte:', error);
        return res.status(500).json({ message: 'Erreur serveur lors de la suppression du compte.' });
    }
};