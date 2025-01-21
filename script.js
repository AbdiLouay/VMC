const API_BASE_URL = 'http://192.168.65.227:3000/api'; // Adresse de votre serveur backend

// Fonction pour afficher le formulaire sélectionné (Inscription ou Connexion)
function showForm(formId) {
    const forms = document.querySelectorAll('form');
    const buttons = document.querySelectorAll('.tab button');

    // Cacher tous les formulaires
    forms.forEach(form => form.classList.remove('active'));
    buttons.forEach(button => button.classList.remove('active'));

    // Afficher le formulaire sélectionné
    document.getElementById(formId).classList.add('active');
    event.target.classList.add('active');
}

// Gérer le formulaire d'inscription
async function handleSignup(event) {
    event.preventDefault(); // Empêche le rechargement de la page
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
            alert(data.message);

            // Rediriger vers le formulaire de connexion
            showForm('login');
        } else {
            alert(data.message || 'Erreur lors de l’inscription.');
        }
    } catch (error) {
        console.error('Erreur lors de la requête :', error);
        alert('Une erreur est survenue.');
    }
}

// Gérer le formulaire de connexion
async function handleLogin(event) {
    event.preventDefault(); // Empêche le rechargement de la page
    const username = document.getElementById('login-name').value;
    const password = document.getElementById('login-password').value;

    try {
        const response = await fetch(`${API_BASE_URL}/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ nom: username, motDePasse: password }),
            credentials: 'include', // Inclus les cookies
        });

        const data = await response.json();
        if (response.ok) {
            alert(data.message);

            // Rediriger vers la page principale
            document.querySelector('form#login').style.display = 'none';
            document.querySelector('form#signup').style.display = 'none';
            document.querySelector('.tab').style.display = 'none';
            document.getElementById('main-page').style.display = 'block';
            drawCurve();
        } else {
            alert(data.message || 'Erreur lors de la connexion.');
        }
    } catch (error) {
        console.error('Erreur lors de la requête :', error);
        alert('Une erreur est survenue.');
    }
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
