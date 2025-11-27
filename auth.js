// ======= CONST =======
const API_URL = "http://localhost:3000/api";

// ======= SESSION =======
function setSession(users) {
    localStorage.setItem("minireseau:session", JSON.stringify(users));
}

function getSession() {
    const s = localStorage.getItem("minireseau:session");
    return s ? JSON.parse(s) : null;
}

function logout() {
    localStorage.removeItem("minireseau:session");
    window.location.href = "login.html";
}

// ======= SWITCH FORM =======
function switchForm(type) {
    const forms = ["loginForm", "registerForm"];
    forms.forEach(f => document.getElementById(f).style.display = "none");

    if (type === "login") document.getElementById("loginForm").style.display = "block";
    else if (type === "register") document.getElementById("registerForm").style.display = "block";
}

// ======= INSCRIPTION =======
async function register() {
    // On concatène Nom + Prénom pour username
    const username = document.getElementById("regName").value.trim() + " " + document.getElementById("regPrenom").value.trim();
    const email = document.getElementById("regEmail").value.trim().toLowerCase();
    const password = document.getElementById("regPassword").value.trim();


    if (!username || !email || !password) {
        return alert("Remplissez tous les champs");
    }

    try {
        const res = await fetch(`${API_URL}/register`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username, email, password })
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Erreur inscription");

        alert("Inscription réussie !");
        switchForm("login");
    } catch (err) {
        alert(err.message);
        console.error(err);
    }
}

// ======= CONNEXION =======
async function login() {
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

        setSession(data.user);
        window.location.href = "index.html"; // redirige vers la page principale
    } catch (err) {
        alert(err.message);
        console.error(err);
    }
}

// ======= PROTECTION PAGE =======
function protectPage() {
    if (!getSession()) window.location.href = "login.html";
}

// ======= UTILITAIRES =======
function getCurrentUser() {
    return getSession();
}

// ======= EXPORT GLOBAL =======
window.register = register;
window.login = login;
window.switchForm = switchForm;
window.logout = logout;
window.protectPage = protectPage;
window.getCurrentUser = getCurrentUser;
