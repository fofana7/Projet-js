# 🗂️ STRUCTURE PROPRE & LOGIQUE DU PROJET

## Architecture finale (12/11/2025 - Nettoyage complet)

```
Projet-js/
│
├── 🎨 FRONTEND (Dossier root + nouveau frontend/)
│   ├── index.html                 ✅ Page principale (feed, profil, auth)
│   ├── login.html                 ✅ Authentification
│   ├── profil.html                ✅ Profil utilisateur (UNIQUE)
│   ├── ami.html                   ✅ Gestion des amis
│   ├── constellation.html         ✅ Carte visuelle des amis
│   ├── page_parametre.html        ✅ Paramètres utilisateur
│   ├── page_presentation.html     ✅ Page d'infos
│   ├── style.css                  ✅ Styles partagés
│   │
│   └── frontend/                  ✨ NOUVELLE ORGANISATION
│       ├── index.html             ✅ Navigation (hub central)
│       ├── pages/
│       │   └── message.html       ✅ Messagerie (UNIQUE, v2.0 optimisée)
│       └── assets/
│           └── (À organiser)
│
├── 🔧 BACKEND (Node.js/Express)
│   ├── server.js                  ✅ Serveur principal
│   ├── routes/
│   │   ├── auth.js
│   │   ├── users.js
│   │   ├── posts.js
│   │   ├── ami.js
│   │   ├── message.js
│   │   ├── content.js
│   │   └── constellation.js
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── userController.js
│   │   ├── postController.js
│   │   ├── messageController.js
│   │   ├── amiController.js
│   │   └── contentController.js
│   ├── middleware/
│   │   └── auth.js
│   ├── config/
│   │   └── db.js
│   └── package.json
│
└── 📚 DOCUMENTATION
    ├── README.md                  ✅ Guide principal
    ├── ARCHITECTURE.md            ✅ Structure détaillée
    ├── IMPROVEMENTS.md            ✅ Avant/Après
    ├── PROFILE_PHOTO_FIX.md
    ├── PROFILE_UPDATE_FIX.md
    └── STRUCTURE.md               ⬅️ CE FICHIER
```

---

## 🗑️ FICHIERS SUPPRIMÉS (Doublons)

❌ **Supprimés pour clarté:**
- `messages.html` (ancien, doublon de `/frontend/pages/message.html`)
- `profil_utilisateur.html` (ancien, doublon de `profil.html`)
- `chat.html` (obsolète, remplacé par messageriage moderne)
- Ancien `message.html` à la racine (remplacé par `/frontend/pages/message.html`)

---

## 🧭 NAVIGATION COHÉRENTE

### Pattern 1: Onglets internes (showTab)
Utilisé pour les sections **DANS index.html**:
```javascript
showTab('feed')      // Fil d'actualité interne
showTab('profile')   // Profil utilisateur interne
```

### Pattern 2: Redirection vers pages externes (location.href)
Utilisé pour les **pages dédiées externes**:
```javascript
location.href='profil.html'              // Profil complet (ancienne approche)
location.href='ami.html'                 // Gestion amis
location.href='constellation.html'       // Carte constellation
location.href='frontend/pages/message.html'  // Messagerie optimisée
location.href='page_parametre.html'      // Paramètres
```

### Index.html - Navigation unifiée
```html
<nav class="menu">
  <button onclick="showTab('feed')">🏠 Fil d'actualité</button>
  <button onclick="location.href='frontend/pages/message.html'">💬 Messagerie</button>
  <button onclick="location.href='ami.html'">👥 Amis</button>
  <button onclick="location.href='profil.html'">👤 Profil</button>
  <button onclick="location.href='constellation.html'">🌌 Constellation</button>
  <button onclick="location.href='page_parametre.html'">⚙️ Paramètres</button>
</nav>
```

✅ **Pas de doublons d'ID**
✅ **Pas de logique mélangée**
✅ **Pattern unique et clair**

---

## 📄 PAGES PRINCIPALES

