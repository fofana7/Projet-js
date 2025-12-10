#!/usr/bin/env node
// Script de test pour vérifier la configuration BD et exécuter les migrations

const { Pool } = require('pg');

async function runTests() {
    console.log('🧪 Démarrage des tests de la base de données...\n');

    const pool = new Pool({
        user: 'postgres',
        host: 'localhost',
        database: 'MiniRéseau',
        password: 'passer123',
        port: 5432,
    });

    try {
        // Test 1: Connexion
        console.log('Test 1: Connexion à PostgreSQL...');
        const result = await pool.query('SELECT NOW()');
        console.log('✓ Connexion réussie\n');

        // Test 2: Vérifier la table users
        console.log('Test 2: Vérification de la table users...');
        const tableCheck = await pool.query(`
            SELECT EXISTS (
                SELECT FROM information_schema.tables 
                WHERE table_name = 'users'
            );
        `);
        if (tableCheck.rows[0].exists) {
            console.log('✓ Table users existe\n');
        } else {
            console.log('❌ Table users n\'existe pas\n');
            process.exit(1);
        }

        // Test 3: Ajouter les colonnes manquantes
        console.log('Test 3: Vérification et ajout des colonnes...');
        await pool.query('ALTER TABLE users ADD COLUMN IF NOT EXISTS bio VARCHAR(160);');
        console.log('✓ Colonne bio OK');
        
        await pool.query('ALTER TABLE users ADD COLUMN IF NOT EXISTS avatarurl TEXT;');
        console.log('✓ Colonne avatarurl OK\n');

        // Test 4: Vérifier la structure finale
        console.log('Test 4: Structure finale de la table users:');
        const columns = await pool.query(`
            SELECT column_name, data_type 
            FROM information_schema.columns 
            WHERE table_name = 'users'
            ORDER BY ordinal_position;
        `);
        columns.rows.forEach(col => {
            console.log(`  - ${col.column_name}: ${col.data_type}`);
        });
        console.log('\n');

        // Test 5: Compter les utilisateurs
        console.log('Test 5: Vérification des données...');
        const userCount = await pool.query('SELECT COUNT(*) as count FROM users;');
        console.log(`✓ ${userCount.rows[0].count} utilisateur(s) trouvé(s)\n`);

        console.log('✅ Tous les tests sont passés!\n');
        console.log('Vous pouvez maintenant relancer le serveur:');
        console.log('  cd backend && node server.js');

        await pool.end();
        process.exit(0);

    } catch (error) {
        console.error('\n❌ Erreur lors des tests:');
        console.error('  Message:', error.message);
        console.error('  Code:', error.code);
        console.error('\n⚠️  Vérifiez votre configuration PostgreSQL dans config/db.js');
        
        await pool.end();
        process.exit(1);
    }
}

runTests();
