// backend/middleware/auth.js
const jwt = require('jsonwebtoken');

// Clé secrète (IDENTIQUE au contrôleur authController)
const JWT_SECRET = 'VOTRE_SUPER_CLE_SECRETE_ETUDIANTE_123'; 

exports.protect = (req, res, next) => {
    let token;
    
    // Vérification du format "Bearer <token>"
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
        return res.status(401).json({ message: 'Accès non autorisé. Token manquant.' });
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded; // Ajoute l'utilisateur décodé à la requête
        next();
    } catch (err) {
        return res.status(401).json({ message: 'Token invalide ou expiré.' });
    }
};