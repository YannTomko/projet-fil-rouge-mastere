import { Request, Response } from "express";
import { prisma } from "../prisma";
import { Statistic } from "../models/statistic"; // garde ce type si tu veux, ou adapte-le

// Récupérer les statistiques d'un fichier
export const getStatistics = async (req: Request, res: Response): Promise<void> => {
    try {
        const { file_id } = req.params;
        const parsedFileId = parseInt(file_id, 10);

        if (!parsedFileId || isNaN(parsedFileId)) {
            res.status(400).json({ error: "ID de fichier invalide" });
            return;
        }

        const [stats, lastAccessRow, nb24hCount, nbWeekCount, nbTotalCount] = await Promise.all([
            prisma.statistics.findMany({
                where: { file_id: parsedFileId },
            }),
            prisma.statistics.aggregate({
                _max: {
                    last_access_date_time: true,
                },
                where: { file_id: parsedFileId },
            }),
            prisma.statistics.count({
                where: {
                    file_id: parsedFileId,
                    last_access_date_time: {
                        gt: new Date(Date.now() - 24 * 60 * 60 * 1000),
                    },
                },
            }),
            prisma.statistics.count({
                where: {
                    file_id: parsedFileId,
                    last_access_date_time: {
                        gt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
                    },
                },
            }),
            prisma.statistics.count({
                where: { file_id: parsedFileId },
            }),
        ]);

        if (stats.length === 0) {
            res.status(204).json({ error: "Aucune statistique trouvée pour ce fichier" });
            return;
        }

        const statistics: Statistic = {
            file_id: parsedFileId,
            nb_access_last_24h: nb24hCount,
            nb_access_last_week: nbWeekCount,
            nb_access_total: nbTotalCount,
            last_access_date_time: lastAccessRow._max.last_access_date_time ?? null,
        };

        res.setHeader("Cache-Control", "no-cache");
        res.setHeader("ETag", `W/"${Date.now()}"`);
        res.json({ statistics });
    } catch (error) {
        console.error("Erreur serveur (getStatistics):", error);
        res.status(500).json({ error: "Erreur lors du traitement des statistiques" });
    }
};

// Ajouter une statistique d'accès à un fichier
export const addStatistic = async (file_id: string): Promise<void> => {
    try {
        const parsedFileId = parseInt(file_id, 10);
        if (!parsedFileId || isNaN(parsedFileId)) {
            console.error("ID de fichier invalide :", file_id);
            return;
        }

        await prisma.statistics.create({
            data: {
                file_id: parsedFileId,
                last_access_date_time: new Date(),
            },
        });

        console.log("Statistique ajoutée avec succès");
    } catch (error) {
        console.error("Erreur lors de l'ajout de la statistique :", error);
    }
};
