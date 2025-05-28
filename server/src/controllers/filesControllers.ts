import { Request, Response } from "express";

import path from "path";
import { accessFileService, deleteFileService, getFileByIdService, getFileInfoService, getUserFilesService, uploadFileService } from "../services/filesServices";

export const uploadFileController = async (req: Request, res: Response): Promise<void> => {
  if (!req.file) {
    res.status(400).json({ error: "Aucun fichier téléchargé" });
    return;
  }
  const userId = req.user.id;
  const size = req.body.size;

  if (!userId) {
    res.status(400).json({ error: "ID utilisateur manquant" });
    return;
  }

  try {
    const file = await uploadFileService(req.file, userId, size);
    res.status(201).json({ message: "Fichier ajouté avec succès", fileId: file.id });
  } catch (err) {
    res.status(500).json({ error: "Erreur lors de l'ajout du fichier" });
  }
};

export const deleteFileController = async (req: Request, res: Response): Promise<void> => {
  const userId = req.user.id
  const fileId = parseInt(req.params.id, 10);
  
  try {
    const fileInfo = await getFileInfoService(fileId);

    if (!fileInfo) {
      res.status(404).json({ error: "Fichier non trouvé" });
      return;
    }

    if (fileInfo?.owner_id != userId) {
      res.status(403).json({ error: "Accès au fichier non autorisé" });
      return;
    }

    const result = await deleteFileService(fileId);
    if (!result) {
      res.status(404).json({ error: "Fichier non trouvé" });
      return;
    }

    res.json({ message: "Fichier supprimé (métadonnées supprimées aussi)" });
  } catch (err) {
    res.status(500).json({ error: "Erreur lors de la suppression" });
  }
};

export const getUserFilesController = async (req: Request, res: Response): Promise<void> => {
  const userId = (req.user as any)?.id;

  if (!userId) {
    res.status(400).json({ error: "ID utilisateur manquant" });
    return;
  }

  try {
    const files = await getUserFilesService(userId);
    res.status(200).json({ files });
  } catch (err) {
    res.status(500).json({ error: "Erreur lors de la récupération des fichiers" });
  }
};

export const getFileController = async (req: Request, res: Response): Promise<void> => {
  const fileId = parseInt(req.params.id, 10);
  const userId = req.user.id

  try {
    const file = await getFileByIdService(fileId);

    if (!file) {
      res.status(404).json({ error: "Fichier non trouvé" });
      return;
    }

    if (file.owner_id != userId) {
      res.status(403).json({ error: "Accès au fichier non autorisé" });
      return;
    }

    const filePath = path.resolve(file.path);
    await accessFileService(filePath);

    res.download(filePath, file.name, (downloadErr) => {
      if (downloadErr) {
        res.status(500).json({ error: "Erreur lors du téléchargement du fichier" });
      }
    });
  } catch (err) {
    res.status(500).json({ error: "Erreur lors de la récupération du fichier" });
  }
};

export const getFileInfoController = async (req: Request, res: Response): Promise<void> => {
  const id = parseInt(req.params.id, 10);
  const userId = req.user.id

  try {
    const fileInfo = await getFileInfoService(id);

    if (!fileInfo) {
      res.status(404).json({ error: "Fichier non trouvé" });
      return;
    }

    if (fileInfo?.owner_id != userId) {
      res.status(403).json({ error: "Accès au fichier non autorisé" });
      return;
    }

    res.status(200).json(fileInfo);
  } catch (err) {
    res.status(500).json({ error: "Erreur lors de la récupération des informations du fichier" });
  }
};
