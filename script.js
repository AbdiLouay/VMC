const API_BASE_URL = 'http://192.168.65.227:3000/api'; // Adresse de votre serveur backend 

// Fonction pour afficher le formulaire sélectionné (Inscription ou Connexion)
function showForm(formId) {
    const forms = document.querySelectorAll('form');
    const buttons = document.querySelectorAll('.tab button');

    forms.forEach(form => form.classList.remove('active'));
    buttons.forEach(button => button.classList.remove('active'));

    document.getElementById(formId).classList.add('active');
    document.querySelector(`.tab button[onclick="showForm('${formId}')"]`).classList.add('active');
}

// Fonction pour afficher une notification
function showNotification(message, type = 'success') {
    const container = document.getElementById('notification-container');

    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;

    container.appendChild(notification);

    setTimeout(() => {
        notification.remove();
    }, 4000); // 4 secondes
}

// Gérer le formulaire d'inscription
async function handleSignup(event) {
    event.preventDefault();
    const username = document.getElementById('signup-name').value;
    const password = document.getElementById('signup-password').value;

    try {
        const response = await fetch(`${API_BASE_URL}/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ nom: username, motDePasse: password }),
        });

        const data = await response.json();
        if (response.ok) {
            showNotification(data.message, 'success');
            // Rediriger vers le formulaire de connexion
            showForm('login');
        } else {
            showNotification(data.message || 'Erreur lors de l’inscription.', 'error');
        }
    } catch (error) {
        console.error('Erreur lors de la requête :', error);
        showNotification('Une erreur est survenue.', 'error');
    }
}

// Gérer le formulaire de connexion
async function handleLogin(event) {
    event.preventDefault();
    const username = document.getElementById('login-name').value;
    const password = document.getElementById('login-password').value;

    try {
        const response = await fetch(`${API_BASE_URL}/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ nom: username, motDePasse: password }),
        });

        const data = await response.json();
        if (response.ok) {
            // Stocker le token dans le stockage local
            localStorage.setItem('token', data.token);

            showNotification(data.message, 'success');
            
            // Passer à la page principale
            loadMainPage();
        } else {
            showNotification(data.message || 'Identifiants invalides.', 'error');
        }
    } catch (error) {
        console.error('Erreur lors de la requête :', error);
        showNotification('Une erreur est survenue.', 'error');
    }
}

// Gérer la déconnexion
function handleLogout() {
    localStorage.removeItem('token'); // Supprimer le token du stockage local
    location.reload(); // Recharger la page pour revenir à l'écran de connexion
}

// Charger la page principale après connexion
function loadMainPage() {
    document.querySelector('form#login').style.display = 'none';
    document.querySelector('form#signup').style.display = 'none';
    document.querySelector('.tab').style.display = 'none';
    document.getElementById('main-page').style.display = 'block';

    drawCurve(); // Afficher la courbe simulée
}

// Fonction pour dessiner une courbe sinusoïdale dans le canvas
function drawCurve() {
    const canvas = document.getElementById('curve-simulation');
    const ctx = canvas.getContext('2d');

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.beginPath();
    ctx.moveTo(0, 200);

    for (let x = 0; x <= canvas.width; x++) {
        const y = 200 + 100 * Math.sin((x / canvas.width) * 4 * Math.PI);
        ctx.lineTo(x, y);
    }

    ctx.strokeStyle = 'blue';
    ctx.lineWidth = 2;
    ctx.stroke();
}

// Vérification automatique du token pour rediriger l'utilisateur connecté
function checkAuth() {
    const token = localStorage.getItem('token');

    if (token) {
        fetch(`${API_BASE_URL}/protected`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
            },
        })
            .then(response => {
                if (response.ok) {
                    loadMainPage();
                } else {
                    console.warn('Token invalide ou expiré.');
                }
            })
            .catch(error => console.error('Erreur lors de la vérification du token :', error));
    }
}

// Appeler la fonction checkAuth au chargement de la page
window.onload = checkAuth;
