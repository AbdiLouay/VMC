const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const mysql = require('mysql');
const jwt = require('jsonwebtoken'); // Importez jsonwebtoken

const cors = require('cors');
const app = express();
const PORT = 3000;


// Activer CORS pour toutes les routes
app.use(cors());

app.use(bodyParser.json());
app.use(cookieParser());

// Configuration de la base de données
const db = mysql.createConnection({
    host: '192.168.65.227', // L'adresse IP ou le nom d'hôte de votre serveur
    user: 'chef',           // Votre utilisateur MySQL
    password: 'root',       // Votre mot de passe MySQL
    database: 'Connexion',  // Le nom de votre base de données
});


// Connecter à la base
db.connect(err => {
    if (err) {
        console.error('Erreur de connexion à la base de données :', err);
        process.exit(1);
    }
    console.log('Connecté à la base de données MySQL.');
});

// Exemple de requête HTTP vers un autre serveur sur le port 80 (par exemple PHPMyAdmin)
app.get('/api/external-data', async (req, res) => {
    try {
        // Exemple d'une requête vers un serveur sur le port 80 (ici phpMyAdmin)
        const response = await axios.get('http://192.168.65.227/phpmyadmin/');
        // Renvoi des données obtenues depuis le serveur externe.
        res.json(response.data);
    } catch (error) {
        console.error('Erreur lors de la requête vers le serveur externe:', error);
        res.status(500).json({ message: 'Erreur lors de la récupération des données externes' });
    }
});

// Route pour l'inscription
app.post('/api/register', (req, res) => {
    const { nom, motDePasse } = req.body;

    if (!nom || !motDePasse) {
        return res.status(400).json({ message: 'Nom et mot de passe sont requis.' });
    }

    const checkQuery = 'SELECT * FROM users WHERE nom = ?';
    db.query(checkQuery, [nom], (err, results) => {
        if (err) {
            console.error('Erreur lors de la vérification de l’utilisateur :', err);
            return res.status(500).json({ message: 'Erreur interne du serveur' });
        }

        if (results.length > 0) {
            return res.status(409).json({ message: 'Cet utilisateur existe déjà.' });
        }

        const insertQuery = 'INSERT INTO users (nom, mot_de_passe) VALUES (?, ?)';
        db.query(insertQuery, [nom, motDePasse], (err, result) => {
            if (err) {
                console.error('Erreur lors de l’insertion de l’utilisateur :', err);
                return res.status(500).json({ message: 'Erreur interne du serveur' });
            }

            return res.status(201).json({ message: 'Utilisateur créé avec succès.' });
        });
    });
});

// Route pour la connexion
app.post('/api/login', (req, res) => {
    const { nom, motDePasse } = req.body;

    const query = 'SELECT * FROM users WHERE nom = ? AND mot_de_passe = ?';
    db.query(query, [nom, motDePasse], (err, results) => {
        if (err) {
            console.error('Erreur lors de la requête :', err);
            return res.status(500).json({ message: 'Erreur interne du serveur' });
        }

        if (results.length > 0) {
            const user = results[0];
            const token = jwt.sign({ id: user.id, nom: user.nom }, 'votre-cle-secrete', { expiresIn: '1h' });

            const updateQuery = 'UPDATE users SET token = ? WHERE id = ?';
            db.query(updateQuery, [token, user.id], (err, result) => {
                if (err) {
                    console.error('Erreur lors de l\'enregistrement du token :', err);
                    return res.status(500).json({ message: 'Erreur interne du serveur' });
                }

                res.cookie('token', token, {
                    httpOnly: true,
                    secure: false, 
                    sameSite: 'Strict',
                });
                return res.status(200).json({ message: 'Connexion réussie', token });
            });
        } else {
            return res.status(401).json({ message: 'Identifiants invalides' });
        }
    });
});

// Route protégée nécessitant une authentification
app.get('/api/protected', (req, res) => {
    const token = req.cookies.token;

    if (!token) {
        return res.status(401).json({ message: 'Non autorisé' });
    }

    jwt.verify(token, 'votre-cle-secrete', (err, decoded) => {
        if (err) {
            return res.status(403).json({ message: 'Token invalide ou expiré' });
        }

        return res.status(200).json({ message: 'Bienvenue dans la zone protégée !' });
    });
});

// Route pour la déconnexion
app.post('/api/logout', (req, res) => {
    res.clearCookie('token');
    return res.status(200).json({ message: 'Déconnexion réussie' });
});

// Lancer le serveur sur le port 3000
app.listen(PORT, () => {
    console.log(`Serveur backend en écoute sur http://192.168.65.227:${PORT}`);
});
