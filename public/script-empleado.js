// Obtener el elemento del contenido
const contenido = document.getElementById('contenido');

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
                    contenido.innerHTML = `
                        <p>Nombre: ${data.nombre}</p>
                        <p>Apellido: ${data.apellido}</p>
                        `;
                });
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