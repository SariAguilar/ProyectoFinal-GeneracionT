// Verificar si el usuario está autenticado
if (!sessionStorage.getItem('usuarioId')) {
    window.location.href = 'login-rrhh.html';  // Redirigir a la página de login si no está autenticado
}

// Función para cargar las solicitudes de vacaciones
function cargarSolicitudes() {
    const container = document.getElementById('solicitudes-container');
    container.innerHTML = '<p>Cargando solicitudes...</p>';

    fetch('/api/solicitudes')
    .then(response => {
        if (!response.ok) throw new Error('Error en la respuesta del servidor');
        return response.json();
    })
    .then(data => {
        console.log("Datos recibidos de solicitudes:", data);  // Añadir log para verificar los datos
        container.innerHTML = '';

        if (data.length === 0) {
            container.innerHTML = '<p>No hay solicitudes pendientes.</p>';
        } else {
            data.forEach(solicitud => {
                const solicitudDiv = document.createElement('div');
                solicitudDiv.classList.add('solicitud');
                solicitudDiv.innerHTML = `
                    <p><strong>Empleado:</strong> ${solicitud.nombre} ${solicitud.apellido}</p>
                    <p><strong>Fecha Inicio:</strong> ${solicitud.fecha_inicio}</p>
                    <p><strong>Fecha Fin:</strong> ${solicitud.fecha_fin}</p>
                    <button onclick="aceptarSolicitud(${solicitud.id})">Aceptar</button>
                    <button onclick="denegarSolicitud(${solicitud.id})">Denegar</button>
                `;
                container.appendChild(solicitudDiv);
            });
        }
    })
    .catch(error => {
        console.error('Error al cargar las solicitudes:', error);
        container.innerHTML = '<p>Error al cargar las solicitudes. Por favor, intente nuevamente.</p>';
    });
}


// Función para aceptar una solicitud
function aceptarSolicitud(id) {
    if (confirm('¿Está seguro de que desea aceptar esta solicitud?')) {
        fetch(`/api/solicitudes/${id}/aceptar`, { method: 'POST' })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                alert('Solicitud aceptada');
                cargarSolicitudes();  // Recargar las solicitudes
            } else {
                alert('Hubo un error al aceptar la solicitud. Intente nuevamente.');
            }
        })
        .catch(error => {
            console.error('Error al aceptar la solicitud:', error);
            alert('Error al aceptar la solicitud. Intente nuevamente.');
        });
    }
}

// Función para denegar una solicitud
function denegarSolicitud(id) {
    if (confirm('¿Está seguro de que desea denegar esta solicitud?')) {
        fetch(`/api/solicitudes/${id}/denegar`, { method: 'POST' })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                alert('Solicitud denegada');
                cargarSolicitudes();  // Recargar las solicitudes
            } else {
                alert('Hubo un error al denegar la solicitud. Intente nuevamente.');
            }
        })
        .catch(error => {
            console.error('Error al denegar la solicitud:', error);
            alert('Error al denegar la solicitud. Intente nuevamente.');
        });
    }
}

// Función para cerrar sesión
function cerrarSesion() {
    sessionStorage.removeItem('usuarioId');  // Eliminar la sesión

    fetch('/api/logout', { method: 'POST' })
        .then(() => {
            window.location.href = '/public/index.html';  // Redirigir al login
        })
        .catch(error => {
            console.error('Error al cerrar sesión:', error);
            alert('Error al cerrar sesión. Intente nuevamente.');
        });
}


// Cargar las solicitudes al inicio
cargarSolicitudes();