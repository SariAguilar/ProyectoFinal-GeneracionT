document.getElementById('login-rrhh-form').addEventListener('submit', function (event) {
    event.preventDefault(); // Evitar la acción por defecto del formulario

    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    fetch('/login-rrhh', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
    })
    .then(response => {
        if (!response.ok) {
            return response.json().then(errData => {
                throw new Error(errData.message || 'Error desconocido');
            });
        }
        return response.json();
    })
    
    .then(data => {
        if (data.redirect === true && data.url) {
            console.log('Redireccionando a:', data.url);  // Agrega este log
            document.getElementById('message').innerText = 'Inicio de sesión exitoso, redirigiendo...';
            window.location.href = data.url;
        } else {
            document.getElementById('message').innerText = data.message || 'Error no especificado';
        }
    })
    
    .catch(error => {
        // Este bloque maneja los errores de la solicitud y muestra un mensaje adecuado
        document.getElementById('message').innerText = `Error: ${error.message}`;
        console.error('Error en la solicitud:', error);
    });
});
