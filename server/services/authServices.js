const db = require('../database');

const registerUser = (req, res) => {
    const { username, email, password } = req.body;
    if (!username || !password || !email) {
        return res.status(400).json({ error: 'Username, email et password sont requis' });
    }

    const query = `INSERT INTO users (username, email, password) VALUES (?, ?, ?)`;
    db.run(query, [username, email, password], function (err) {
        if (err) {
            return res.status(400).json({ error: 'Erreur lors de l\'inscription ou utilisateur déjà existant' });
        }
        res.status(201).json({ message: 'Utilisateur enregistré', userId: this.lastID });
    });
};

const loginUser = (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) {
        return res.status(400).json({ error: 'Username et password sont requis' });
    }

    const query = `SELECT * FROM users WHERE username = ? AND password = ?`;
    db.get(query, [username, password], (err, row) => {
        if (err) {
            return res.status(500).json({ error: 'Erreur serveur' });
        }
        if (!row) {
            return res.status(401).json({ error: 'Identifiants invalides' });
        }
        res.json({ message: 'Connexion réussie', user: { id: row.id, username: row.username } });
    });
};

const getAllUsers = (req, res) => {
    const query = `SELECT * FROM users`;
    db.all(query, (err, rows) => {
        if (err) {
            return res.status(500).json({ error: 'Erreur serveur' });
        }
        res.json({ users: rows });
    });
};

const deleteAllUsers = (req, res) => {
    const query = `DELETE FROM users`;
    db.run(query, function(err) {
        if (err) {
            return res.status(500).json({ error: 'Erreur serveur' });
        }
        res.json({ message: `Tous les utilisateurs ont été supprimés. Nombre de lignes supprimées : ${this.changes}` });
    });
};

module.exports = {
    registerUser,
    loginUser,
    getAllUsers,
    deleteAllUsers
};
