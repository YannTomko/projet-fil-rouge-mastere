import { prisma } from './prisma';
import express from "express";
import cors from "cors";

import authRoutes from "./routes/authRoutes";
import filesRoutes from "./routes/filesRoutes";


const app = express();
const port = 3001;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use((req, res, next) => {
  const start = Date.now();

  res.on("finish", () => {
    const duration = Date.now() - start;
    console.log(`${req.method} ${req.originalUrl} => ${res.statusCode} (${duration} ms)`);
  });

  next();
});

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/files", filesRoutes);

// Démarrage du serveur
app.listen(port, () => {
  console.log(`Serveur Express démarré sur http://localhost:${port}`);
});
