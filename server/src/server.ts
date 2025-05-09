import { prisma } from "./prisma";
import app from "./app";

const port = 3001;

app.listen(port, () => {
  console.log(`Serveur Express démarré sur http://localhost:${port}`);
});
