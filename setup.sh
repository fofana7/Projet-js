#!/bin/bash
# 🛠️ QUICK START & MAINTENANCE GUIDE
# Pour démarrer et maintenir le projet propre

echo "======================================"
echo "🎯 PROJET-JS QUICK START GUIDE"
echo "======================================"
echo ""

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored text
print_header() {
    echo -e "${BLUE}$1${NC}"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

# Check Node.js
print_header "1️⃣  Vérification de l'environnement..."
if command -v node &> /dev/null; then
    NODE_VERSION=$(node -v)
    print_success "Node.js trouvé: $NODE_VERSION"
else
    print_warning "Node.js non trouvé. Installez-le depuis https://nodejs.org"
    exit 1
fi

# Check npm
if command -v npm &> /dev/null; then
    NPM_VERSION=$(npm -v)
    print_success "npm trouvé: $NPM_VERSION"
else
    print_warning "npm non trouvé"
    exit 1
fi

echo ""
print_header "2️⃣  Installation des dépendances backend..."
cd backend 2>/dev/null
if [ -f "package.json" ]; then
    npm install 2>/dev/null
    print_success "Dépendances backend installées"
else
    print_warning "Impossible de trouver backend/package.json"
fi
cd .. 2>/dev/null

echo ""
print_header "3️⃣  Validation de la structure du projet..."
if command -v node &> /dev/null; then
    node validate-project.js
fi

echo ""
print_header "4️⃣  Prochaines étapes:"
echo ""
echo "  📚 Lire la documentation:"
echo "     - RESUME.md           (résumé rapide)"
echo "     - STRUCTURE.md        (organisation du projet)"
echo "     - CHECKLIST.md        (regles de développement)"
echo "     - DASHBOARD.md        (tableau de bord)"
echo ""
echo "  🚀 Démarrer le serveur:"
echo "     cd backend && npm start"
echo "     # Le serveur sera sur http://localhost:3000"
echo ""
echo "  🧪 Valider le projet:"
echo "     node validate-project.js"
echo ""
echo "  📱 Tester dans le navigateur:"
echo "     http://localhost:3000        (accueil)"
echo "     http://localhost:3000/login.html       (connexion)"
echo ""

echo "======================================"
print_success "Setup complété!"
echo "======================================"
echo ""
