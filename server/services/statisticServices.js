const db = require('../database.js');
const Statistic = require('../models/statistic.js');

// Wrappers manuels pour les méthodes de base de données
const dbAll = (query, params) => {
    return new Promise((resolve, reject) => {
        db.all(query, params, (err, rows) => {
            if (err) reject(err);
            else resolve(rows);
        });
    });
};

const dbGet = (query, params) => {
    return new Promise((resolve, reject) => {
        db.get(query, params, (err, row) => {
            if (err) reject(err);
            else resolve(row);
        });
    });
};

const dbRun = (query, params) => {
    return new Promise((resolve, reject) => {
        db.run(query, params, function(err) {
            if (err) reject(err);
            else resolve(this); // 'this' contient les infos de la dernière opération
        });
    });
};

// Middleware de gestion d'erreurs (inchangé)
const handleError = (res, error) => {
    console.error('Database Error:', error);
    res.status(500).json({
        error: 'Erreur lors du traitement des statistiques',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
};

const getStatistics = async (req, res) => {
    try {
        const { file_id } = req.params;

        if (!file_id || !Number.isInteger(parseInt(file_id))) {
            return res.status(400).json({ error: 'ID de fichier invalide' });
        }

        // Exécution des requêtes avec les nouveaux wrappers
        const [stats, lastAccess, nb24h, nbWeek, nbTotal] = await Promise.all([
            dbAll(`SELECT * FROM statistics WHERE file_id = ?`, [file_id]),
            dbGet(`SELECT MAX(last_access_date_time) as last_access FROM statistics WHERE file_id = ?`, [file_id]),
            dbGet(`SELECT COUNT(*) as count FROM statistics WHERE file_id = ? AND last_access_date_time > datetime('now', '-1 day')`, [file_id]),
            dbGet(`SELECT COUNT(*) as count FROM statistics WHERE file_id = ? AND last_access_date_time > datetime('now', '-7 day')`, [file_id]),
            dbGet(`SELECT COUNT(*) as count FROM statistics WHERE file_id = ?`, [file_id])
        ]);

        if (!stats || stats.length === 0) {
            return res.status(404).json({ error: 'Aucune statistique trouvée pour ce fichier' });
        }

        const validateNumber = (value, fieldName) => {
            const num = parseInt(value?.count || value);
            if (isNaN(num)) throw new Error(`Valeur numérique invalide pour ${fieldName}`);
            return num;
        };

        const statistics = new Statistic(
            parseInt(file_id),
            validateNumber(nb24h, 'nb_access_last_24h'),
            validateNumber(nbWeek, 'nb_access_last_week'),
            validateNumber(nbTotal, 'nb_access_total'),
            lastAccess.last_access || null
        );

        res.setHeader('Cache-Control', 'no-cache');
        res.setHeader('ETag', `W/"${Date.now()}"`);

        res.json({ statistics });

    } catch (error) {
        handleError(res, error);
    }
};

const addStatistic = (file_id) => {
    try {
        if (!file_id || !Number.isInteger(parseInt(file_id))) {
           console.error('ID de fichier invalide');
        }

        dbRun(`INSERT INTO statistics (file_id, last_access_date_time) VALUES (?, datetime('now'))`, [file_id]);
        console.log('Statistique ajoutée avec succès');
    } catch (error) {
        console.error('Erreur lors de l\'ajout de la statistique', error);
    }
};

module.exports = { getStatistics, addStatistic };
