const jwt = require('jsonwebtoken');
const http = require('http');

const JWT_SECRET = 'VOTRE_SUPER_CLE_SECRETE_ETUDIANTE_123';

// Créer un token valide
const token = jwt.sign({id: 1, username: 'test', email: 'test@esme.fr'}, JWT_SECRET);
console.log('TOKEN créé:', token);

// Tester l'API
function testAPI() {
    const options = {
        hostname: 'localhost',
        port: 3000,
        path: '/api/ami',
        method: 'GET',
        headers: {
            'Authorization': 'Bearer ' + token
        }
    };

    const req = http.request(options, (res) => {
        console.log('Status:', res.statusCode);
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
            console.log('Response:', data);
            process.exit(0);
        });
    });

    req.on('error', (err) => {
        console.error('Erreur:', err.message);
        process.exit(1);
    });

    req.end();
}

setTimeout(testAPI, 500);
