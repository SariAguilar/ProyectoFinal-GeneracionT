// Lógica para manejar el inicio de sesión
document.getElementById('login-rrhh-form').addEventListener('submit', function (event) {
    event.preventDefault(); // Evitar la acción por defecto del formulario

    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    fetch('/login-rrhh', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
    })
    .then(response => response.json())
    .then(data => {
        if (data.redirect) {
            // Si la respuesta contiene una URL de redirección, hacer la redirección
            window.location.href = '/inicio-admin';
        } else {
            // Mostrar mensaje de error si no hay redirección
            document.getElementById('message').innerText = 'Correo o contraseña incorrectos';
        }
    })
    .catch(error => {
        console.error('Error en la solicitud:', error);
        document.getElementById('message').innerText = 'Hubo un problema con el inicio de sesión';
    });
});
