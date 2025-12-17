// backend/config/db.js
const { Pool } = require('pg');

const pool = new Pool({
    user: 'postgres',        // ton utilisateur PostgreSQL
    host: 'localhost',       // host PostgreSQL
    database: 'MiniRéseau',  // nom de ta base
    password: 'talida',      // mot de passe
    port: 5432,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
});

// Gestion des erreurs de connexion
pool.on('error', (err, client) => {
    console.error('❌ Erreur du pool de connexion:', err.message);
    console.error('   Détails:', err);
    // Ne pas arrêter le serveur - laisser les requêtes suivantes réessayer
    // process.exit(-1); // COMMENTÉ pour éviter que le serveur s'éteigne
});

module.exports = { pool };
