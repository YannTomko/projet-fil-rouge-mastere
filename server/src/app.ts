import express from "express";
import cors from "cors";
import authRoutes from "./routes/authRoutes";
import filesRoutes from "./routes/filesRoutes";
import 'dotenv/config';

const app = express();

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

export default app;
