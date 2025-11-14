// ======= CONST =======
const USERS_KEY = "minireseau:users";
const SESSION_KEY = "minireseau:session";

// ======= UTILITAIRES =======
function getUsers() {
  return JSON.parse(localStorage.getItem(USERS_KEY) || "[]");
}

function saveUsers(users) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

function setSession(email) {
  localStorage.setItem(SESSION_KEY, email);
}

function getSession() {
  return localStorage.getItem(SESSION_KEY);
}

function logout() {
  localStorage.removeItem(SESSION_KEY);
  location.href = "login.html";
}

// ======= SWITCH FORM =======
let resetEmail = null;

function switchForm(type){
  const forms = ["loginForm", "registerForm", "forgotForm", "resetForm"];
  forms.forEach(f => document.getElementById(f).style.display = "none");

  if(type === "login"){
    document.getElementById("formTitle").textContent = "Connexion";
    document.getElementById("loginForm").style.display = "block";
  } else if(type === "register"){
    document.getElementById("formTitle").textContent = "Inscription";
    document.getElementById("registerForm").style.display = "block";
  } else if(type === "forgot"){
    document.getElementById("formTitle").textContent = "Mot de passe oublié";
    document.getElementById("forgotForm").style.display = "block";
  } else if(type === "reset"){
    document.getElementById("formTitle").textContent = "Nouveau mot de passe";
    document.getElementById("resetForm").style.display = "block";
  }
}

// ======= MOT DE PASSE ANSI/NIST =======
function isValidPassword(pass) {
  const minLength = 8;
  const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]).+$/;

  if(pass.length < minLength) {
    alert("Le mot de passe doit contenir au moins 8 caractères.");
    return false;
  }
  if(!regex.test(pass)) {
    alert("Le mot de passe doit contenir au moins une majuscule, une minuscule, un chiffre et un caractère spécial.");
    return false;
  }
  return true;
}

// ======= INSCRIPTION =======
function register() {
  const name = document.getElementById("regName").value.trim();
  const prenom = document.getElementById("regPrenom").value.trim();
  const pseudo = (name + " " + prenom).toLowerCase(); // pseudo insensible à la casse
  const email = document.getElementById("regEmail").value.trim().toLowerCase();
  const pass = document.getElementById("regPassword").value.trim();

  if (!name || !prenom || !email || !pass) 
      return alert("Remplissez tous les champs.");

  // Vérifier email @esme.fr
  if (!email.endsWith("@esme.fr")) {
      return alert("Vous devez utiliser un email se terminant par @esme.fr");
  }

  if (!isValidPassword(pass)) return;

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
}

// ======= CONNEXION =======
function login() {
  const email = document.getElementById("loginEmail").value.trim().toLowerCase();
  const pass = document.getElementById("loginPassword").value.trim();

  const users = getUsers();
  const user = users.find(u => u.email === email && u.password === pass);
  if(!user) return alert("Email ou mot de passe incorrect.");

  setSession(email);
  location.href = "index.html";
}

// ======= MOT DE PASSE OUBLIÉ =======
function searchUserForReset(){
  const email = document.getElementById("forgotEmail").value.trim().toLowerCase();
  const users = getUsers();
  const user = users.find(u => u.email === email);

  if(!user){
    alert("Aucun compte trouvé avec cet email.");
    return;
  }

  resetEmail = email;
  switchForm("reset");
}

function resetPassword(){
  const pass = document.getElementById("newPassword").value.trim();
  if(!pass) return alert("Entrez un mot de passe.");

  if (!isValidPassword(pass)) return;

  const users = getUsers();
  const user = users.find(u => u.email === resetEmail);
  user.password = pass;

  saveUsers(users);
  alert("Mot de passe réinitialisé !");
  switchForm("login");
}

// ======= PROTECTION PAGE =======
function protectPage() {
  if (!getSession()) {
    location.href = "login.html";
  }
}

// ======= SESSION ACTUELLE =======
function getCurrentUser() {
  const email = getSession();
  if(!email) return null;
  const users = getUsers();
  return users.find(u => u.email === email);
}

// ======= EXPORT / GLOBAL =======
window.register = register;
window.login = login;
window.switchForm = switchForm;
window.searchUserForReset = searchUserForReset;
window.resetPassword = resetPassword;
window.logout = logout;
window.protectPage = protectPage;
window.getCurrentUser = getCurrentUser;
