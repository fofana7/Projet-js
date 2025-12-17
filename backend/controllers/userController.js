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