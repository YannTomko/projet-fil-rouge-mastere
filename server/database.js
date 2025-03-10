const sqlite3 = require('sqlite3').verbose();

const db = new sqlite3.Database(':memory:', (err) => {
    if (err) {
        console.error('Erreur lors de l\'ouverture de la base de données', err.message);
    } else {
        console.log('Connexion à la base de données SQLite réussie.');
        // Créer une table Users
        try {
            db.run(`CREATE TABLE users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                username TEXT UNIQUE,
                email TEXT UNIQUE,
                password TEXT
            )`);
            console.log('Table Users créée avec succès.');
        } catch (error) {
            console.log(error);
        }
        try {
            db.run(`CREATE TABLE files (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT,
                path TEXT,
                owner TEXT,
                size INTEGER,
                created DATETIME DEFAULT CURRENT_TIMESTAMP
            )`);
            console.log('Table Files créée avec succès.');
        } catch (error) {
            console.log(error);
        }
        try {
            db.run(`
                CREATE TABLE IF NOT EXISTS statistics (
                  id INTEGER PRIMARY KEY AUTOINCREMENT,
                  file_id INTEGER NOT NULL,
                  last_access_date_time DATETIME DEFAULT CURRENT_TIMESTAMP,
                  FOREIGN KEY (file_id) REFERENCES files(id)
                );
            `);
            console.log('Table Statistics créée avec succès.');
        } catch (error) {
            console.log(error);
        }
    }
});

module.exports = db;