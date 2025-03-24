import { Request, Response } from "express";
import fs from "fs";
import path from "path";
import { prisma } from "../prisma";
import { addStatistic } from "./statisticServices";

// Ajouter un fichier
export const uploadFile = async (req: Request, res: Response): Promise<void> => {
    if (!req.file) {
        res.status(400).json({ error: "Aucun fichier téléchargé" });
        return;
    }

    const file = req.file;
    const filePath = file.path;
    const fileName = file.originalname;
    const { owner, size } = req.body as { owner: string; size: string };

    try {
        const newFile = await prisma.files.create({
            data: {
                name: fileName,
                path: filePath,
                owner,
                size: parseInt(size, 10),
            },
        });
        res.status(201).json({ message: "Fichier ajouté avec succès", fileId: newFile.id });
    } catch (err) {
        console.error("Erreur serveur (uploadFile) :", err);
        res.status(500).json({ error: "Erreur lors de l'ajout du fichier" });
    }
};

// Supprimer un fichier
export const deleteFile = async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;

    try {
        const file = await prisma.files.findUnique({ where: { id: parseInt(id, 10) } });

        if (!file) {
            res.status(404).json({ error: "Fichier non trouvé" });
            return;
        }

        fs.unlink(file.path, async (unlinkErr) => {
            if (unlinkErr) {
                console.error("Erreur unlink (deleteFile) :", unlinkErr);
                res.status(500).json({ error: "Erreur lors de la suppression du fichier" });
                return;
            }

            try {
                await prisma.files.delete({ where: { id: file.id } });
                res.json({ message: "Fichier supprimé avec succès" });
            } catch (deleteErr) {
                console.error("Erreur Prisma (deleteFile) :", deleteErr);
                res.status(500).json({ error: "Erreur lors de la suppression des métadonnées" });
            }
        });
    } catch (err) {
        console.error("Erreur Prisma (deleteFile) :", err);
        res.status(500).json({ error: "Erreur lors de la suppression" });
    }
};

// Récupérer tous les fichiers
export const getAllFiles = async (_req: Request, res: Response): Promise<void> => {
    try {
        const files = await prisma.files.findMany({
            select: {
                id: true,
                name: true,
                owner: true,
                size: true,
                created: true,
            },
        });
        res.json({ files });
    } catch (err) {
        console.error("Erreur serveur (getAllFiles) :", err);
        res.status(500).json({ error: "Erreur lors de la récupération de tous les fichiers" });
    }
};

// Télécharger un fichier
export const getFile = async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    const rawUser = req.headers.user;
    const user = typeof rawUser === "string" ? JSON.parse(rawUser) : null;
    const username = user?.username;

    try {
        const file = await prisma.files.findUnique({
            where: { id: parseInt(id, 10) },
        });

        if (!file) {
            res.status(404).json({ error: "Fichier non trouvé" });
            return;
        }

        const filePath = path.resolve(file.path);
        fs.access(filePath, fs.constants.F_OK, (accessErr) => {
            if (accessErr) {
                console.error("Erreur accès fichier (getFile) :", accessErr);
                res.status(404).json({ error: "Fichier introuvable sur le serveur" });
                return;
            }

            res.download(filePath, file.name, (downloadErr) => {
                if (downloadErr) {
                    console.error("Erreur téléchargement (getFile) :", downloadErr);
                    res.status(500).json({ error: "Erreur lors du téléchargement du fichier" });
                    return;
                }
                if (!username || file.owner !== username) {
                    addStatistic(id); // conserve ta logique
                }
            });
        });
    } catch (err) {
        console.error("Erreur Prisma (getFile) :", err);
        res.status(500).json({ error: "Erreur lors de la récupération du fichier" });
    }
};

// Récupérer les infos d'un fichier
export const getFileInfo = async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;

    try {
        const file = await prisma.files.findUnique({
            where: { id: parseInt(id, 10) },
            select: {
                name: true,
                owner: true,
                size: true,
                created: true,
            },
        });

        if (!file) {
            res.status(404).json({ error: "Fichier non trouvé" });
            return;
        }

        res.status(200).json(file);
    } catch (err) {
        console.error("Erreur Prisma (getFileInfo) :", err);
        res.status(500).json({ error: "Erreur lors de la récupération des informations du fichier" });
    }
};
