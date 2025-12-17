const { pool } = require('../config/db');

// Documents
exports.createDoc = async (req, res) => {
  const { title, url, desc, uploader } = req.body;
  if (!title || !url) return res.status(400).json({ error: 'title and url required' });
  try {
    const result = await pool.query(
      'INSERT INTO docs (title, url, description, uploader, created_at) VALUES ($1,$2,$3,$4,NOW()) RETURNING *',
      [title, url, desc || null, uploader || null]
    );
    res.status(201).json({ doc: result.rows[0] });
  } catch (err) {
    console.error('CREATE DOC ERROR', err);
    res.status(500).json({ error: 'Erreur serveur', details: err.message });
  }
};

exports.listDocs = async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM docs ORDER BY created_at DESC LIMIT 200');
    res.json({ docs: result.rows });
  } catch (err) {
    console.error('LIST DOCS ERROR', err);
    res.status(500).json({ error: 'Erreur serveur', details: err.message });
  }
};

// Events
exports.createEvent = async (req, res) => {
  const { title, when, location, desc, organizer } = req.body;
  if (!title || !when) return res.status(400).json({ error: 'title and when required' });
  try {
    const result = await pool.query(
      'INSERT INTO events (title, when_at, location, description, organizer, created_at) VALUES ($1,$2,$3,$4,$5,NOW()) RETURNING *',
      [title, when, location || null, desc || null, organizer || null]
    );
    res.status(201).json({ event: result.rows[0] });
  } catch (err) {
    console.error('CREATE EVENT ERROR', err);
    res.status(500).json({ error: 'Erreur serveur', details: err.message });
  }
};

exports.listEvents = async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM events ORDER BY when_at ASC LIMIT 200');
    res.json({ events: result.rows });
  } catch (err) {
    console.error('LIST EVENTS ERROR', err);
    res.status(500).json({ error: 'Erreur serveur', details: err.message });
  }
};

// Announcements
exports.createAnnouncement = async (req, res) => {
  const { title, content, author, class_name } = req.body;
  const userId = req.user?.id;
  if (!title || !content) return res.status(400).json({ error: 'title and content required' });
  try {
    // Créer l'annonce
    const result = await pool.query(
      'INSERT INTO announcements (title, content, author, author_id, class_name, created_at) VALUES ($1,$2,$3,$4,$5,NOW()) RETURNING *',
      [title, content, author || null, userId || null, class_name || null]
    );
    const announcement = result.rows[0];

    // Créer les notifications pour tous les étudiants de la classe
    if (class_name) {
      // Récupérer tous les étudiants de cette classe
      const studentsResult = await pool.query(
        'SELECT id FROM users WHERE classe=$1 AND role=$2',
        [class_name, 'eleve']
      );
      
      // Créer une notification pour chaque étudiant
      for (const student of studentsResult.rows) {
        await pool.query(
          'INSERT INTO announcement_notifications (announcement_id, to_user_id, is_read, created_at) VALUES ($1,$2,FALSE,NOW())',
          [announcement.id, student.id]
        );
      }
    } else {
      // Si pas de classe spécifiée, notifier tous les étudiants
      const allStudentsResult = await pool.query(
        'SELECT id FROM users WHERE role=$1',
        ['eleve']
      );
      
      for (const student of allStudentsResult.rows) {
        await pool.query(
          'INSERT INTO announcement_notifications (announcement_id, to_user_id, is_read, created_at) VALUES ($1,$2,FALSE,NOW())',
          [announcement.id, student.id]
        );
      }
    }

    res.status(201).json({ announcement: announcement });
  } catch (err) {
    console.error('CREATE ANN ERROR', err);
    res.status(500).json({ error: 'Erreur serveur', details: err.message });
  }
};

exports.deleteAnnouncement = async (req, res) => {
  const { id } = req.params;
  const userId = req.user?.id;
  
  if (!userId) return res.status(401).json({ error: 'Non authentifié' });
  
  try {
    // Vérifier que l'annonce existe
    const announcement = await pool.query(
      'SELECT * FROM announcements WHERE id=$1',
      [id]
    );
    
    if (announcement.rows.length === 0) {
      return res.status(404).json({ error: 'Annonce non trouvée' });
    }
    
    // Vérifier que l'utilisateur est l'auteur de l'annonce
    if (announcement.rows[0].author_id !== userId) {
      return res.status(403).json({ error: 'Vous pouvez uniquement supprimer vos propres annonces' });
    }
    
    // Supprimer l'annonce (les notifications sont supprimées en cascade)
    await pool.query('DELETE FROM announcements WHERE id=$1', [id]);
    
    res.json({ message: 'Annonce supprimée' });
  } catch (err) {
    console.error('DELETE ANN ERROR', err);
    res.status(500).json({ error: 'Erreur serveur', details: err.message });
  }
};

