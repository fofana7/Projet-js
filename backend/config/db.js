// backend/config/db.js
const { Pool } = require('pg');

const pool = new Pool({
  user: 'postgres',       // ton utilisateur PostgreSQL
  host: 'localhost',
  database: 'MiniRéseau', // nom de ta DB
  password: 'talida',  // ton mot de passe PostgreSQL
  port: 5432,
});

module.exports = { pool };
