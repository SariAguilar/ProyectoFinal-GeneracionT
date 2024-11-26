// Función para formatear una fecha a 'dd/mm/yyyy'
function formatearFecha(fechaISO) {
    const fecha = new Date(fechaISO);
    const dia = String(fecha.getDate()).padStart(2, '0');
    const mes = String(fecha.getMonth() + 1).padStart(2, '0'); // Los meses son de 0 a 11
    const anio = fecha.getFullYear();
    return `${dia}/${mes}/${anio}`;
}

// Función para cargar las solicitudes de vacaciones
function cargarSolicitudes() {
    const tableBody = document.getElementById('solicitudes-table').querySelector('tbody');
    tableBody.innerHTML = '<tr><td colspan="4">Cargando solicitudes...</td></tr>';

    fetch('/api/solicitudes')
        .then(response => {
            if (!response.ok) throw new Error('Error en la respuesta del servidor');
            return response.json();
        })
        .then(data => {
            tableBody.innerHTML = ''; // Limpiar la tabla

            if (data.length === 0) {
                tableBody.innerHTML = '<tr><td colspan="4">No hay solicitudes pendientes.</td></tr>';
            } else {
                data.forEach(solicitud => {
                    const row = document.createElement('tr');
                    row.innerHTML = `
                        <td>${solicitud.nombre || 'Sin nombre'} ${solicitud.apellido || 'Sin apellido'}</td>
                        <td>${formatearFecha(solicitud.fecha_inicio) || 'N/A'}</td>
                        <td>${formatearFecha(solicitud.fecha_fin) || 'N/A'}</td>
                        <td>
                            <button onclick="aceptarSolicitud(${solicitud.id})">Aceptar</button>
                            <button onclick="denegarSolicitud(${solicitud.id})">Denegar</button>
                        </td>
                    `;
                    tableBody.appendChild(row);
                });
            }
        })
        .catch(error => {
            console.error('Error al cargar las solicitudes:', error);
            tableBody.innerHTML = '<tr><td colspan="4">Error al cargar las solicitudes. Intente nuevamente.</td></tr>';
        });
}

// Funciones para aceptar o denegar solicitudes
function aceptarSolicitud(id) {
    if (confirm('¿Está seguro de que desea aceptar esta solicitud?')) {
        fetch(`/api/solicitudes/${id}/aceptar`, { method: 'POST' })
            .then(response => response.json())
            .then(data => {
                alert(data.message || 'Solicitud aceptada');
                cargarSolicitudes(); // Recargar las solicitudes
            })
            .catch(error => {
                console.error('Error al aceptar la solicitud:', error);
                alert('Error al aceptar la solicitud. Intente nuevamente.');
            });
    }
}

function denegarSolicitud(id) {
    if (confirm('¿Está seguro de que desea denegar esta solicitud?')) {
        fetch(`/api/solicitudes/${id}/denegar`, { method: 'POST' })
            .then(response => response.json())
            .then(data => {
                alert(data.message || 'Solicitud denegada');
                cargarSolicitudes(); // Recargar las solicitudes
            })
            .catch(error => {
                console.error('Error al denegar la solicitud:', error);
                alert('Error al denegar la solicitud. Intente nuevamente.');
            });
    }
}

// Función para cerrar sesión
function cerrarSesion() {
    localStorage.removeItem('usuarioId'); // Eliminar la sesión
    fetch('/api/logout', { method: 'POST' })
        .then(() => {
            window.location.href = 'login-rrhh.html'; // Redirigir al login
        })
        .catch(error => {
            console.error('Error al cerrar sesión:', error);
            alert('Error al cerrar sesión. Intente nuevamente.');
        });
}

// Cargar solicitudes al inicio
cargarSolicitudes();
