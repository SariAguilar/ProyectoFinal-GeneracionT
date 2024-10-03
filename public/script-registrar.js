document.addEventListener('DOMContentLoaded', function() {
    const registrationForm = document.getElementById('registrationForm');
    const verificationMessage = document.getElementById('verificationMessage');
    const emailPasswordSection = document.getElementById('emailPasswordSection');

    if (registrationForm) {
        registrationForm.onsubmit = async function(event) {
            event.preventDefault(); // Evitar el envío del formulario

            // Obtener los datos del formulario
            const firstName = document.getElementById('firstName').value;
            const lastName = document.getElementById('lastName').value;
            const dni = document.getElementById('dni').value;
            const birthDate = document.getElementById('birthDate').value;

            // Verificar empleado en la base de datos
            const response = await fetch('/api/verify-employee', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ firstName, lastName, dni, birthDate })
            });

            const data = await response.json();

            if (data.exists) {
                verificationMessage.textContent = "Empleado verificado. Complete sus datos de acceso.";
                verificationMessage.style.display = 'block';
                emailPasswordSection.style.display = 'block';
            } else {
                verificationMessage.textContent = "No se encontró el empleado en la base de datos.";
                verificationMessage.style.display = 'block';
            }
        };
    }

    const emailPasswordForm = document.getElementById('emailPasswordForm');

    if (emailPasswordForm) {
        emailPasswordForm.onsubmit = async function(event) {
            event.preventDefault();

            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;

            // Registrar al empleado
            const response = await fetch('/api/register-user', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password, dni })
            });

            const result = await response.json();
            if (result.success) {
                alert("Registro completado con éxito.");
                window.location.href = '/login-options'; // Redirigir después del registro
            } else {
                alert("Error en el registro: " + result.message);
            }
        };
    }
});