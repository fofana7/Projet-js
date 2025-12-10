// backend/server.js
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const { pool } = require('./config/db');

// Routes
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users'); 
const postRoutes = require('./routes/posts');
const messageRoutes = require('./routes/message');
const friendsRoutes = require('./routes/ami');
const contentRoutes = require('./routes/content');


const app = express();
const port = 3000;

// Error handling pour les uncaught exceptions
process.on('uncaughtException', (err) => {
    console.error('❌ Uncaught Exception:', err);
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
});

// Middleware
app.use(cors());
app.use(bodyParser.json());

// ===== INITIALISATION DE LA BASE DE DONNÉES =====
async function initializeDatabase() {
    try {
        // Ajouter la colonne bio si elle n'existe pas
        await pool.query(`
            ALTER TABLE users ADD COLUMN IF NOT EXISTS bio VARCHAR(160);
        `);
        console.log('✓ Migration BD effectuée (colonne bio)');
        
        // Ajouter la colonne avatarurl si elle n'existe pas
        await pool.query(`
            ALTER TABLE users ADD COLUMN IF NOT EXISTS avatarurl VARCHAR(255);
        `);
        console.log('✓ Migration BD effectuée (colonne avatarurl)');

        // Créer la table des messages si elle n'existe pas
        await pool.query(`
            CREATE TABLE IF NOT EXISTS messages (
                id SERIAL PRIMARY KEY,
                sender_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                recipient_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                text TEXT NOT NULL,
                file_url VARCHAR(255),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                is_read BOOLEAN DEFAULT false
            );
            CREATE INDEX IF NOT EXISTS idx_messages_conversation 
            ON messages(sender_id, recipient_id, created_at DESC);
        `);
        console.log('✓ Table messages créée/vérifiée');

        // Créer la table pour les conversations archivées
        await pool.query(`
            CREATE TABLE IF NOT EXISTS archived_conversations (
                user_id INT NOT NULL,
                archived_with_user_id INT NOT NULL,
                archived_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                PRIMARY KEY (user_id, archived_with_user_id),
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
                FOREIGN KEY (archived_with_user_id) REFERENCES users(id) ON DELETE CASCADE
            );
        `);
        console.log('✓ Table archived_conversations créée/vérifiée');

        // Créer la table friendships (amitié)
        await pool.query(`
            CREATE TABLE IF NOT EXISTS friendships (
                id SERIAL PRIMARY KEY,
                user_id_1 INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                user_id_2 INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                status VARCHAR(20) DEFAULT 'pending',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                UNIQUE(user_id_1, user_id_2)
            );
            CREATE INDEX IF NOT EXISTS idx_friendships_users 
            ON friendships(user_id_1, user_id_2);
        `);
        console.log('✓ Table friendships créée/vérifiée');

        // Créer la table groups
        await pool.query(`
            CREATE TABLE IF NOT EXISTS groups (
                id SERIAL PRIMARY KEY,
                name VARCHAR(100) NOT NULL,
                description TEXT,
                creator_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);
        console.log('✓ Table groups créée/vérifiée');

        // Créer la table group_members
        await pool.query(`
            CREATE TABLE IF NOT EXISTS group_members (
                id SERIAL PRIMARY KEY,
                group_id INT NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
                user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                UNIQUE(group_id, user_id)
            );
        `);
        console.log('✓ Table group_members créée/vérifiée');

    } catch (error) {
        console.error('⚠️ Erreur lors de la migration:', error.message);
        console.error('Code erreur:', error.code);
        // Ne pas bloquer le serveur si la migration échoue
    }
}

// Tester la connexion à la BD
async function testDatabaseConnection() {
    try {
        const result = await pool.query('SELECT NOW()');
        console.log('✓ Connexion à PostgreSQL réussie');
    } catch (error) {
        console.error('❌ Impossible de se connecter à PostgreSQL:', error.message);
        console.error('Vérifiez votre configuration dans config/db.js');
    }
}

// Routes API (AVANT de lancer le serveur)
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/ami', friendsRoutes);
app.use('/api/content', contentRoutes);

// Servir le frontend (HTML/CSS/JS)
app.use(express.static(path.join(__dirname, '../')));

// Error handler middleware
app.use((err, req, res, next) => {
    console.error('❌ Error:', err.message);
    res.status(500).json({ error: 'Erreur serveur', message: err.message });
});

// Exécuter les migrations et tests au démarrage
async function startServer() {
    await testDatabaseConnection();
    await initializeDatabase();
    
    // Lancer le serveur APRÈS les migrations
    app.listen(port, () => {
        console.log(`Serveur backend démarré sur http://localhost:${port}`);
    });
}

startServer().catch(err => {
    console.error('Erreur démarrage:', err);
    process.exit(1);
});
