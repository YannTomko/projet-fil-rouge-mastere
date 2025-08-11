import express from "express";
import cors from "cors";
import authRoutes from "./routes/authRoutes";
import filesRoutes from "./routes/filesRoutes";

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use((req, res, next) => {
  const start = Date.now();
  res.on("finish", () => {
    const duration = Date.now() - start;
    console.log(`${req.method} ${req.originalUrl} => ${res.statusCode} (${duration} ms)`);
    console.log("ff")
  });
  next();
});


app.use("/api/auth", authRoutes);
app.use("/api/files", filesRoutes);

export default app;