exports.listAnnouncements = async (req, res) => {
  try {
    // Si l'utilisateur est authentifié, filtrer par sa classe
    let query = 'SELECT * FROM announcements';
    let params = [];
    if (req.user && req.user.id) {
      // Récupérer la classe de l'utilisateur
      const userResult = await pool.query('SELECT classe FROM users WHERE id=$1', [req.user.id]);
      const userClass = userResult.rows[0]?.classe;
      if (userClass) {
        query += ' WHERE class_name=$1 OR class_name IS NULL';
        params = [userClass];
      }
    }
    query += ' ORDER BY created_at DESC LIMIT 200';
    const result = await pool.query(query, params);
    res.json({ announcements: result.rows });
  } catch (err) {
    console.error('LIST ANN ERROR', err);
    res.status(500).json({ error: 'Erreur serveur', details: err.message });
  }
};

// Polls (options stored as JSONB [{opt:string, votes:int}])
exports.createPoll = async (req, res) => {
  const { question, options } = req.body; // options: array of strings
  if (!question || !Array.isArray(options) || options.length < 2) return res.status(400).json({ error: 'question and at least 2 options required' });
  try {
    const opts = options.map(o=>({ opt: o, votes: 0 }));
    const result = await pool.query('INSERT INTO polls (question, options, total_votes, created_at) VALUES ($1,$2,$3,NOW()) RETURNING *', [question, JSON.stringify(opts), 0]);
    res.status(201).json({ poll: result.rows[0] });
  } catch (err) {
    console.error('CREATE POLL ERROR', err);
    res.status(500).json({ error: 'Erreur serveur', details: err.message });
  }
};

exports.listPolls = async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM polls ORDER BY created_at DESC LIMIT 200');
    res.json({ polls: result.rows });
  } catch (err) {
    console.error('LIST POLL ERROR', err);
    res.status(500).json({ error: 'Erreur serveur', details: err.message });
  }
};

exports.votePoll = async (req, res) => {
  const { id } = req.params;
  const { optionIndex } = req.body;
  if (typeof optionIndex !== 'number') return res.status(400).json({ error: 'optionIndex required' });
  try {
    // Fetch poll
    const r = await pool.query('SELECT * FROM polls WHERE id=$1', [id]);
    const poll = r.rows[0];
    if (!poll) return res.status(404).json({ error: 'Poll not found' });
    const opts = poll.options; // parsed by pg as object
    if (!Array.isArray(opts) || !opts[optionIndex]) return res.status(400).json({ error: 'Invalid option' });
    opts[optionIndex].votes = (opts[optionIndex].votes || 0) + 1;
    const total = (poll.total_votes || 0) + 1;
    const upd = await pool.query('UPDATE polls SET options=$1, total_votes=$2 WHERE id=$3 RETURNING *', [JSON.stringify(opts), total, id]);
    res.json({ poll: upd.rows[0] });
  } catch (err) {
    console.error('VOTE POLL ERROR', err);
    res.status(500).json({ error: 'Erreur serveur', details: err.message });
  }
};

// Ressources pour enseignants
exports.createResource = async (req, res) => {
  const { title, url, description } = req.body;
  if (!title || !url) return res.status(400).json({ error: 'title and url required' });
  try {
    const result = await pool.query(
      'INSERT INTO docs (title, url, description, uploader, created_at) VALUES ($1,$2,$3,$4,NOW()) RETURNING *',
      [title, url, description || null, req.user.id]
    );
    res.status(201).json({ resource: result.rows[0] });
  } catch (err) {
    console.error('CREATE RESOURCE ERROR', err);
    res.status(500).json({ error: 'Erreur serveur', details: err.message });
  }
};

// Infos de classe pour enseignants
exports.createClassInfo = async (req, res) => {
  const { title, content, class_name } = req.body;
  if (!title || !content) return res.status(400).json({ error: 'title and content required' });
  try {
    const result = await pool.query(
      'INSERT INTO announcements (title, content, author, created_at) VALUES ($1,$2,$3,NOW()) RETURNING *',
      [title, content, class_name || 'Classe']
    );
    res.status(201).json({ classInfo: result.rows[0] });
  } catch (err) {
    console.error('CREATE CLASS INFO ERROR', err);
    res.status(500).json({ error: 'Erreur serveur', details: err.message });
  }
};
