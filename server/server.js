const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/authRoutes');
const filesRoutes = require('./routes/filesRoutes');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/files', filesRoutes);
const port = 3001;

app.listen(port, () => {
    console.log(`Serveur Express démarré sur http://localhost:${port}`);
});
