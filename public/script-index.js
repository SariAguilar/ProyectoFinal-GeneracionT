document.addEventListener('DOMContentLoaded', function() {
    const loginBtn = document.getElementById('loginBtn');
    const registerBtn = document.getElementById('registerBtn');

    if (loginBtn && registerBtn) {
        
        loginBtn.onclick = function() {
            // Redirigir a la página de opciones de login
            window.location.href = '/login-options'; // Ruta sin .html
        };

        registerBtn.onclick = function() {
            // Redirigir a la página de registro
            window.location.href = '/registrar'; // Ruta sin .html
        };
    }
});