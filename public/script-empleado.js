// Obtener el elemento del contenido
const contenido = document.getElementById('contenido');

document.addEventListener('DOMContentLoaded', function() {
    cargarPerfil();
});


function cargarPerfil() {
    fetch('/api/obtener-perfil')
        .then(response => {
            if (!response.ok) {
                throw new Error('No autorizado');
            }
            return response.json();
        })
        .then(data => {
            if (data && data.nombre) {
                document.getElementById('welcomeMessage').textContent = `¡Bienvenido, ${data.nombre}!`;
            } else {
                console.error('No se encontró el nombre del empleado en los datos recibidos');
            }
        })
        .catch(error => console.error('Error al obtener el perfil:', error));
}

// Manejar los clics en los enlaces de la navegación
    document.querySelectorAll('nav a').forEach(link => {
    link.addEventListener('click', (event) => {
        event.preventDefault();
        const href = link.getAttribute('href');

        // Cargar el contenido correspondiente según el enlace
        if (href === '#mi-perfil') {

            // Cargar la información del perfil del empleado
            fetch('/api/obtener-perfil')
            .then(response => response.json())
            .then(data => {
                const welcomeMessage = document.getElementById('welcomeMessage');
              welcomeMessage.textContent = `¡Bienvenido, ${data.nombre}!`;
            })
            .catch(error => console.error('Error al obtener el perfil:', error));


        } else if (href === '#historial-solicitudes') {
            // Cargar el historial de solicitudes del empleado
            // ...
        } else if (href === '#solicitar-vacaciones') {
            // Mostrar el formulario para solicitar vacaciones
            // ...
        } else if (href === '#cerrar-sesion') {
            // Redirigir a la página de inicio de sesión
            window.location.href = '/login';
        }
    });
});
function cerrarSesion() {
    fetch('/api/logout', { method: 'POST' })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                window.location.href = 'index.html';  // Redirige al inicio
            }
        })
        .catch(error => console.error('Error al cerrar sesión:', error));
}


const urlParams = new URLSearchParams(window.location.search);
const nombreEmpleado = urlParams.get('nombre');

// Mostrar el nombre del empleado en el mensaje de bienvenida
if (nombreEmpleado) {
    document.getElementById('welcomeMessage').textContent = `¡Bienvenido, ${nombreEmpleado}!`;
}
