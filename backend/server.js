// backend/server.js
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');

// Routes
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users'); 
const postRoutes = require('./routes/posts');
const messageRoutes = require('./routes/messages');
const app = express();
const port = 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Routes API
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/messages', messageRoutes); // ➕ AJOUT


// Servir le frontend (HTML/CSS/JS)
app.use(express.static(path.join(__dirname, '../')));

// Lancer le serveur
app.listen(port, () => {
    console.log(`Serveur backend démarré sur http://localhost:${port}`);
});
