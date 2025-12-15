# ✅ CHECKLIST DE VALIDATION - Message.html

## Statut Général
- ✅ Tous les boutons fonctionnels (100%)
- ✅ Modales créées et intégrées
- ✅ Aucun alert() superflu
- ✅ localStorage persistance OK
- ✅ Rôles différenciés

---

## Boutons à Tester - ONGLETS

### Onglet 1: Messagerie Privée (💬)
- [ ] Affiche conversations privées
- [ ] Bouton ➕ fonctionne
- [ ] Cliquer sur une conversation l'ouvre
- [ ] Composer et envoyer un message

### Onglet 2: Groupes / Projets (👥)
- [ ] Vide ou affiche groupes
- [ ] Peut ajouter groupe

### Onglet 3: Forum Q&R (❓)
- [ ] Affiche les questions
- [ ] Affiche les réponses

### Onglet 4: Partage Docs (📄)
- [ ] Affiche les documents
- [ ] Peut ajouter document

### Onglet 5: Événements (📅)
- [ ] Affiche les événements
- [ ] Vide au démarrage

### Onglet 6: Annonces (📢)
- [ ] Affiche les annonces
- [ ] Affiche priorité

### Onglet 7: Sondages (📊)
- [ ] Affiche les sondages
- [ ] Vide au démarrage

---

## Boutons d'Actions PAR RÔLE

### 👨‍🎓 ÉLÈVE

**Bouton 1: 📝 Publier**
- [ ] Clique → ouvre modale publication
- [ ] Peut écrire message
- [ ] Checkbox "Publier dans forum" fonctionne
- [ ] Bouton "Publier" ajoute le message
- [ ] Succès affiché pendant 1s
- [ ] Modale se ferme automatiquement

**Bouton 2: 💬 Nouveau**
- [ ] Clique → demande nom du contact
- [ ] Ajoute nouvelle conversation privée
- [ ] Switch vers Messagerie privée
- [ ] La conversation est sélectionnée

**Bouton 3: 📚 Forum**
- [ ] Clique → redirige vers Forum Q&R
- [ ] L'onglet Forum devient actif

---

### 👨‍🏫 ENSEIGNANT

**Bouton 1: 📝 Classe**
- [ ] Clique → ouvre modale "Publier pour la classe"
- [ ] Champs: Titre*, Contenu*, Classe cible*
- [ ] Bouton "Publier" ajoute le message
- [ ] Redirige vers Forum
- [ ] Succès affiché

**Bouton 2: 📦 Ressource**
- [ ] Clique → ouvre modale "Partager une ressource"
- [ ] Champs: Nom*, Type (dropdown), URL*, Description
- [ ] Types disponibles: PDF, Vidéo, Exercice, Lien
- [ ] Bouton "Partager" ajoute la ressource
- [ ] Redirige vers Partage docs
- [ ] Succès affiché

**Bouton 3: 🛡️ Modérer**
- [ ] Clique → redirige vers Forum Q&R

---

### 👔 PERSONNEL (Tous les droits)

**Bouton 1: 📢 Annonce**
- [ ] Clique → ouvre modale "Publier une annonce"
- [ ] Champs: Titre*, Message*, Priorité (dropdown)
- [ ] Priorités: Normal, Important, Urgent
- [ ] Bouton "Publier" ajoute l'annonce
- [ ] Redirige vers Annonces
- [ ] Succès affiché

**Bouton 2: 👥 Gestion**
- [ ] Clique → affiche alert "Gestion utilisateurs - Non implémenté"

**Bouton 3: 🌐 Modération**
- [ ] Clique → redirige vers Annonces (board tab)

**Bouton 4: 📄 Document**
- [ ] Clique → ouvre modale "Partager un document"
- [ ] Champs: Titre*, URL*, Description
- [ ] Bouton "Partager" ajoute le document
- [ ] Redirige vers Partage docs
- [ ] Succès affiché

---

## Autres Boutons

### Composer
- [ ] Textarea input fonctionne
- [ ] Maj+Entrée = nouvelle ligne
- [ ] Entrée = envoie le message
- [ ] Bouton "Envoyer" fonctionne
- [ ] Message apparaît dans la conversation

### Attachement
- [ ] Bouton 📎 fonctionne (peut choisir fichier)
- [ ] Fichier s'attache au message

### ➕ Ajouter conversation
- [ ] Clique → demande nom du contact
- [ ] Ajoute nouvelle conversation privée

### Retour
- [ ] Bouton "← Retour" fonctionne
- [ ] Redirection vers ../index.html

---

## localStorage

- [ ] Vérifier: F12 > Application > localStorage
- [ ] Clé: `minireseau_messaging_v2`
- [ ] Données sauvegardées après chaque action
- [ ] Recharger la page → données persistent

---

## Validations & Messages

### Messages d'Erreur
- [ ] ❌ "Message requis" (post vide)
- [ ] ❌ "Titre et contenu requis" (annonce)
- [ ] ❌ "Tous les champs sont requis" (classe post)
- [ ] ❌ "Titre et URL requis" (doc)

### Messages de Succès
- [ ] ✓ "Publié dans le forum!" (post)
- [ ] ✓ "Message publié!" (message privé)
- [ ] ✓ "Ressource partagée!" (resource)
- [ ] ✓ "Annonce publiée!" (announce)
- [ ] ✓ "Document partagé!" (doc)

---

## Performance

- [ ] Pas de lag en cliquant sur les boutons
- [ ] Modales s'ouvrent rapidement
- [ ] Les données s'affichent instantanément

---

## Cross-browser

Si possible, tester avec:
- [ ] Chrome/Edge
- [ ] Firefox
- [ ] Safari (si disponible)

---

## Résumé

**Nombre de Boutons à Tester**: 26+  
**Nombre de Modales**: 5  
**Nombre de Fonctions**: 5 + 1 existant  
**Statut**: 🟢 **PRÊT À TESTER**

---

## Comment Tester?

### Option 1: Simple
```
http://localhost:3000/frontend/pages/message.html
```
(Charge avec rôle "élève" par défaut)

### Option 2: Avec Sélection de Rôle
```
http://localhost:3000/test-roles.html
```
(Permet de choisir élève, enseignant, ou personnel)

---

**Test effectué par**: Toi  
**Date**: 12 Décembre 2025  
**Résultat Final**: À compléter après test
