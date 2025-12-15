# 📁 Structure Organisée du Projet

## Hiérarchie des dossiers

```
Projet-js/
├── frontend/                    # 🎨 Tous les fichiers frontend
│   ├── index.html               # Navigation vers les pages
│   ├── pages/                   # 📄 Toutes les pages HTML
│   │   ├── message.html         # ✨ NOUVEAU - Messagerie optimisée
│   │   └── (autres pages à venir)
│   └── assets/                  # 🎯 CSS, JS, images partagés
│       └── (à organiser)
│
├── backend/                     # 🔧 API Node.js/Express
│   ├── server.js
│   ├── routes/
│   ├── controllers/
│   ├── config/
│   └── ...
│
└── README.md                    # Cette documentation
```

## Changements effectués

### ✅ Supprimés
- `message.html` (ancien, dans racine)
- `messages.html` (doublon)

### ✅ Créés
- `frontend/` - Structure organisée
- `frontend/pages/message.html` - Version optimisée et améliorée
- `frontend/index.html` - Navigation centralisée

## Améliorations de message.html

### 1️⃣ Logique d'onglets optimisée
- ✨ Configuration centralisée `TABS` object
- ⚡ Rendering dynamique sans duplication
- 🎯 Gestion d'état claire et maintenable

```javascript
const TABS = {
  private: { label: 'Messagerie privée', icon: '💬' },
  groups: { label: 'Groupes / Projets', icon: '👥' },
  forum: { label: 'Forum Q&R', icon: '❓' },
  docs: { label: 'Partage docs', icon: '📄' },
  events: { label: 'Événements', icon: '📅' },
  board: { label: 'Annonces', icon: '📢' },
  polls: { label: 'Sondages', icon: '📊' }
};
```

### 2️⃣ Boutons par rôle cohérents
- 📋 Chaque rôle a ses actions définies
- 🔄 Facile à modifier et maintenir
- ✅ Actions mappées avec handlers

```javascript
const ROLE_ACTIONS = {
  eleve: [
    { id: 'btn-post', label: '📝 Publier', action: () => {} },
    { id: 'btn-msg', label: '💬 Message privé', action: () => {} },
    { id: 'btn-class', label: '📚 Ma classe', action: () => {} }
  ],
  enseignant: [...],
  personnel: [...]
};
```

### 3️⃣ Performance & UX améliorée
- ⚙️ Pas de `innerHTML` brut dans les boucles
- 🎨 Animations fluides (slideIn 0.3s)
- 📱 Responsive design (mobile friendly)
- 🚀 Lazy loading des amis depuis API
- 💾 State management avec localStorage

### 4️⃣ Fonctionnalités

#### Onglets
- Messagerie privée
- Groupes / Projets
- Forum Q&R
- Partage docs
- Événements
- Annonces
- Sondages

#### Actions par rôle
- **Élève**: Publier, message privé, ma classe
- **Enseignant**: Publier pour classe, partager ressource, modérer
- **Personnel**: Annonces, gestion utilisateurs, modération globale, docs

#### Messages
- ✅ Envoi avec Entrée / Maj+Entrée
- 📎 Support des pièces jointes
- 👤 Affichage du statut (en ligne)
- 🕐 Timestamps formatés intelligents

#### Documents
- 📄 Modal de partage
- 🔗 Gestion des URLs
- ✨ Descriptions et métadonnées

## Prochaines étapes

1. **Déplacer les fichiers HTML** dans `frontend/pages/`
   - `index.html`, `login.html`, `ami.html`, `profil.html`, etc.

2. **Organiser les assets**
   - `frontend/assets/style.css` - Styles partagés
   - `frontend/assets/constellation.js` - Scripts partagés
   - `frontend/assets/auth.js` - Auth partagée

3. **Mettre à jour les chemins** dans backend/server.js
   ```javascript
   app.use(express.static(path.join(__dirname, '../frontend')));
   ```

4. **Intégrer les actions des boutons** avec les vrais endpoints API

## Comment utiliser

### Démarrer le serveur
```bash
cd backend
npm start
```

### Accéder à la messagerie
```
http://localhost:3000/frontend/pages/message.html
```

Ou via l'index centralisé:
```
http://localhost:3000/frontend/
```

---

**Maintenu par**: GitHub Copilot
**Dernière mise à jour**: 2025-12-11
**Version**: 2.0 (Refactorisation architecture)
