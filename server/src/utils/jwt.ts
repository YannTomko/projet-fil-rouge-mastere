import jwt from "jsonwebtoken";

if (!process.env.JWT_SECRET) {
  throw new Error("JWT_SECRET is missing from environment variables.");
}

const JWT_SECRET = process.env.JWT_SECRET;

// Générer l'access token (valable par ex. 15 minutes)
export const generateAccessToken = (user: { id: number }) => {
  return jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: "5m" });
};

// Générer le refresh token (valable par ex. 7 jours)
export const generateRefreshToken = (user: { id: number }) => {
  return jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: "1h" });
};

// Vérifier un token et renvoyer le payload décodé
export const verifyToken = (token: string) => {
  return jwt.verify(token, JWT_SECRET);
};

