// backend/controllers/authController.js
const { pool } = require('../config/db'); // <- Import du pool corrigé
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const JWT_SECRET = 'VOTRE_SUPER_CLE_SECRETE_ETUDIANTE_123';
const ALLOWED_DOMAINS = ['@esme.fr'];

const isStudentEmail = (email) => {
    return ALLOWED_DOMAINS.some(domain => email.endsWith(domain));
};

// =====================
// REGISTER
// =====================
exports.register = async (req, res) => {
    let { username, email, password } = req.body;

    if (!username || !email || !password) {
        return res.status(400).json({ error: 'Tous les champs sont requis' });
    }

    email = email.trim().toLowerCase();

    if (!isStudentEmail(email)) {
        return res.status(403).json({ error: 'L\'inscription est réservée aux étudiants L\'esme.' });
    }

    try {
        const hashedPassword = await bcrypt.hash(password, 10);

        const result = await pool.query(
            'INSERT INTO users (username, email, password) VALUES ($1, $2, $3) RETURNING id, username, email',
            [username, email, hashedPassword]
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
            { id: user.id, username: user.username, email: user.email },
            JWT_SECRET,
            { expiresIn: '1h' }
        );

        res.json({
            message: 'Connexion réussie',
            token: token,
            user: { id: user.id, username: user.username, email: user.email }
        });

    } catch (err) {
        console.error('AUTH LOGIN ERROR:', err);
        // Retourne aussi le message d'erreur pour faciliter le debug local
        res.status(500).json({ error: 'Erreur serveur', details: err.message });
    }
};
