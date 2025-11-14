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
<<<<<<< HEAD
async function register() {
    // On concatène Nom + Prénom pour username
    const username = document.getElementById("regName").value.trim() + " " + document.getElementById("regPrenom").value.trim();
    const email = document.getElementById("regEmail").value.trim().toLowerCase();
    const password = document.getElementById("regPassword").value.trim();
=======
function register() {
  const name = document.getElementById("regName").value.trim();
  const prenom = document.getElementById("regPrenom").value.trim();
  const pseudo = (name + " " + prenom).toLowerCase(); // pseudo insensible à la casse
  const email = document.getElementById("regEmail").value.trim().toLowerCase();
  const pass = document.getElementById("regPassword").value.trim();
>>>>>>> 06caad837c818d43c17939b469ee6f010eca4a1e

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

<<<<<<< HEAD
        alert("Inscription réussie !");
        switchForm("login");
    } catch (err) {
        alert(err.message);
        console.error(err);
    }
=======
  let users = getUsers();

  // Vérifier si l'email existe déjà
  if (users.find(u => u.email === email)) 
      return alert("Cet email existe déjà.");

  // Vérifier si le pseudo existe déjà (insensible à la casse)
  if (users.find(u => u.name.toLowerCase() === pseudo)) 
      return alert("Ce pseudo existe déjà.");

  users.push({
      name: name + " " + prenom,
      email,
      password: pass,
      avatar: null,
      bio: ""
  });

  saveUsers(users);

  alert("Compte créé !");
  switchForm("login");
>>>>>>> 06caad837c818d43c17939b469ee6f010eca4a1e
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
