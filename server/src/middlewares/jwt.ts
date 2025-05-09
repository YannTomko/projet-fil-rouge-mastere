import { Request, Response, NextFunction } from "express";
import { generateAccessToken, verifyToken } from "../utils/jwt";

export const authMiddleware = (
    req: Request,
    res: Response,
    next: NextFunction
): void => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        res.status(401).json({ error: "Access token manquant" });
        return;
    }

    const rawAccessToken = authHeader.split(" ")[1];
    const accessToken = rawAccessToken.replace(/^"(.*)"$/, '$1');

    try {
        const decoded = verifyToken(accessToken) as { id: number };
        req.user = decoded;
        next();
        return;
    } catch (error: any) {
        if (error.name === "TokenExpiredError") {
            const rawRefreshToken = req.headers["x-refresh-token"];
            if (!rawRefreshToken || typeof rawRefreshToken !== "string") {
                res.status(401).json({ error: "Refresh token manquant" });
                return;
            }
            const refreshToken = rawRefreshToken.replace(/^"(.*)"$/, '$1');
            try {
                const decodedRefresh = verifyToken(refreshToken) as { id: number };
                const newAccessToken = generateAccessToken({ id: decodedRefresh.id });
                res.setHeader("x-access-token", newAccessToken);
                req.user = verifyToken(newAccessToken) as { id: number };
                next();
                return;
            } catch (refreshError) {
                res.status(401).json({ error: "Refresh token invalide" });
                return;
            }
        }
        res.status(401).json({ error: "Token invalide" });
        return;
    }
};
