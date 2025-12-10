-- Script pour initialiser la base de données
-- Exécute les migrations nécessaires

-- 1. Ajouter la colonne bio si elle n'existe pas
ALTER TABLE users ADD COLUMN IF NOT EXISTS bio VARCHAR(160);

-- 2. Vérifier la structure actuelle (pour debug)
-- SELECT * FROM information_schema.columns WHERE table_name = 'users';
