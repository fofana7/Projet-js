# ⚡ QUICK REFERENCE - Commandes Essentielles

## 🚀 DÉMARRER LE PROJET

### Windows PowerShell
```powershell
# Setup automatique (recommandé)
.\setup.ps1

# Ou manuel
cd backend
npm install
npm start
# Visitez: http://localhost:3000
```

### Linux/Mac
```bash
# Setup automatique (recommandé)
bash setup.sh

# Ou manuel
cd backend
npm install
npm start
# Visitez: http://localhost:3000
```

---

## 🧪 VALIDER LE PROJET

```bash
# Avant CHAQUE commit (très important!)
node validate-project.js

# Résultat attendu:
# 🎉 SUCCÈS! Votre projet est propre et bien organisé.
```

---

## 📚 LIRE LA DOCUMENTATION

```bash
# Résumé rapide (2 min)
cat RESUME.md

# Organisation du projet (10 min)
cat STRUCTURE.md

# Règles de développement (15 min)
cat CHECKLIST.md

# Tableau de bord (5 min)
cat DASHBOARD.md

# Guide complet des docs (10 min)
cat INDEX.md

# Rapport complet d'audit (20 min)
cat RAPPORT_COMPLET.md
```

---

## 🔍 VÉRIFICATIONS UTILES

### Vérifier les doublons
```bash
# Windows PowerShell
Get-ChildItem -Recurse -Filter "*.html" | Group-Object Name | Where-Object Count -gt 1

# Linux/Mac
find . -type f -name "*.html" | sort | uniq -d
```

### Compter les fichiers HTML
```bash
# Windows PowerShell
(Get-ChildItem -Recurse -Filter "*.html").Count

# Linux/Mac
find . -type f -name "*.html" | wc -l
```

### Vérifier la structure
```bash
# Windows PowerShell
Get-ChildItem -Path ".", "backend", "frontend" -Recurse | Select-Object FullName

# Linux/Mac
tree -L 3
```

---

## 🛠️ MODIFICATIONS COURANTES

### Ajouter une nouvelle page simple
```
1. Créer: nompage.html (à la racine)
2. Lier depuis index.html: onclick="location.href='nompage.html'"
3. Vérifier: node validate-project.js ✅
```

### Ajouter une page complexe
```
1. Créer: frontend/pages/nompage.html
2. Lier depuis index.html: onclick="location.href='frontend/pages/nompage.html'"
3. Vérifier: node validate-project.js ✅
```

### Ajouter une route API
```
1. Créer contrôleur: backend/controllers/nomController.js
2. Créer route: backend/routes/nom.js
3. Monter dans: backend/server.js avec middleware protect()
4. Ajouter RBAC: requireRole(['role1', 'role2'])
```

### Ajouter une fonction JavaScript
```
// ✅ BON: Réutilisable et centralisée
function switchTab(tabName) { ... }

// ❌ MAUVAIS: Dupliqué
function switchTab1() { ... }
function switchTab2() { ... }
function switchTab3() { ... }
```

---

## 🔐 GESTION DES RÔLES

### Rôles disponibles
```
- 'élève'       → Étudiant
- 'enseignant'  → Professeur
- 'personnel'   → Staff académique
```

### Ajouter protection par rôle
```javascript
// Dans backend/routes/monroute.js
router.get('/endpoint', protect, requireRole(['enseignant']), controller);

// Dans frontend
await fetch('/api/endpoint', {
  headers: { Authorization: `Bearer ${token}` }
});
```

---

## 💾 GESTION DE DONNÉES

### localStorage (client)
```javascript
// Sauvegarder
localStorage.setItem('minireseau', JSON.stringify(userData));

// Récupérer
const userData = JSON.parse(localStorage.getItem('minireseau'));

// Effacer
localStorage.clear();
```

### Charger le rôle utilisateur
```javascript
async function loadUserRole() {
  const response = await fetch('http://localhost:3000/api/users/me', {
    headers: { Authorization: `Bearer ${token}` }
  });
  const user = await response.json();
  return user.role; // 'élève', 'enseignant', ou 'personnel'
}
```

---

## 🐛 DEBUGGING

### Voir les logs du serveur
```bash
# Terminal avec le serveur
# Vérifier la sortie de: npm start
# ou: node server.js
```

### Voir les requêtes API
```javascript
// Dans la console navigateur
// F12 → Onglet Network → Voir les requêtes
// F12 → Onglet Console → Voir les logs
```

### Vérifier la base de données
```bash
# Depuis backend/
# Voir check-schema.sql ou schema.sql
psql -U user -d minireseau -f check-schema.sql
```

---

## 📊 FICHIERS IMPORTANTS

### À connaître
- `index.html` - Hub principal
- `style.css` - Styles partagés
- `backend/server.js` - Serveur principal
- `backend/middleware/auth.js` - Authentification + RBAC
- `backend/controllers/*` - Logique métier
- `localStorage` - Données client

### À consulter
- `STRUCTURE.md` - Où placer le code
- `CHECKLIST.md` - Règles de développement
- `DASHBOARD.md` - État du projet
- `validate-project.js` - Validation

---

## ✅ AVANT DE COMMITTER

```bash
# 1. Valider la structure
node validate-project.js

# 2. Vérifier les doublons
Get-ChildItem -Recurse -Filter "*.html" | Group-Object Name | Where-Object Count -gt 1

# 3. Tester l'app
# Navigateur: http://localhost:3000
# - Essayer login
# - Naviguer entre pages
# - Tester selon votre rôle

# 4. Vérifier les logs
# F12 → Console: pas d'erreurs?
# Backend terminal: pas de "error"?

# 5. Si OK
git add .
git commit -m "Description du changement"
git push
```

---

## 🚨 ERREURS COURANTES

| Erreur | Solution |
|--------|----------|
| "Cannot find module" | `cd backend && npm install` |
| "Port 3000 déjà utilisé" | `Changer port dans server.js` |
| "404 page non trouvée" | Vérifier chemin dans location.href |
| "Token non valide" | Reconnecter via login.html |
| "Rôle non autorisé" | Vérifier requireRole() dans backend |

---

## 📞 AIDE RAPIDE

```
Q: Où ajouter une nouvelle page?
A: STRUCTURE.md section "Pages Principales"

Q: Comment ajouter une route API?
A: CHECKLIST.md section "Ajouter une route API"

Q: Commandes de démarrage?
A: Ce fichier (QUICK_REFERENCE.md) section "DÉMARRER"

Q: Est-ce que mon code est bon?
A: node validate-project.js

Q: Quels rôles existent?
A: Ce fichier section "GESTION DES RÔLES"

Q: J'ai cassé quelque chose?
A: CHECKLIST.md section "Signaux d'alerte"
```

---

## 🎯 RÉSUMÉ ULTRA-RAPIDE

```bash
# Setup (une fois)
.\setup.ps1

# Développement
npm start              # Terminal 1: démarrer serveur
node validate-project.js  # Avant chaque commit

# Si erreur
cat CHECKLIST.md      # Chercher dans "Signaux d'alerte"
```

---

**Créé pour**: Accès rapide aux commandes essentielles  
**À utiliser**: En tant que reference rapide  
**Dernière mise à jour**: 12 novembre 2025

🚀 Bon coding!
