// backend/controllers/classController.js
const { pool } = require('../config/db');

// Lister toutes les classes actives
// On combine :
// 1) Les classes "officielles" de la table classes
// 2) Les valeurs distinctes déjà présentes dans users.classe (ancien système)
exports.listClasses = async (req, res) => {
  try {
    // Classe officielles
    const result = await pool.query(
      'SELECT id, code, label, level, is_active, created_at FROM classes WHERE is_active = TRUE ORDER BY code ASC'
    );
    const classes = result.rows || [];

    // Codes de classe déjà utilisés dans les comptes existants
    const usedRes = await pool.query(
      "SELECT DISTINCT TRIM(classe) AS code FROM users WHERE classe IS NOT NULL AND TRIM(classe) <> ''"
    );

    const existingCodes = new Set(classes.map(c => c.code));

    usedRes.rows.forEach(row => {
      const code = row.code;
      if (!code) return;
      if (!existingCodes.has(code)) {
        existingCodes.add(code);
        classes.push({
          id: null,
          code,
          label: null,
          level: null,
          is_active: true,
          created_at: null
        });
      }
    });

    // Trier par code pour un rendu propre
    classes.sort((a, b) => {
      if (a.code < b.code) return -1;
      if (a.code > b.code) return 1;
      return 0;
    });

    res.json({ classes });
  } catch (err) {
    console.error('LIST CLASSES ERROR', err);
    res.status(500).json({ error: 'Erreur serveur', details: err.message });
  }
};

// Créer une nouvelle classe (réservé au personnel / admin)
exports.createClass = async (req, res) => {
  try {
    let { code, label, level } = req.body;
    const userId = req.user?.id || null;

    if (!code) {
      return res.status(400).json({ error: 'Le code de classe est requis' });
    }

    code = String(code).trim().toUpperCase();
    label = label ? String(label).trim() : null;
    level = level ? String(level).trim() : null;

    const result = await pool.query(
      'INSERT INTO classes (code, label, level, created_by) VALUES ($1,$2,$3,$4) RETURNING id, code, label, level, is_active, created_at',
      [code, label, level, userId]
    );

    res.status(201).json({ classe: result.rows[0] });
  } catch (err) {
    if (err.code === '23505') {
      return res.status(400).json({ error: 'Une classe avec ce code existe déjà' });
    }
    console.error('CREATE CLASS ERROR', err);
    res.status(500).json({ error: 'Erreur serveur', details: err.message });
  }
};

// Désactiver une classe (plutôt que supprimer définitivement)
exports.deactivateClass = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      'UPDATE classes SET is_active = FALSE WHERE id = $1 RETURNING id, code, label, level, is_active, created_at',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Classe non trouvée' });
    }

    res.json({ classe: result.rows[0] });
  } catch (err) {
    console.error('DEACTIVATE CLASS ERROR', err);
    res.status(500).json({ error: 'Erreur serveur', details: err.message });
  }
};
