// backend/controllers/authController.js
const { pool } = require('../config/db'); // <- Import du pool corrigé
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const JWT_SECRET = 'VOTRE_SUPER_CLE_SECRETE_ETUDIANTE_123';
const ALLOWED_DOMAINS = ['@esme.fr'];

const isStudentEmail = (email) => {
    return ALLOWED_DOMAINS.some(domain => email.endsWith(domain));
};

// Vérifie la robustesse du mot de passe :
// - au moins 12 caractères
// - au moins 1 majuscule
// - au moins 1 chiffre
// - au moins 1 caractère spécial
function isStrongPassword(pwd) {
    if (typeof pwd !== 'string') return false;
    if (pwd.length < 12) return false;
    const hasUpper = /[A-Z]/.test(pwd);
    const hasDigit = /[0-9]/.test(pwd);
    const hasSpecial = /[^A-Za-z0-9]/.test(pwd);
    return hasUpper && hasDigit && hasSpecial;
}

// =====================
// REGISTER
// =====================
exports.register = async (req, res) => {
    let { username, email, password, role, classe } = req.body;

    if (!username || !email || !password) {
        return res.status(400).json({ error: 'Tous les champs sont requis' });
    }

    email = email.trim().toLowerCase();

    // Normaliser le rôle
    role = (role || 'eleve').toLowerCase();
    const allowedRoles = ['eleve', 'enseignant', 'personnel'];
    if (!allowedRoles.includes(role)) {
        return res.status(400).json({ error: 'Rôle invalide' });
    }

    if (role === 'eleve') {
        if (!classe || !classe.trim()) {
            return res.status(400).json({ error: 'La classe est requise pour les étudiants' });
        }
        classe = classe.trim();
    } else {
        // Pas de classe obligatoire pour enseignants/personnel
        classe = classe && classe.trim() ? classe.trim() : null;
    }

    if (!isStudentEmail(email)) {
        return res.status(403).json({ error: 'L\'inscription est réservée aux étudiants L\'esme.' });
    }

    // Vérifier la robustesse du mot de passe
    if (!isStrongPassword(password)) {
        return res.status(400).json({
            error: 'Mot de passe trop faible. Il doit contenir au moins 12 caractères, ' +
                   'une majuscule, un chiffre et un caractère spécial.'
        });
    }

    try {
        const hashedPassword = await bcrypt.hash(password, 10);

        const result = await pool.query(
            'INSERT INTO users (username, email, password, role, classe) VALUES ($1, $2, $3, $4, $5) RETURNING id, username, email, role, classe',
            [username, email, hashedPassword, role, classe]
        );

        res.status(201).json({ message: 'Utilisateur créé', user: result.rows[0] });

    } catch (err) {
        if (err.code === '23505') {
            return res.status(400).json({ error: 'Nom d\'utilisateur ou email déjà utilisé' });
        }
        console.error('AUTH REGISTER ERROR:', err);
        // Retourne aussi le message d'erreur pour faciliter le debug local
        res.status(500).json({ error: 'Erreur serveur', details: err.message });
    }
};

// =====================
// LOGIN
// =====================
exports.login = async (req, res) => {
    let { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ error: 'Email et mot de passe requis' });
    }

    email = email.trim().toLowerCase();

    try {
        const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
        const user = result.rows[0];

        if (!user) return res.status(401).json({ error: 'Email ou mot de passe incorrect' });

        const match = await bcrypt.compare(password, user.password);
        if (!match) return res.status(401).json({ error: 'Email ou mot de passe incorrect' });

        const token = jwt.sign(
            { id: user.id, username: user.username, email: user.email, role: user.role, classe: user.classe },
            JWT_SECRET,
            { expiresIn: '1h' }
        );

        res.json({
            message: 'Connexion réussie',
            token: token,
            user: { id: user.id, username: user.username, email: user.email, role: user.role, classe: user.classe }
        });

    } catch (err) {
        console.error('AUTH LOGIN ERROR:', err);
        // Retourne aussi le message d'erreur pour faciliter le debug local
        res.status(500).json({ error: 'Erreur serveur', details: err.message });
    }
};

// =====================
// CHANGE PASSWORD (utilisé depuis la page paramètres)
// =====================
exports.changePassword = async (req, res) => {
    const userId = req.user && req.user.id;
    const { currentPassword, newPassword } = req.body || {};

    if (!userId) {
        return res.status(401).json({ error: 'Utilisateur non authentifié' });
    }

    if (!currentPassword || !newPassword) {
        return res.status(400).json({ error: 'Mot de passe actuel et nouveau mot de passe requis' });
    }

    if (!isStrongPassword(newPassword)) {
        return res.status(400).json({
            error: 'Le nouveau mot de passe doit contenir au moins 12 caractères, ' +
                   'une majuscule, un chiffre et un caractère spécial.'
        });
    }

    try {
        const result = await pool.query('SELECT id, password FROM users WHERE id = $1', [userId]);
        const user = result.rows[0];

        if (!user) {
            return res.status(404).json({ error: 'Utilisateur non trouvé' });
        }

        const match = await bcrypt.compare(currentPassword, user.password);
        if (!match) {
            return res.status(401).json({ error: 'Mot de passe actuel incorrect' });
        }

        const hashedNew = await bcrypt.hash(newPassword, 10);
        await pool.query('UPDATE users SET password = $1 WHERE id = $2', [hashedNew, userId]);

        res.json({ message: 'Mot de passe mis à jour avec succès' });
    } catch (err) {
        console.error('AUTH CHANGE PASSWORD ERROR:', err);
        res.status(500).json({ error: 'Erreur serveur', details: err.message });
    }
};
