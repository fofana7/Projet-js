# 🛠️ QUICK START & MAINTENANCE GUIDE (Windows PowerShell)
# Pour démarrer et maintenir le projet propre

Write-Host "======================================" -ForegroundColor Cyan
Write-Host "🎯 PROJET-JS QUICK START GUIDE" -ForegroundColor Cyan
Write-Host "======================================" -ForegroundColor Cyan
Write-Host ""

# Function to print colored text
function Print-Header {
    param([string]$Text)
    Write-Host $Text -ForegroundColor Blue
}

function Print-Success {
    param([string]$Text)
    Write-Host "✅ $Text" -ForegroundColor Green
}

function Print-Warning {
    param([string]$Text)
    Write-Host "⚠️  $Text" -ForegroundColor Yellow
}

function Print-Error {
    param([string]$Text)
    Write-Host "❌ $Text" -ForegroundColor Red
}

# Get current directory
$ProjectRoot = Get-Location

# Check Node.js
Print-Header "1️⃣  Vérification de l'environnement..."
$NodePath = Get-Command node -ErrorAction SilentlyContinue
if ($NodePath) {
    $NodeVersion = node -v
    Print-Success "Node.js trouvé: $NodeVersion"
} else {
    Print-Warning "Node.js non trouvé. Installez-le depuis https://nodejs.org"
    exit 1
}

# Check npm
$NpmPath = Get-Command npm -ErrorAction SilentlyContinue
if ($NpmPath) {
    $NpmVersion = npm -v
    Print-Success "npm trouvé: $NpmVersion"
} else {
    Print-Error "npm non trouvé"
    exit 1
}

Write-Host ""
Print-Header "2️⃣  Installation des dépendances backend..."
$BackendPath = Join-Path $ProjectRoot "backend"
if (Test-Path (Join-Path $BackendPath "package.json")) {
    Push-Location $BackendPath
    npm install *>$null
    Pop-Location
    Print-Success "Dépendances backend installées"
} else {
    Print-Warning "Impossible de trouver backend/package.json"
}

Write-Host ""
Print-Header "3️⃣  Validation de la structure du projet..."
$ValidateScript = Join-Path $ProjectRoot "validate-project.js"
if (Test-Path $ValidateScript) {
    node $ValidateScript
} else {
    Print-Warning "Script validate-project.js non trouvé"
}

Write-Host ""
Print-Header "4️⃣  Prochaines étapes:"
Write-Host ""
Write-Host "  📚 Lire la documentation:" -ForegroundColor Cyan
Write-Host "     - RESUME.md           (résumé rapide)"
Write-Host "     - STRUCTURE.md        (organisation du projet)"
Write-Host "     - CHECKLIST.md        (regles de développement)"
Write-Host "     - DASHBOARD.md        (tableau de bord)"
Write-Host ""
Write-Host "  🚀 Démarrer le serveur:" -ForegroundColor Cyan
Write-Host "     cd backend ; npm start"
Write-Host "     # Le serveur sera sur http://localhost:3000"
Write-Host ""
Write-Host "  🧪 Valider le projet:" -ForegroundColor Cyan
Write-Host "     node validate-project.js"
Write-Host ""
Write-Host "  📱 Tester dans le navigateur:" -ForegroundColor Cyan
Write-Host "     http://localhost:3000              (accueil)"
Write-Host "     http://localhost:3000/login.html   (connexion)"
Write-Host ""

Write-Host "======================================" -ForegroundColor Green
Print-Success "Setup complété!"
Write-Host "======================================" -ForegroundColor Green
Write-Host ""
