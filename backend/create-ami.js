const fs = require('fs');
const path = require('path');

const html = `<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Réseau — Amis</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { background: linear-gradient(135deg, #0a0f1f 0%, #1a1f3a 100%); color: #f1f5f9; font-family: 'Segoe UI', sans-serif; min-height: 100vh; }
        .header { background: rgba(15, 23, 42, 0.95); padding: 20px 30px; border-bottom: 1px solid #334155; display: flex; justify-content: space-between; align-items: center; position: sticky; top: 0; z-index: 100; }
        .header h1 { font-size: 28px; font-weight: 700; background: linear-gradient(135deg, #6366f1 0%, #ec4899 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }
        .container { display: grid; grid-template-columns: 300px 1fr 350px; gap: 20px; padding: 20px 30px; max-width: 1600px; margin: 0 auto; min-height: calc(100vh - 100px); }
        .section { background: #1e293b; border-radius: 15px; border: 1px solid #334155; padding: 20px; display: flex; flex-direction: column; }
        .section-title { font-size: 18px; font-weight: 700; margin-bottom: 20px; }
        .user-card { background: rgba(255, 255, 255, 0.03); border: 1px solid rgba(255, 255, 255, 0.05); border-radius: 12px; padding: 15px; margin-bottom: 12px; display: flex; justify-content: space-between; align-items: center; transition: all 0.3s; }
        .user-card:hover { background: rgba(99, 102, 241, 0.15); border-color: #6366f1; }
        .avatar { width: 40px; height: 40px; border-radius: 50%; background: linear-gradient(135deg, #6366f1, #ec4899); display: flex; align-items: center; justify-content: center; font-weight: 600; color: white; font-size: 14px; margin-right: 12px; }
        .user-info { flex: 1; }
        .user-name { font-weight: 600; margin-bottom: 4px; }
        .user-status { font-size: 12px; color: #94a3b8; }
        .btn { padding: 8px 12px; border: 1px solid #334155; background: transparent; color: #f1f5f9; border-radius: 8px; cursor: pointer; font-size: 12px; font-weight: 500; transition: all 0.3s; white-space: nowrap; }
        .btn.primary { background: #6366f1; border-color: #6366f1; color: white; }
        .btn.success { background: #10b981; border-color: #10b981; color: white; }
        .btn.danger { background: #ef4444; border-color: #ef4444; color: white; }
        .btn.secondary { background: rgba(236, 72, 153, 0.2); border-color: #ec4899; color: #ec4899; }
        .btn:disabled { opacity: 0.6; cursor: not-allowed; }
        .empty-state { text-align: center; padding: 40px 20px; color: #94a3b8; }
        .search-box { width: 100%; padding: 12px; background: rgba(255, 255, 255, 0.05); border: 1px solid #334155; border-radius: 8px; color: #f1f5f9; margin-bottom: 15px; font-size: 14px; }
        .search-box:focus { outline: none; border-color: #6366f1; background: rgba(99, 102, 241, 0.1); }
        .stats { display: flex; gap: 15px; margin-bottom: 20px; }
        .stat-box { flex: 1; background: rgba(99, 102, 241, 0.1); border: 1px solid #334155; padding: 15px; border-radius: 10px; text-align: center; }
        .stat-value { font-size: 28px; font-weight: 700; color: #6366f1; }
        .stat-label { font-size: 12px; color: #94a3b8; margin-top: 5px; }
        .scroll-container { overflow-y: auto; flex: 1; }
        .scroll-container::-webkit-scrollbar { width: 6px; }
        .scroll-container::-webkit-scrollbar-track { background: rgba(255, 255, 255, 0.05); border-radius: 3px; }
        .scroll-container::-webkit-scrollbar-thumb { background: rgba(99, 102, 241, 0.5); border-radius: 3px; }
        @media (max-width: 1200px) { .container { grid-template-columns: 1fr; } }
    </style>
</head>
<body>
    <div class="header">
        <h1>🤝 Réseau d'Étudiants</h1>
        <button class="btn primary" onclick="window.location.href='index.html'">← Retour</button>
    </div>

    <div class="container">
        <div class="section">
            <div class="section-title">🔍 Découvrir</div>
            <input type="text" id="searchInput" class="search-box" placeholder="Chercher par nom...">
            <div id="suggestionsBox" class="scroll-container"><div class="empty-state">Chargement...</div></div>
        </div>

        <div style="display: flex; flex-direction: column; gap: 20px;">
            <div class="stats">
                <div class="stat-box"><div class="stat-value" id="statsAmis">0</div><div class="stat-label">Amis</div></div>
                <div class="stat-box"><div class="stat-value" id="statsRequests">0</div><div class="stat-label">Demandes</div></div>
            </div>

            <div class="section">
                <div class="section-title">📬 Demandes d'amitié</div>
                <div id="requestsBox" class="scroll-container"><div class="empty-state">Aucune demande</div></div>
            </div>

            <div class="section">
                <div class="section-title">👥 Tous les étudiants</div>
                <div id="usersBox" class="scroll-container"><div class="empty-state">Chargement...</div></div>
            </div>
        </div>

        <div class="section">
            <div class="section-title">💚 Mes amis</div>
            <div id="friendsBox" class="scroll-container"><div class="empty-state">Aucun ami</div></div>
        </div>
    </div>

    <script>
        const API = 'http://localhost:3000/api';
        let currentUser = null, allUsers = [], myFriends = [], friendRequests = [], pendingRequests = new Set();

        async function init() {
            const token = localStorage.getItem('token');
            const user = localStorage.getItem('user');
            if (!token || !user) return void(window.location.href = 'login.html');
            try {
                currentUser = JSON.parse(user);
                console.log('✓ User:', currentUser);
                await loadAll();
                render();
            } catch (e) {
                console.error('Error:', e);
                alert('Erreur');
            }
        }

        async function loadAll() {
            const token = localStorage.getItem('token');
            try {
                let res = await fetch(API + '/ami', {headers: {'Authorization': 'Bearer ' + token}});
                allUsers = res.ok ? await res.json() : [];
                res = await fetch(API + '/ami/friends', {headers: {'Authorization': 'Bearer ' + token}});
                myFriends = res.ok ? await res.json() : [];
                res = await fetch(API + '/ami/requests', {headers: {'Authorization': 'Bearer ' + token}});
                friendRequests = res.ok ? await res.json() : [];
            } catch (e) {
                console.error('Error:', e);
            }
        }

        function render() {
            document.getElementById('statsAmis').textContent = myFriends.length;
            document.getElementById('statsRequests').textContent = friendRequests.length;
            renderSuggestions();
            renderUsers();
            renderRequests();
            renderFriends();
        }

        function renderSuggestions() {
            const s = allUsers.filter(u => u.id !== currentUser.id && !myFriends.find(f => f.id === u.id)).slice(0, 8);
            let html = '';
            s.forEach(u => {
                const i = (u.first_name || u.username || 'U')[0].toUpperCase();
                html += '<div class="user-card"><div style="display: flex; align-items: center; flex: 1;"><div class="avatar">' + i + '</div><div class="user-info"><div class="user-name">' + (u.first_name || u.username) + '</div><div class="user-status">Étudiant</div></div></div><button class="btn primary" onclick="addFriend(' + u.id + ')">+ Ajouter</button></div>';
            });
            document.getElementById('suggestionsBox').innerHTML = html || '<div class="empty-state">Aucune</div>';
        }

        function renderUsers() {
            const search = document.getElementById('searchInput').value.toLowerCase();
            let users = allUsers.filter(u => u.id !== currentUser.id);
            if (search) users = users.filter(u => (u.first_name || '').toLowerCase().includes(search) || (u.username || '').toLowerCase().includes(search));
            let html = '';
            users.forEach(u => {
                const i = (u.first_name || u.username || 'U')[0].toUpperCase();
                const isFriend = myFriends.find(f => f.id === u.id);
                const isPending = friendRequests.find(r => r.id === u.id);
                let btn = 'Ajouter', cls = 'primary', act = 'addFriend(' + u.id + ')', dis = 0;
                if (isFriend) btn = 'Amis ✓', cls = 'success', act = 'removeFriend(' + u.id + ')';
                else if (isPending) btn = 'Demande', cls = 'secondary', dis = 1;
                html += '<div class="user-card"><div style="display: flex; align-items: center; flex: 1;"><div class="avatar">' + i + '</div><div class="user-info"><div class="user-name">' + (u.first_name || u.username) + '</div><div class="user-status">' + (u.email || '') + '</div></div></div><button class="btn ' + cls + '" ' + (dis ? 'disabled' : '') + ' ' + (act ? 'onclick="' + act + '"' : '') + '>' + btn + '</button></div>';
            });
            document.getElementById('usersBox').innerHTML = html || '<div class="empty-state">Aucun</div>';
        }

        function renderRequests() {
            let html = '';
            friendRequests.forEach(u => {
                const i = (u.first_name || u.username || 'U')[0].toUpperCase();
                html += '<div class="user-card"><div style="display: flex; align-items: center; flex: 1;"><div class="avatar">' + i + '</div><div class="user-info"><div class="user-name">' + (u.first_name || u.username) + '</div><div class="user-status">Demande</div></div></div><div style="display: flex; gap: 8px;"><button class="btn success" onclick="acceptFriend(' + u.id + ')">✓</button><button class="btn danger" onclick="rejectFriend(' + u.id + ')">✗</button></div></div>';
            });
            document.getElementById('requestsBox').innerHTML = html || '<div class="empty-state">Aucune</div>';
        }

        function renderFriends() {
            let html = '';
            myFriends.forEach(u => {
                const i = (u.first_name || u.username || 'U')[0].toUpperCase();
                html += '<div class="user-card"><div style="display: flex; align-items: center; flex: 1;"><div class="avatar" style="background: linear-gradient(135deg, #10b981, #6366f1);">' + i + '</div><div class="user-info"><div class="user-name">' + (u.first_name || u.username) + '</div><div class="user-status">✓ En ligne</div></div></div><button class="btn danger" onclick="removeFriend(' + u.id + ')">✕</button></div>';
            });
            document.getElementById('friendsBox').innerHTML = html || '<div class="empty-state">Aucun</div>';
        }

        async function addFriend(u) {
            if (pendingRequests.has(u)) return;
            pendingRequests.add(u);
            try {
                const res = await fetch(API + '/ami/add', {method: 'POST', headers: {'Content-Type': 'application/json', 'Authorization': 'Bearer ' + localStorage.getItem('token')}, body: JSON.stringify({toId: u})});
                if (res.ok) {await loadAll(); render();}
            } catch (e) {} finally {pendingRequests.delete(u);}
        }

        async function acceptFriend(u) {
            const res = await fetch(API + '/ami/accept', {method: 'POST', headers: {'Content-Type': 'application/json', 'Authorization': 'Bearer ' + localStorage.getItem('token')}, body: JSON.stringify({fromId: u})});
            if (res.ok) {await loadAll(); render();}
        }

        async function rejectFriend(u) {
            const res = await fetch(API + '/ami/reject', {method: 'POST', headers: {'Content-Type': 'application/json', 'Authorization': 'Bearer ' + localStorage.getItem('token')}, body: JSON.stringify({fromId: u})});
            if (res.ok) {await loadAll(); render();}
        }

        async function removeFriend(u) {
            if (!confirm('Retirer?')) return;
            const res = await fetch(API + '/ami/remove', {method: 'POST', headers: {'Content-Type': 'application/json', 'Authorization': 'Bearer ' + localStorage.getItem('token')}, body: JSON.stringify({friendId: u})});
            if (res.ok) {await loadAll(); render();}
        }

        document.getElementById('searchInput').addEventListener('input', renderUsers);
        init();
    </script>
</body>
</html>`;

fs.writeFileSync(path.join(__dirname, '../ami.html'), html);
console.log('✓ ami.html créé');
`;

const filePath = 'c:/Users/user/Downloads/projet-js/Projet-js/backend/create-ami.js';
fs.writeFileSync(filePath, html);
console.log('Script créé');
