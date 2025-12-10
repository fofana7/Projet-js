// Load seed data into database
const { pool } = require('./config/db');
const fs = require('fs');
const path = require('path');

async function loadSeedData() {
    try {
        console.log('📊 Chargement des données de test...');
        
        const seedFile = fs.readFileSync(path.join(__dirname, 'seed-test-users.sql'), 'utf8');
        const statements = seedFile
            .split(';')
            .map(s => s.trim())
            .filter(s => s && !s.startsWith('--'));

        for (const statement of statements) {
            if (statement) {
                await pool.query(statement);
                console.log('✓', statement.substring(0, 50) + '...');
            }
        }

        console.log('✅ Données de test chargées avec succès!');
        console.log('\n📋 Test users créés:');
        const users = await pool.query('SELECT id, username, email FROM users ORDER BY username');
        users.rows.forEach(u => console.log(`  - ${u.username} (${u.email})`));

        console.log('\n👥 Friendships:');
        const friends = await pool.query(
            'SELECT f.*, u1.username as from_user, u2.username as to_user FROM friendships f JOIN users u1 ON f.user_id_1 = u1.id JOIN users u2 ON f.user_id_2 = u2.id'
        );
        friends.rows.forEach(f => console.log(`  - ${f.from_user} → ${f.to_user} (${f.status})`));

        console.log('\n📁 Groups:');
        const groups = await pool.query('SELECT id, name FROM groups');
        groups.rows.forEach(g => console.log(`  - ${g.name}`));

        process.exit(0);
    } catch (error) {
        console.error('❌ Erreur:', error.message);
        process.exit(1);
    }
}

loadSeedData();
