// ======= IMPORTS =======
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const bcrypt = require('bcryptjs');
const { Pool } = require('pg');

// ======= INIT APP =======
const app = express();
const port = 3000;

// ======= MIDDLEWARE =======
app.use(cors());
app.use(bodyParser.json());

// ======= CONFIG POSTGRESQL =======
const pool = new Pool({
  user: 'postgres',       // ton utilisateur PostgreSQL
  host: 'localhost',
  database: 'MiniRéseau', // nom de ta DB
  password: 'passer123',  // ton mot de passe PostgreSQL
  port: 5432,
});

// ======= ROUTE INSCRIPTION =======
app.post('/api/register', async (req, res) => {
  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    return res.status(400).json({ error: 'Tous les champs sont requis' });
  }

  try {
    // Hasher le mot de passe
    const hashedPassword = await bcrypt.hash(password, 10);

    // Ajouter l'utilisateur dans la base
    const result = await pool.query(
  'INSERT INTO users (username, email, password) VALUES ($1, $2, $3) RETURNING id, username, email, created_at',
  [username, email, hashedPassword]
);


    res.json({ message: 'Utilisateur créé', user: result.rows[0] });
  } catch (err) {
    console.error(err);
    if (err.code === '23505') { // violation d'unicité
      return res.status(400).json({ error: 'Username, pseudo ou email déjà utilisé' });
    }
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// ======= ROUTE CONNEXION =======
app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email et mot de passe requis' });
  }

  try {
    const result = await pool.query(
      'SELECT * FROM users WHERE email = $1',
      [email]
    );

    const user = result.rows[0];
    if (!user) return res.status(400).json({ error: 'Utilisateur non trouvé' });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(400).json({ error: 'Mot de passe incorrect' });

    res.json({ message: 'Connexion réussie', user: { id: user.id, username: user.username, email: user.email } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// ======= LANCER LE SERVEUR =======
app.listen(port, () => {
  console.log(`Serveur backend démarré sur http://localhost:${port}`);
});
