# 🐛 Résolution du problème de mise à jour du profil

## Problème
"❌ Erreur serveur lors de la mise à jour"

## Causes possibles

1. **Colonne `bio` manquante dans la table `users`**
2. **Colonne `avatarurl` manquante dans la table `users`**
3. **Credentials PostgreSQL incorrects**

## Solutions

### Solution 1: Via psql (Rapide)
```bash
# Ouvrez psql
psql -U postgres -d "MiniRéseau"

# Vérifiez la structure
\d+ users

# Ajoutez les colonnes manquantes
ALTER TABLE users ADD COLUMN IF NOT EXISTS bio VARCHAR(160);
ALTER TABLE users ADD COLUMN IF NOT EXISTS avatarurl TEXT;

# Vérifiez les résultats
\d+ users
SELECT id, username, email, bio, avatarurl FROM users LIMIT 5;
```

### Solution 2: Vérifier les credentials (config/db.js)
Assurez-vous que les credentials PostgreSQL sont corrects:
```javascript
{
    user: 'postgres',           // ✓ Vérifiez ce nom d'utilisateur
    host: 'localhost',          // ✓ Vérifiez l'adresse
    database: 'MiniRéseau',     // ✓ Vérifiez le nom de la BD
    password: 'passer123',      // ✓ Vérifiez le mot de passe
    port: 5432,                 // ✓ Vérifiez le port
}
```

### Solution 3: Redémarrer le serveur
Après avoir exécuté les migrations SQL, redémarrez le serveur:
```bash
cd backend
node server.js
```

Le serveur affichera:
```
✓ Connexion à PostgreSQL réussie
✓ Migration BD effectuée avec succès (colonne bio ajoutée)
```

## Debug

Vérifiez les logs du serveur pour voir l'erreur exacte:
- Code 42703 = Colonne n'existe pas
- Code 23505 = Violation d'unicité (username déjà utilisé)
- Autre code = Voir le message d'erreur dans la console

## Test manuel de l'API

```bash
# 1. Récupérer le profil
curl -H "Authorization: Bearer YOUR_TOKEN" http://localhost:3000/api/users/me

# 2. Mettre à jour le profil
curl -X PUT \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"username":"Nouveau Nom","bio":"Ma nouvelle bio"}' \
  http://localhost:3000/api/users/me
```

## Contact
Si le problème persiste, vérifiez:
- ✓ PostgreSQL tourne sur le port 5432
- ✓ La base de données "MiniRéseau" existe
- ✓ L'utilisateur "postgres" a les bonnes permissions
- ✓ Pas de pare-feu bloquant PostgreSQL
