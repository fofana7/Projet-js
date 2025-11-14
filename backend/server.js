const express = require("express");
const cors = require("cors");

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());           // Permet au frontend d'accéder à l'API
app.use(express.json());   // Permet de lire le JSON dans les requêtes POST

// Test de route
app.get("/", (req, res) => {
  res.send("Backend MiniRéseau fonctionne !");
});

// Lancement du serveur
app.listen(PORT, () => {
  console.log(`Serveur backend lancé sur http://localhost:${PORT}`);
});
