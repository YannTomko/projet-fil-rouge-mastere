import { Request, Response } from "express";
import { loginUserService, registerUserService } from "../services/authServices";
import { generateAccessToken, generateRefreshToken, verifyToken } from "../utils/jwt";


// Register
export const registerUserController = async (req: Request, res: Response): Promise<void> => {
  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    res.status(400).json({ error: "Username, email et password sont requis" });
    return;
  }

  try {
    const user = await registerUserService(username, email, password);
    res.status(201).json({ message: "Utilisateur enregistré", userId: user.id });
  } catch (err: any) {
    if (err.message === "USERNAME_OR_EMAIL_TAKEN") {
      res.status(400).json({ error: "Nom d'utilisateur ou email déjà utilisé" });
    } else {
      res.status(500).json({ error: "Erreur serveur lors de l'inscription" });
    }
  }
};

// Login
export const loginUserController = async (req: Request, res: Response): Promise<void> => {
  const { username, password } = req.body;

  if (!username || !password) {
    res.status(400).json({ error: "Username et password sont requis" });
    return;
  }

  await new Promise(resolve => setTimeout(resolve, 1000));

  try {
    const user = await loginUserService(username, password);
    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);
    res.json({ message: "Connexion réussie", user, accessToken, refreshToken });
  } catch (err: any) {
    if (err.message === "INVALID_CREDENTIALS") {
      res.status(400).json({ error: "Identifiants invalides" });
    } else {
      res.status(500).json({ error: "Erreur serveur lors de la connexion" });
    }
  }
};

// Génère un nouveau access token
export const refreshTokenController = async (req: Request, res: Response): Promise<void> => {
  const rawRefreshToken = req.body.refreshToken;
  
  if (!rawRefreshToken) {
    res.status(400).json({ error: "Refresh token manquant" });
    return;
  }

  const refreshToken = rawRefreshToken.replace(/^"(.*)"$/, '$1');
  
  try {
    const decoded = verifyToken(refreshToken) as { id: number };
    const newAccessToken = generateAccessToken({ id: decoded.id });
    
    res.json({ accessToken: newAccessToken });
  } catch (error: any) {
    res.status(401).json({ error: "Refresh token invalide" });
  }
};
