# 🧪 Test de la Page Message.html

## Tous les Boutons à Tester

### Boutons Onglets (en haut)
- [ ] 💬 Messagerie privée
- [ ] 👥 Groupes / Projets
- [ ] ❓ Forum Q&R
- [ ] 📄 Partage docs
- [ ] 📅 Événements
- [ ] 📢 Annonces
- [ ] 📊 Sondages

### Boutons d'Actions (selon le rôle)

#### Pour élève:
- [ ] 📝 Publier (ouvre modal publication)
- [ ] 💬 Nouveau (crée nouveau message privé)
- [ ] 📚 Forum (redirige vers Forum Q&R)

#### Pour enseignant:
- [ ] 📝 Classe (ouvre modal publication classe)
- [ ] 📦 Ressource (ouvre modal partage ressource)
- [ ] 🛡️ Modérer (redirige vers Forum)

#### Pour personnel:
- [ ] 📢 Annonce (ouvre modal annonce)
- [ ] 👥 Gestion (affiche message gestion)
- [ ] 🌐 Modération (redirige vers Annonces)
- [ ] 📄 Document (ouvre modal document)

### Boutons de Conversation
- [ ] ➕ Ajouter nouveau (crée nouvelle conversation privée)

### Boutons de Composer
- [ ] 📎 Fichier (permet d'attacher un fichier)
- [ ] Envoyer (envoie le message)

### Clavier
- [ ] Maj+Entrée = nouvelle ligne dans composer
- [ ] Entrée = envoie le message

## État Attendu

✅ **Tous les boutons doivent être cliquables**
✅ **Aucun alert() - utiliser des modales**
✅ **Données persistées en localStorage**
✅ **Tabs changeables**
✅ **Conversations gérables**

## Pour Tester

1. Ouvrir: `http://localhost:3000/frontend/pages/message.html`
2. Tester chaque bouton
3. Vérifier que les actions fonctionnent
4. Vérifier les données en `localStorage > minireseau_messaging_v2`

## Fixes Appliqués

✅ ROLE_ACTIONS utilise des vrais actions au lieu d'alert()
✅ Modales créées pour toutes les actions
✅ Fonction createNewMessage() pour nouveau contact
✅ Fonctions submitPost(), submitClassPost(), submitResource(), submitAnnounce()
✅ Tous les onglets switchTab() fonctionnels
✅ Le bouton ➕ relie à createNewMessage()
