-- Script SQL pour vérifier et initialiser la table users
-- Exécutez ceci directement dans psql si la migration ne marche pas

-- Afficher la structure de la table users
\d+ users

-- Ajouter la colonne bio si elle n'existe pas
ALTER TABLE users ADD COLUMN IF NOT EXISTS bio VARCHAR(160);

-- Ajouter la colonne avatarurl si elle n'existe pas
ALTER TABLE users ADD COLUMN IF NOT EXISTS avatarurl TEXT;

-- Vérifier le résultat
\d+ users

-- Vérifier les utilisateurs
SELECT id, username, email, bio, avatarurl FROM users;
