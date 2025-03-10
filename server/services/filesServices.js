const path = require('path');
const fs = require('fs');
const db = require('../database');
const {addStatistic} = require("./statisticServices");

// Pour ajouter un fichier
const uploadFile = (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: 'Aucun fichier téléchargé' });
    }

    // Enregistrer les métadonnées dans la base de données si nécessaire
    const filePath = req.file.path;
    const fileName = req.file.originalname;
    const owner = req.body.owner;
    const size = parseInt(req.body.size, 10);

    const query = `INSERT INTO files (name, path, owner, size) VALUES (?, ?, ?, ?)`;
    db.run(query, [fileName, filePath, owner, size], function (err) {
        if (err) {
            return res.status(500).json({ error: 'Erreur lors de l\'ajout du fichier' });
        }
        res.status(201).json({ message: 'Fichier ajouté avec succès', fileId: this.lastID });
    });
};

// Pour supprimer un fichier
const deleteFile = (req, res) => {
    const { id } = req.params;

    // Récupérer le chemin du fichier à partir de la base de données
    const query = `SELECT path FROM files WHERE id = ?`;
    db.get(query, [id], (err, row) => {
        if (err) {
            return res.status(500).json({ error: 'Erreur lors de la récupération du fichier' });
        }

        if (!row) {
            return res.status(404).json({ error: 'Fichier non trouvé' });
        }

        // Supprimer le fichier du système de fichiers
        fs.unlink(row.path, (err) => {
            if (err) {
                return res.status(500).json({ error: 'Erreur lors de la suppression du fichier' });
            }

            // Supprimer les métadonnées du fichier dans la base de données
            const deleteQuery = `DELETE FROM files WHERE id = ?`;
            db.run(deleteQuery, [id], function (err) {
                if (err) {
                    return res.status(500).json({ error: 'Erreur lors de la suppression des métadonnées du fichier' });
                }
                res.json({ message: 'Fichier supprimé avec succès' });
            });
        });
    });
};

const getAllFiles = (req, res) => {
    const query = `SELECT * FROM files`;
    db.all(query, (err, rows) => {
        if (err) {
            return res.status(500).json({ error: 'Erreur serveur' });
        }
        res.json({ files: rows });
    });
};

const getFile = (req, res) => {
    const { id } = req.params;
    // get user in header
    const user = req.headers.user;
    const user_id = user ? JSON.parse(user).id : null;

    const query = `SELECT name, path, owner, size, created FROM files WHERE id = ?`;
    db.get(query, [id], (err, row) => {
        if (err) {
            return res.status(500).json({ error: 'Erreur lors de la récupération du fichier' });
        }

        if (!row) {
            return res.status(404).json({ error: 'Fichier non trouvé' });
        }

        const filePath = path.resolve(row.path);

        fs.access(filePath, fs.constants.F_OK, (err) => {
            if (err) {
                return res.status(404).json({ error: 'Fichier introuvable sur le serveur' });
            }

            res.download(filePath, row.name, (err) => {
                if (err) {
                    return res.status(500).json({ error: 'Erreur lors du téléchargement du fichier' });
                }
                if (!user_id && row.owner !== user_id) {
                    // Add statistic
                    addStatistic(id);
                }
            });
        });
    });
};

const getFileInfo = (req, res) => {
    const { id } = req.params;

    const query = `SELECT name, path, owner, size, created FROM files WHERE id = ?`;
    db.get(query, [id], (err, row) => {
        if (err) {
            return res.status(500).json({ error: 'Erreur lors de la récupération des informations du fichier' });
        }

        if (!row) {
            return res.status(404).json({ error: 'Fichier non trouvé' });
        }

        // Renvoie uniquement les métadonnées du fichier
        res.status(200).json({
            name: row.name,
            owner: row.owner,
            size: row.size,
            created: row.created,
        });
    });
};

module.exports = {
    uploadFile,
    deleteFile,
    getAllFiles,
    getFile,
    getFileInfo
};
