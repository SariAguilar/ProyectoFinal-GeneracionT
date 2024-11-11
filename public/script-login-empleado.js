const loginForm = document.getElementById('loginForm');

loginForm.addEventListener('submit', (event) => {
    event.preventDefault();

    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    // Realizar la petición al servidor para validar las credenciales
    fetch('/api/login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            // Si las credenciales son válidas, redirigir al panel del empleado
            window.location.href = '/inicio-empleado';
        } else {
            // Mostrar un mensaje de error
            document.getElementById('error-message').textContent = 'Credenciales incorrectas.';
        }
    })
    .catch(error => {
        console.error('Error al iniciar sesión:', error);
    });
});