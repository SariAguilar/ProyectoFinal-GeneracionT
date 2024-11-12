const form = document.getElementById('form-solicitud');
const mensaje = document.getElementById('mensaje');

form.addEventListener('submit', (event) => {
    event.preventDefault();

    const formData = new FormData(form);
    const fechaInicio = formData.get('fecha-inicio');
    const fechaFin = formData.get('fecha-fin');
    const observaciones = formData.get('observaciones');

    // Aquí debes enviar los datos al servidor para procesar la solicitud
    fetch('/api/solicitar-vacaciones', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
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