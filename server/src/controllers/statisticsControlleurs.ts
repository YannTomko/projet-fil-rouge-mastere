import { Request, Response } from "express";

import { Statistic } from "../models/statistic";
import { addStatisticService, getStatisticsService } from "../services/statisticsServices";

export const getStatisticsController = async (req: Request, res: Response): Promise<void> => {
  const { file_id } = req.params;
  const parsedFileId = parseInt(file_id, 10);

  if (!parsedFileId || isNaN(parsedFileId)) {
    res.status(400).json({ error: "ID de fichier invalide" });
    return;
  }

  try {
    const statistics: Statistic | null = await getStatisticsService(parsedFileId);

    if (!statistics) {
      res.status(204).json({ error: "Aucune statistique trouvée pour ce fichier" });
      return;
    }

    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("ETag", `W/"${Date.now()}"`);
    res.json({ statistics });
  } catch (error) {
    console.error("Erreur serveur (getStatisticsController):", error);
    res.status(500).json({ error: "Erreur lors du traitement des statistiques" });
  }
};

// Fonction utilisée en interne sans endpoint
export const addStatisticController = async (file_id: number): Promise<void> => {
  if (!file_id || isNaN(file_id)) {
    console.error("ID de fichier invalide :", file_id);
    return;
  }

  try {
    await addStatisticService(file_id);
  } catch (error) {
    console.error("Erreur lors de l'ajout de la statistique :", error);
  }
};
