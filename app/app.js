require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const path = require('path');

const userRoute = require('./routes/user');
const sauceRoute = require('./routes/sauce');

const app = express();

// Connection à la BDD
mongoose.connect(`mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_URL}`, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
    .then(() => console.log('Connexion à MongoDB réussie !'))
    .catch(() => console.log('Connexion à MongoDB échouée'));

// Header CORS sur l'objet réponse
app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content, Accept, Content-Type, Authorization');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
    next();
});

// Transforme la requête en JSON
app.use(bodyParser.json());

// Autorise à l'application à se servir de fichier statiques dans le dossier images
app.use('/images', express.static(path.join(__dirname, 'images')));

// Route
app.use('/api/auth', userRoute);
app.use('/api/sauces', sauceRoute);

module.exports = app;
