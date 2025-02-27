const db = require('../database');
const { promisify } = require('util');
const Statistic = require("../models/statistic");

// Conversion des méthodes de base de données en Promises
const dbAll = promisify(db.all).bind(db);
const dbGet = promisify(db.get).bind(db);

// Middleware de gestion d'erreurs
const handleError = (res, error) => {
    console.error('Database Error:', error);
    res.status(500).json({
        error: 'Erreur lors du traitement des statistiques',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
};

export const getAllStatistics = async (req, res) => {
    try {
        const { file_id } = req.params;

        // Validation de l'input
        if (!file_id || !Number.isInteger(parseInt(file_id))) {
            return res.status(400).json({ error: 'ID de fichier invalide' });
        }

        // Exécution des requêtes en parallèle
        const [stats, lastAccess, nb24h, nbWeek, nbTotal] = await Promise.all([
            dbAll(`SELECT * FROM statistics WHERE file_id = ?`, [file_id]),
            dbGet(`SELECT MAX(last_access_date_time) as last_access FROM statistics WHERE file_id = ?`, [file_id]),
            dbGet(`SELECT COUNT(*) as count FROM statistics WHERE file_id = ? AND last_access_date_time > datetime('now', '-1 day')`, [file_id]),
            dbGet(`SELECT COUNT(*) as count FROM statistics WHERE file_id = ? AND last_access_date_time > datetime('now', '-7 day')`, [file_id]),
            dbGet(`SELECT COUNT(*) as count FROM statistics WHERE file_id = ?`, [file_id])
        ]);

        // Vérification des résultats
        if (!stats || stats.length === 0) {
            return res.status(404).json({ error: 'Aucune statistique trouvée pour ce fichier' });
        }

        // Validation des nombres
        const validateNumber = (value, fieldName) => {
            const num = parseInt(value?.count || value);
            if (isNaN(num)) throw new Error(`Valeur numérique invalide pour ${fieldName}`);
            return num;
        };

        // Création de l'objet Statistic avec vérification des types
        const statistics = new Statistic(
            parseInt(file_id),
            validateNumber(nb24h, 'nb_access_last_24h'),
            validateNumber(nbWeek, 'nb_access_last_week'),
            validateNumber(nbTotal, 'nb_access_total'),
            lastAccess.last_access || null
        );

        // En-têtes de cache
        res.setHeader('Cache-Control', 'no-cache');
        res.setHeader('ETag', `W/"${Date.now()}"`);

        res.json({ statistics });

    } catch (error) {
        handleError(res, error);
    }
};

// service d'ajout de statistique
export const addStatistic = async (req, res) => {
    try {
        const { file_id } = req.params;

        // Validation de l'input
        if (!file_id || !Number.isInteger(parseInt(file_id))) {
            return res.status(400).json({ error: 'ID de fichier invalide' });
        }

        // Création de la statistique
        const query = `INSERT INTO statistics (file_id) VALUES (?)`;
        await db.run(query, [file_id]);

        res.json({ message: 'Statistique ajoutée avec succès' });

    } catch (error) {
        handleError(res, error);
    }
};