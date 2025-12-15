# ✅ CHECKLIST PERMANENTE - Maintien de la Propreté du Projet

Cette checklist garantit que le projet reste **propre, cohérent et bien organisé**.

---

## 📋 AVANT CHAQUE COMMIT

### 1. Doublons ❌
- [ ] Pas de fichiers `.html` en doublon
- [ ] Pas de fichiers `.js` en doublon
- [ ] Pas de fichiers `.css` en doublon
- [ ] Vérifier: `node validate-project.js` (succès ✅)

### 2. Navigation 🧭
- [ ] Tous les liens internes pointent vers les bons fichiers
- [ ] Pas de chemins cassés (404)
- [ ] Pattern cohérent: `showTab()` pour onglets internes, `location.href` pour pages externes
- [ ] IDs d'éléments HTML uniques (pas de dupliqués)

### 3. Backend 🔧
- [ ] Toutes les routes en `/api/*`
- [ ] Middleware `protect()` sur routes protégées
- [ ] Middleware `requireRole()` sur routes restreintes
- [ ] Pas de logique dupliquée entre contrôleurs
- [ ] Base de données synchronisée

### 4. Documentation 📚
- [ ] README.md à jour
- [ ] ARCHITECTURE.md reflète la structure actuelle
- [ ] STRUCTURE.md maintenu si modifications
- [ ] Commentaires dans le code critiques
- [ ] AUDIT_FINAL.md mis à jour après grandes changes

---

## 🎯 REGLES DE DÉVELOPPEMENT

### Ajouter une Nouvelle Page? 

**Pages simples** (affichage + interaction basique):
```
✅ Placer dans la racine du projet
   └── nouveaute.html

✅ Lier depuis index.html avec:
   <button onclick="location.href='nouveaute.html'">Lien</button>

✅ Utiliser le même style.css
```

**Pages complexes** (logique avancée, plusieurs onglets):
```
✅ Placer dans frontend/pages/
   └── frontend/pages/nouveaute.html

✅ Lier depuis index.html avec:
   <button onclick="location.href='frontend/pages/nouveaute.html'">Lien</button>

✅ Importer CSS depuis ../../../style.css
```

### Ajouter une Route API?

```javascript
// ✅ BON: Route protégée par rôle
router.get('/special', protect, requireRole(['enseignant']), controllerFunction);

// ❌ MAUVAIS: Route sans protection
router.get('/special', controllerFunction);

// ❌ MAUVAIS: Logique mélangée
router.get('/special', (req, res) => {
  // Logique métier directement ici
  res.json(...);
});
```

### Ajouter une Fonction Frontend?

```javascript
// ✅ BON: Logique centralisée dans configuration
const TABS = {
  feed: { title: 'Fil', id: 'feed-section' },
  messages: { title: 'Messages', id: 'messages-section' }
};

// ✅ BON: Fonction utilitaire réutilisable
function switchTab(tabName) {
  document.querySelectorAll('[data-tab]').forEach(el => el.hidden = true);
  document.getElementById(TABS[tabName].id).hidden = false;
}

// ❌ MAUVAIS: Code dupliqué partout
showTab1() { ... }
showTab2() { ... }
showTab3() { ... }
```

---

## 🧪 AVANT CHAQUE DÉPLOIEMENT

### 1. Tests Backend
```bash
cd backend
npm test  # Si disponible, sinon voir test-api.js
```

### 2. Validation Structure
```bash
node validate-project.js
# Doit afficher: "SUCCÈS! Votre projet est propre"
```

### 3. Vérification des Liens
- [ ] Tous les liens pointent vers fichiers existants
- [ ] Pas de paths cassés
- [ ] Frontend et backend synchronisés

### 4. Logs de Sécurité
- [ ] Pas de tokens en dur dans le code
- [ ] Pas de mots de passe en dur
- [ ] localStorage utilisé correctement
- [ ] Middleware RBAC actif sur toutes routes protégées

### 5. Performance
- [ ] message.html charge rapidement (< 2s)
- [ ] Pas de requêtes API redondantes
- [ ] CSS minifiés en production (optionnel)

---

## 📊 FICHIERS IMPORTANTS À CONNAÎTRE

| Fichier | Rôle | Fréquence Modif |
|---------|------|-----------------|
| `backend/server.js` | Cœur du backend | Rare |
| `backend/middleware/auth.js` | Authentification RBAC | Rare |
| `backend/controllers/*` | Logique métier | Régulière |
| `index.html` | Hub principal | Occasionnel |
| `style.css` | Styles partagés | Régulière |
| `frontend/pages/message.html` | Messagerie | Rarement |
| `.github/copilot-instructions.md` | Instructions IA | Au besoin |
| `STRUCTURE.md` | Documentation | Après changes |

---

## 🚨 SIGNAUX D'ALERTE

Si vous voyez ceci, quelque chose a mal tourné:

```
❌ Deux fichiers message.html
   → Garder SEULEMENT frontend/pages/message.html

❌ Fonction showTab1(), showTab2(), showTab3()...
   → Centraliser dans une fonction unique

❌ Routes sans protect() ou requireRole()
   → Ajouter middleware d'auth

❌ Même logique répétée 3+ fois
   → Créer fonction réutilisable

❌ localStorage['key1'], localStorage['key2']...
   → Utiliser UNE seule clé JSON

❌ Liens cassés (404) à la navigation
   → Vérifier chemins relatifs et absolus

❌ Plus de 9 fichiers HTML
   → Vérifier présence de doublons
```

---

## 🔧 COMMANDES UTILES

```bash
# Valider le projet
node validate-project.js

# Démarrer le backend
cd backend && npm start

# Vérifier les doublons
Get-ChildItem -Recurse -Filter "*.html" | Group-Object Name | Where-Object Count -gt 1

# Chercher logique dupliquée
grep -r "function showTab" .
grep -r "onclick=" . | grep -v ".git"
```

---

## 📅 Historique de Nettoyage

**12 novembre 2025**:
- ✅ Suppression: messages.html, profil_utilisateur.html, chat.html
- ✅ Unification: Navigation index.html (9 pages HTML)
- ✅ Validation: Script validate-project.js
- ✅ Documentation: STRUCTURE.md + AUDIT_FINAL.md

---

## 💡 CONSEILS POUR LA PÉRENNITÉ

1. **Relire le STRUCTURE.md** avant d'ajouter du code
2. **Exécuter validate-project.js** avant chaque commit
3. **Garder la documentation à jour** (STRUCTURE.md en particulier)
4. **Un fichier = une responsabilité** (pas de mélange de logiques)
5. **Pas de code dupliqué** (utiliser fonctions réutilisables)
6. **Middleware partout** (protéger les routes sensibles)
7. **Tester après changement majeur** (vérifier navigation + API)

---

**Établi par**: Audit de nettoyage complet (12 novembre 2025)  
**Prochaine révision**: À chaque ajout de fonctionnalité majeure  
**Responsable**: Équipe développement
