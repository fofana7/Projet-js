// backend/config/db.js
const { Pool } = require('pg');

const pool = new Pool({
    user: 'postgres',        // ton utilisateur PostgreSQL
    host: 'localhost',       // host PostgreSQL
    database: 'MiniRéseau',  // nom de ta base
    password: 'passer123',   // mot de passe
    port: 5432,
});

module.exports = { pool };
