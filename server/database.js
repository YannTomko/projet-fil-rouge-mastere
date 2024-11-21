const sqlite3 = require('sqlite3').verbose();

const db = new sqlite3.Database(':memory:', (err) => {
    if (err) {
        console.error('Erreur lors de l\'ouverture de la base de données', err.message);
    } else {
        console.log('Connexion à la base de données SQLite réussie.');
        // Créer une table Users
        db.run(`CREATE TABLE users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE,
            email TEXT UNIQUE,
            password TEXT
        )`);
        db.run(`CREATE TABLE files (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT,
            path TEXT,
            owner TEXT,
            size INTEGER,
            created DATETIME DEFAULT CURRENT_TIMESTAMP
        )`);
    }
});

module.exports = db;