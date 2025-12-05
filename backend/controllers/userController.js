// backend/controllers/userController.js
const { pool } = require('../server'); 

// 1. Récupérer les informations de l'utilisateur connecté (route GET /api/users/me)
// L'ID utilisateur a été attaché à req.user par le middleware 'protect'
exports.getMe = async (req, res) => {
    const userId = req.user.id; 
    
    try {
        // Récupérer uniquement les informations non sensibles
        const result = await pool.query(
            'SELECT id, username, email, created_at, avatarurl FROM users WHERE id = $1',
            [userId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ message: "Utilisateur non trouvé." });
        }

        // Renvoie l'objet utilisateur
        res.status(200).json(result.rows[0]);

    } catch (error) {
        console.error('Erreur lors de la récupération du profil:', error);
        res.status(500).json({ message: "Erreur serveur lors de la récupération du profil." });
    }
};

// 2. Mettre à jour le profil (route PUT /api/users/me)
exports.updateProfile = async (req, res) => {
    const userId = req.user.id;
    const { username, avatarurl } = req.body; 

    if (!username) {
        return res.status(400).json({ message: "Le nom d'utilisateur est requis." });
    }

    try {
        const result = await pool.query(
            'UPDATE users SET username = $1, avatarurl = $2 WHERE id = $3 RETURNING id, username, avatarurl, email',
            [username, avatarurl || null, userId]
        );
        
        if (result.rows.length === 0) {
            return res.status(404).json({ message: "Utilisateur non trouvé." });
        }

        res.status(200).json({ 
            message: "Profil mis à jour avec succès.", 
            user: result.rows[0] 
        });

    } catch (error) {
        console.error('Erreur lors de la mise à jour du profil:', error);
        // Code 23505 est l'erreur d'unicité dans PostgreSQL
        if (error.code === '23505') {
            return res.status(400).json({ message: "Ce nom d'utilisateur est déjà pris." });
        }
        res.status(500).json({ message: "Erreur serveur lors de la mise à jour." });
    }
};