-- Script pour créer des utilisateurs de test pour tester le système d'amis
-- À exécuter une seule fois

-- S'assurer que les colonnes de profil existent
ALTER TABLE users ADD COLUMN IF NOT EXISTS first_name VARCHAR(100);
ALTER TABLE users ADD COLUMN IF NOT EXISTS last_name VARCHAR(100);

-- NB: la colonne de mot de passe dans l'appli s'appelle "password" (pas password_hash)
-- On met des hash factices, ces comptes servent surtout comme profils visibles dans la liste d'amis.
INSERT INTO users (username, email, password, first_name, last_name, bio, created_at) VALUES
('alice', 'alice@esme.fr', '$2a$10$mockHashAlice123456789', 'Alice', 'Martin', 'Étudiante en développement web', NOW()),
('bob', 'bob@esme.fr', '$2a$10$mockHashBob1234567890', 'Bob', 'Dupont', 'Expert en JavaScript', NOW()),
('charlie', 'charlie@esme.fr', '$2a$10$mockHashCharlie12345', 'Charlie', 'Leclerc', 'Designer passionné', NOW()),
('diana', 'diana@esme.fr', '$2a$10$mockHashDiana1234567', 'Diana', 'Schmidt', 'Développeuse fullstack', NOW()),
('eve', 'eve@esme.fr', '$2a$10$mockHashEve12345678', 'Eve', 'Johnson', 'DevOps specialist', NOW())
ON CONFLICT (email) DO NOTHING;

-- Créer des relations d'amitié de test
-- Alice et Bob sont amis
INSERT INTO friendships (user_id_1, user_id_2, status) 
SELECT u1.id, u2.id, 'accepted'
FROM users u1, users u2
WHERE u1.username = 'alice' AND u2.username = 'bob'
ON CONFLICT DO NOTHING;

-- Alice a une demande de Charlie (pending)
INSERT INTO friendships (user_id_1, user_id_2, status)
SELECT u1.id, u2.id, 'pending'
FROM users u1, users u2
WHERE u1.username = 'charlie' AND u2.username = 'alice'
ON CONFLICT DO NOTHING;

-- Bob et Diana sont amis
INSERT INTO friendships (user_id_1, user_id_2, status)
SELECT u1.id, u2.id, 'accepted'
FROM users u1, users u2
WHERE u1.username = 'bob' AND u2.username = 'diana'
ON CONFLICT DO NOTHING;

-- Créer des groupes de test
INSERT INTO groups (name, description, creator_id, created_at)
SELECT 'Projet Web 2025', 'Développement d''une plateforme collaborative', id, NOW()
FROM users WHERE username = 'alice'
ON CONFLICT DO NOTHING;

INSERT INTO groups (name, description, creator_id, created_at)
SELECT 'Hackathon JavaScript', 'Compétition de code', id, NOW()
FROM users WHERE username = 'bob'
ON CONFLICT DO NOTHING;

-- Ajouter des membres aux groupes
INSERT INTO group_members (group_id, user_id, joined_at)
SELECT g.id, u.id, NOW()
FROM groups g, users u
WHERE g.name = 'Projet Web 2025' AND u.username IN ('alice', 'bob', 'charlie')
ON CONFLICT DO NOTHING;

INSERT INTO group_members (group_id, user_id, joined_at)
SELECT g.id, u.id, NOW()
FROM groups g, users u
WHERE g.name = 'Hackathon JavaScript' AND u.username IN ('bob', 'diana', 'eve')
ON CONFLICT DO NOTHING;

-- Lier automatiquement un compte de test ESME perso (ex: alifof@esme.fr) aux comptes ci-dessus
-- Cette partie suppose que l'utilisateur avec cet email a été créé via l'inscription.

INSERT INTO friendships (user_id_1, user_id_2, status)
SELECT me.id, u.id, 'accepted'
FROM users me, users u
WHERE me.email = 'alifof@esme.fr'
	AND u.email IN ('alice@esme.fr', 'bob@esme.fr', 'charlie@esme.fr', 'diana@esme.fr', 'eve@esme.fr')
ON CONFLICT DO NOTHING;

SELECT 'Test data created successfully!' as message;
