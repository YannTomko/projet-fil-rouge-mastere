import jwt from "jsonwebtoken";

if (!process.env.JWT_SECRET) {
  throw new Error("JWT_SECRET is missing from environment variables.");
}

const JWT_SECRET = process.env.JWT_SECRET;

// Générer l'access token
export const generateAccessToken = (user: { id: number }) => {
  return jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: "5m" });
};

// Générer le refresh token
export const generateRefreshToken = (user: { id: number }) => {
  return jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: "1h" });
};

// Vérifier un token
export const verifyToken = (token: string) => {
  return jwt.verify(token, JWT_SECRET);
};

