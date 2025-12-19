// auth.js
// ======= CONST =======
// Chemin de base de l'API auth
const API_URL = "http://localhost:3000/api/auth"; 

// Clé pour stocker la session complète (incluant le token)
const SESSION_KEY = "minireseau:session"; 

// ======= SESSION =======
function setSession(data) {
    localStorage.setItem(SESSION_KEY, JSON.stringify(data));
}

function getSession() {
    const s = localStorage.getItem(SESSION_KEY);
    return s ? JSON.parse(s) : null;
}

function getToken() {
    const session = getSession();
    return session ? session.token : null;
}

function getUserId() {
    const session = getSession();
    return session && session.user ? session.user.id : null;
}

function logout() {
    localStorage.removeItem(SESSION_KEY);
    window.location.href = "login.html";
}

// ======= ROLE GUARD (FRONT) =======
// Utilitaire pour les pages dédiées :
//   const user = requireRole('enseignant');
//   const user = requireRole(['personnel', 'enseignant']);
// Si l'utilisateur n'est pas connecté -> redirection login.
// Si le rôle ne correspond pas -> redirection vers index (vue étudiante par défaut).
function requireRole(allowedRoles) {
    const session = getSession();
    const user = session ? session.user : null;

    if (!user) {
        window.location.href = "login.html";
        return null;
    }

    const roles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];
    if (!roles.includes(user.role)) {
        window.location.href = "index.html";
        return null;
    }

    return user;
}

// ======= SWITCH FORM (identique) =======
function switchForm(type) {
    // ... (Logique pour afficher/masquer loginForm et registerForm) ...
    const forms = ["loginForm", "registerForm"];
    forms.forEach(f => {
        const el = document.getElementById(f);
        if(el) el.style.display = "none";
    });

    if (type === "login") {
        const el = document.getElementById("loginForm");
        if(el) el.style.display = "block";
    }
    else if (type === "register") {
        const el = document.getElementById("registerForm");
        if(el) el.style.display = "block";
    }
}

// ======= INSCRIPTION (Utilise la route /register) =======
async function register() {
    // ... (Logique de récupération des champs, validation de base) ...
    const username = document.getElementById("regName").value.trim() + " " + document.getElementById("regPrenom").value.trim();
    const email = document.getElementById("regEmail").value.trim().toLowerCase();
    const password = document.getElementById("regPassword").value.trim();
    const role = (document.getElementById("regRole")?.value || "eleve").toLowerCase();
    let classe = "";
    if (role === "eleve") {
        classe = (document.getElementById("regClasse")?.value || "").trim();
        if (!classe) {
            return alert("Veuillez renseigner votre classe (ex: L3 INFO A)");
        }
    }

    if (!username || !email || !password) {
        return alert("Remplissez tous les champs");
    }

    // Validation locale du mot de passe pour aider l'utilisateur
    const strongRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{12,}$/;
    if (!strongRegex.test(password)) {
        return alert("Mot de passe trop faible. Il doit contenir au moins 12 caractères, une majuscule, un chiffre et un caractère spécial.");
    }

    try {
        const res = await fetch(`${API_URL}/register`, { 
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username, email, password, role, classe })
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Erreur inscription");

        alert("Inscription réussie ! Vous pouvez vous connecter.");
        switchForm("login");
    } catch (err) {
        alert(err.message);
    }
}

// ======= CONNEXION (Stocke le token) =======
async function login() {
    // ... (Logique de récupération des champs, validation de base) ...
    const email = document.getElementById("loginEmail").value.trim().toLowerCase();
    const password = document.getElementById("loginPassword").value.trim();

    if (!email || !password) return alert("Remplissez tous les champs");

    try {
        const res = await fetch(`${API_URL}/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password })
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Erreur connexion");

        // Stocker la session complète (utilisé par d'autres pages)
        setSession(data); // { user, token }

        // Aligner avec l'index qui attend localStorage.token / localStorage.user
        try {
            if (data.token) {
                localStorage.setItem('token', data.token);
            }
            if (data.user) {
                localStorage.setItem('user', JSON.stringify(data.user));
            }
        } catch (e) {
            console.warn('Stockage local token/user échoué:', e);
        }

        // Redirection en fonction du rôle
        const role = (data.user && data.user.role) ? data.user.role : 'eleve';
        let target = "index.html"; // Vue principale pour les étudiants

        if (role === 'enseignant') {
            target = "dashboard-enseignant.html";
        } else if (role === 'personnel') {
            target = "dashboard-personnel.html";
        }

        window.location.href = target;
    } catch (err) {
        alert(err.message);
    }
}

// ======= PROTECTION PAGE =======
function protectPage() {
    if (!getSession()) window.location.href = "login.html";
}

// ======= UTILITAIRES =======
function getCurrentUser() {
    const session = getSession();
    return session ? session.user : null;
}

// ======= EXPORT GLOBAL =======
window.register = register;
window.login = login;
window.switchForm = switchForm;
window.logout = logout;
window.protectPage = protectPage;
window.getCurrentUser = getCurrentUser;
window.getToken = getToken; // Pour le ProfileManager
window.getUserId = getUserId; // Pour le ProfileManager
window.requireRole = requireRole;