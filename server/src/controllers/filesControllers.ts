import { Request, Response } from "express";

import path from "path";
import { accessFileService, deleteFileService, getFileByIdService, getFileInfoService, getUserFilesService, uploadFileService } from "../services/filesServices";
import { addStatisticController } from "./statisticsControlleurs";

export const uploadFileController = async (req: Request, res: Response): Promise<void> => {
  if (!req.file) {
    res.status(400).json({ error: "Aucun fichier téléchargé" });
    return;
  }

  const { owner, size } = req.body;
  try {
    const file = await uploadFileService(req.file, owner, size);
    res.status(201).json({ message: "Fichier ajouté avec succès", fileId: file.id });
  } catch (err) {
    console.error("Erreur serveur (uploadFileController) :", err);
    res.status(500).json({ error: "Erreur lors de l'ajout du fichier" });
  }
};

export const deleteFileController = async (req: Request, res: Response): Promise<void> => {
  const id = parseInt(req.params.id, 10);

  try {
    const result = await deleteFileService(id);
    if (!result) {
      res.status(404).json({ error: "Fichier non trouvé" });
      return;
    }

    res.json({ message: "Fichier supprimé (métadonnées supprimées aussi)" });
  } catch (err) {
    console.error("Erreur serveur (deleteFileController) :", err);
    res.status(500).json({ error: "Erreur lors de la suppression" });
  }
};

export const getUserFilesController = async (_req: Request, res: Response): Promise<void> => {
  console.log("tralala4");
  res.status(200).send("OK");
  return;
  try {
    const files = await getUserFilesService();
    res.json({ files });
  } catch (err) {
    console.error("Erreur serveur (getUserFilesController) :", err);
    res.status(500).json({ error: "Erreur lors de la récupération des fichiers" });
  }
};

export const getFileController = async (req: Request, res: Response): Promise<void> => {
  const id = parseInt(req.params.id, 10);
  const rawUser = req.headers.user;
  const user = typeof rawUser === "string" ? JSON.parse(rawUser) : null;
  const username = user?.username;

  try {
    const file = await getFileByIdService(id);
    if (!file) {
      res.status(404).json({ error: "Fichier non trouvé" });
      return;
    }

    const filePath = path.resolve(file.path);
    await accessFileService(filePath);

    res.download(filePath, file.name, (downloadErr) => {
      if (downloadErr) {
        console.error("Erreur téléchargement (getFileController) :", downloadErr);
        res.status(500).json({ error: "Erreur lors du téléchargement du fichier" });
        return;
      }
      if (!username || file.owner !== username) {
        addStatisticController(id);
      }
    });
  } catch (err) {
    console.error("Erreur serveur (getFileController) :", err);
    res.status(500).json({ error: "Erreur lors de la récupération du fichier" });
  }
};

export const getFileInfoController = async (req: Request, res: Response): Promise<void> => {
  const id = parseInt(req.params.id, 10);

  try {
    const fileInfo = await getFileInfoService(id);
    if (!fileInfo) {
      res.status(404).json({ error: "Fichier non trouvé" });
      return;
    }

    res.status(200).json(fileInfo);
  } catch (err) {
    console.error("Erreur serveur (getFileInfoController) :", err);
    res.status(500).json({ error: "Erreur lors de la récupération des informations du fichier" });
  }
};
