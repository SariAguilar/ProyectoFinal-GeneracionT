// Obtener el elemento del contenido
const contenido = document.getElementById('contenido');
const welcomeMessage = document.getElementById('welcomeMessage');

// Cargar el nombre del empleado desde la URL si existe (opcional)
const urlParams = new URLSearchParams(window.location.search);
const nombreEmpleado = urlParams.get('nombre');
if (nombreEmpleado) {
    welcomeMessage.textContent = `¡Bienvenido, ${nombreEmpleado}!`;
}

// Manejar los clics en los enlaces de la navegación
document.querySelectorAll('nav a').forEach(link => {
    link.addEventListener('click', (event) => {
        event.preventDefault();
        const href = link.getAttribute('href');

        // Cargar el contenido correspondiente según el enlace
        if (href === '#mi-perfil') {
            cargarPerfil();
        } else if (href === '#historial-solicitudes') {
            cargarHistorial();
        } else if (href === '#solicitar-vacaciones') {
            cargarFormularioSolicitud();
        } else if (href === '#cerrar-sesion') {
            cerrarSesion();
        }
    });
});

// Funciones para cargar contenido

function cargarPerfil() {
    fetch('/api/mi-perfil')
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                contenido.innerHTML = `
                    <h2>Mi Perfil</h2>
                    <p><strong>Nombre Completo:</strong> ${data.usuario.nombre} ${data.usuario.apellido}</p>
                    <p><strong>DNI:</strong> ${data.usuario.dni}</p>
                    <p><strong>Rol:</strong> ${data.usuario.rol}</p>
                    <p><strong>Correo:</strong> ${data.usuario.email}</p>
                    <p><strong>Fecha de Nacimiento:</strong> ${data.usuario.fecha_nacimiento}</p>
                    <p><strong>Días de Vacaciones Acumulados:</strong> ${data.usuario.dias_vacaciones_acumulados}</p>
                    <p><strong>Fecha de Ingreso:</strong> ${data.usuario.fecha_ingreso}</p>
                `;
            } else {
                contenido.innerHTML = '<p>Error al cargar la información del perfil.</p>';
            }
        })
        .catch(error => {
            console.error('Error al cargar el perfil:', error);
            contenido.innerHTML = '<p>Error al cargar la información del perfil.</p>';
        });
}


function cargarHistorial() {
    fetch('/api/historial-vacaciones')
        .then(response => response.json())
        .then(data => {
            let historialHTML = '<h2>Historial de Vacaciones</h2>';
            data.solicitudes.forEach(solicitud => {
                historialHTML += `
                    <div>
                        <p>Fecha de inicio: ${solicitud.fecha_inicio}</p>
                        <p>Fecha de fin: ${solicitud.fecha_fin}</p>
                        <p>Estado: ${solicitud.estado}</p>
                    </div>
                `;
            });
            contenido.innerHTML = historialHTML;
        })
        .catch(error => console.error('Error al obtener el historial de vacaciones:', error));
}

function cargarFormularioSolicitud() {
    contenido.innerHTML = `
        <h2>Solicitud de Vacaciones</h2>
        <form id="form-solicitud">
            <label for="fecha-inicio">Fecha de Inicio:</label>
            <input type="date" id="fecha-inicio" name="fecha-inicio" required>

            <label for="fecha-fin">Fecha de Fin:</label>
            <input type="date" id="fecha-fin" name="fecha-fin" required>

            <label for="observaciones">Observaciones:</label>
            <textarea id="observaciones" name="observaciones"></textarea>

            <button type="submit">Solicitar Vacaciones</button>
        </form>
        <div id="mensaje"></div>
    `;

    const form = document.getElementById('form-solicitud');
    const mensaje = document.getElementById('mensaje');

    form.addEventListener('submit', (event) => {
        event.preventDefault();

        const formData = new FormData(form);
        const fechaInicio = formData.get('fecha-inicio');
        const fechaFin = formData.get('fecha-fin');
        const observaciones = formData.get('observaciones');

        fetch('/api/solicitar-vacaciones', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ fechaInicio, fechaFin, observaciones })
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                mensaje.textContent = 'Solicitud enviada correctamente.';
            } else {
                mensaje.textContent = 'Error al enviar la solicitud: ' + data.message;
            }
        })
        .catch(error => {
            console.error('Error:', error);
            mensaje.textContent = 'Error al enviar la solicitud. Por favor, inténtalo de nuevo.';
        });
    });
}
;

        fetch('/api/solicitar-vacaciones', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ fechaInicio, fechaFin, observaciones })
        })
        .then(response => response.json())
        .then(data => {
            mensaje.textContent = data.success ? 'Solicitud enviada correctamente.' : 'Error al enviar la solicitud: ' + data.message;
        })
        .catch(error => {
            console.error('Error:', error);
            mensaje.textContent = 'Error al enviar la solicitud. Por favor, inténtalo de nuevo.';
        });



function cerrarSesion() {
    const confirmacion = confirm('¿Estás seguro de que deseas cerrar sesión?');
    if (confirmacion) {
        fetch('/api/logout', { method: 'POST' })
            .then(() => {
                contenido.innerHTML = '<p>Sesión cerrada. Redirigiendo...</p>';
                setTimeout(() => {
                    window.location.href = 'index.html';
                }, 2000);
            })
            .catch(error => {
                console.error('Error al cerrar sesión:', error);
                contenido.innerHTML = '<p>Error al intentar cerrar sesión. Por favor, inténtalo de nuevo.</p>';
            });
    }
}