### index.html (page d'accueil)
- ✅ Authentication (login/register)
- ✅ Feed (fil d'actualité avec posts)
- ✅ Onglet profil interne (affichage simple)
- ✅ Navigation vers autres pages

### profil.html (profil complet)
- ✅ Affichage profil utilisateur détaillé
- ✅ Édition profil
- ✅ Liste d'amis
- ✅ Statistiques
- **Utilisé pour page dédiée au profil**

### ami.html (gestion amis)
- ✅ Découvrir amis
- ✅ Demandes d'amitié
- ✅ Liste amis
- **Page dédiée, séparée de l'UI principale**

### frontend/pages/message.html (messagerie)
- ✅ Onglets (messagerie privée, groupes, forum, docs, etc.)
- ✅ Actions par rôle (élève/enseignant/personnel)
- ✅ Chargement amis depuis API
- ✅ Logique centralisée et optimisée
- **v2.0 - Complètement refactorisée**

### constellation.html (carte visuelle)
- ✅ Tous les utilisateurs comme "étoiles"
- ✅ Connexions d'amitié visualisées
- ✅ Animations et interactions
- **Page visuelle dédiée**

### page_parametre.html (paramètres)
- ✅ Infos personnelles
- ✅ Sécurité/mot de passe
- ✅ Confidentialité
- **Page dédiée aux réglages**

---

## 🔗 CHEMINS COHÉRENTS

### Depuis index.html (racine)
```javascript
// Pages locales (racine)
'profil.html'
'ami.html'
'constellation.html'
'page_parametre.html'
'login.html'

// Pages dans frontend/
'frontend/pages/message.html'
'frontend/'  // Navigation hub
```

### Backend (API)
```javascript
const API_BASE_URL = 'http://localhost:3000/api';

/api/auth/login
/api/auth/register
/api/users/me
/api/posts
/api/messages
/api/ami
/api/content
/api/constellation
```

---

## 🚀 DÉMARRAGE

```bash
# Terminal 1: Backend
cd backend
npm start
# ✓ Serveur sur http://localhost:3000

# Terminal 2: Navigateur
http://localhost:3000/                    # Page accueil
http://localhost:3000/login.html          # Connexion
http://localhost:3000/profil.html         # Profil
http://localhost:3000/ami.html            # Amis
http://localhost:3000/constellation.html  # Constellation
http://localhost:3000/frontend/pages/message.html  # Messagerie v2.0
```

---

## ✅ CHECKLIST DE NETTOYAGE

- ✅ Suppression doublons HTML (messages.html, profil_utilisateur.html, chat.html)
- ✅ Navigation unifiée dans index.html
- ✅ Pas d'ID d'éléments dupliqués
- ✅ Chemins cohérents (relative vs absolute)
- ✅ Logique de navigation unifiée
- ✅ Nouvelles pages dans /frontend/pages/
- ✅ Documentation complète
- ✅ Backend API synchronisé

---

## 🔄 SCHÉMA DE FLUX (Navigation)

```
LOGIN/REGISTER
     ↓
index.html (Feed + Profil interne)
     ├→ "💬 Messagerie" → frontend/pages/message.html
     ├→ "👥 Amis" → ami.html
     ├→ "👤 Profil" → profil.html
     ├→ "🌌 Constellation" → constellation.html
     └→ "⚙️ Paramètres" → page_parametre.html
```

---

## 📝 NOTES IMPORTANTES

1. **État utilisateur** stocké dans `localStorage`:
   - `token` : JWT token
   - `user` : JSON user object

2. **API** toujours sur `http://localhost:3000/api`

3. **Styles** partagés dans `style.css` (racine)

4. **Frontend** modern dans `frontend/pages/message.html` (v2.0)

5. **Pas de localStorage** mixé entre pages (une seule clé: `minireseau`)

---

**Statut**: ✅ **PROPRE ET ORGANISÉ**
**Date**: 12/11/2025
**Dernière action**: Suppression doublons + Unification navigation
