#!/usr/bin/env node
// Script pour démarrer le serveur et vérifier tout

const { exec } = require('child_process');
const path = require('path');

console.log('🚀 Démarrage du serveur...\n');

// Tuer les processus node existants
exec('taskkill /F /IM node.exe', (err) => {
    // Ignorer les erreurs si aucun processus
    setTimeout(() => {
        const serverProcess = exec('node server.js', {
            cwd: path.join(__dirname)
        });

        serverProcess.stdout.on('data', (data) => {
            console.log(data);
        });

        serverProcess.stderr.on('data', (data) => {
            console.error(data);
        });

        // Laisser le serveur tourner
        process.on('SIGINT', () => {
            console.log('\n\n❌ Serveur arrêté');
            process.exit(0);
        });
    }, 500);
});
