import { Request, Response } from "express";
import { prisma } from "../prisma"; // ton fichier prisma.ts

// Enregistrement d'un utilisateur
export const registerUser = async (req: Request, res: Response): Promise<void> => {
    const { username, email, password } = req.body;

    if (!username || !password || !email) {
        res.status(400).json({ error: "Username, email et password sont requis" });
        return;
    }

    try {
        const existingUser = await prisma.users.findFirst({
            where: {
                OR: [
                    { username: username },
                    { email: email }
                ]
            },
        });

        if (existingUser) {
            res.status(400).json({ error: "Nom d'utilisateur ou email déjà utilisé" });
            return;
        }

        const newUser = await prisma.users.create({
            data: {
                username,
                email,
                password,
            },
        });

        res.status(201).json({ message: "Utilisateur enregistré", userId: newUser.id });
    } catch (err) {
        console.error("Erreur serveur (registerUser):", err);
        res.status(500).json({ error: "Erreur serveur lors de l'inscription" });
    }
};

// Connexion d'un utilisateur
export const loginUser = async (req: Request, res: Response): Promise<void> => {
    const { username, password } = req.body;

    if (!username || !password) {
        res.status(400).json({ error: "Username et password sont requis" });
        return;
    }

    try {
        const user = await prisma.users.findFirst({
            where: {
                username,
                password,
            },
            select: {
                id: true,
                username: true,
            },
        });

        if (!user) {
            res.status(401).json({ error: "Identifiants invalides" });
            return;
        }

        res.json({ message: "Connexion réussie", user });
    } catch (err) {
        console.error("Erreur serveur (loginUser):", err);
        res.status(500).json({ error: "Erreur serveur" });
    }
};

// Récupération de tous les utilisateurs
export const getAllUsers = async (req: Request, res: Response): Promise<void> => {
    try {
        const users = await prisma.users.findMany({
            select: {
                id: true,
                username: true,
                email: true,
            },
        });
        res.json({ users });
    } catch (err) {
        console.error("Erreur serveur (getAllUsers):", err);
        res.status(500).json({ error: "Erreur serveur" });
    }
};

// Suppression de tous les utilisateurs
export const deleteAllUsers = async (req: Request, res: Response): Promise<void> => {
    try {
        const deleted = await prisma.users.deleteMany();
        res.json({
            message: `Tous les utilisateurs ont été supprimés. Nombre de lignes supprimées : ${deleted.count}`,
        });
    } catch (err) {
        console.error("Erreur serveur (deleteAllUsers):", err);
        res.status(500).json({ error: "Erreur serveur" });
    }
};
