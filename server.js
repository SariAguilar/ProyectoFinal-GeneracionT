const express = require('express');
const bodyParser = require('body-parser');
const mysql = require('mysql');
const bcrypt = require('bcrypt');
const app = express();
const path = require('path');
const port = 3000;

// Middleware
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));


// Definir rutas para las vistas
app.get('/registrar', (req, res) => {
    console.log('Se accedió a /registrar');
    res.sendFile(path.join(__dirname, 'views', 'registrar.html'));
});

app.get('/login-options', (req, res) => {
    console.log('Se accedió a /login-options');
    res.sendFile(path.join(__dirname, 'views', 'login-options.html'));
});




// Conexión a la base de datos
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root', //usuario
    password: 'servidor', //constraseña
    database: 'gestion_vacaciones' // Cambia esto por tu base de datos
});

db.connect(err => {
    if (err) {
        console.error('Error conectando a la base de datos:', err);
        return;
    }
    console.log('Conectado a la base de datos MySQL');
});

// Verificar empleado en la base de datos
app.post('/api/verify-employee', (req, res) => {
    const { firstName, lastName, dni, birthDate } = req.body;
    const query = 'SELECT * FROM empleados WHERE nombres = ? AND apellidos = ? AND dni = ? AND fecha_nacimiento = ?';
    
    db.query(query, [firstName, lastName, dni, birthDate], (err, results) => {
        if (err) throw err;
        res.json({ exists: results.length > 0 });
    });
});

// Registrar nuevo usuario (empleado)
app.post('/api/register-user', (req, res) => {
    const { email, password } = req.body;

    // Encriptar la contraseña
    const hashedPassword = bcrypt.hashSync(password, 10);

    // Aquí iría la lógica para insertar el nuevo usuario en la base de datos de usuarios
    const query = 'INSERT INTO usuarios (email, password) VALUES (?, ?)';
    db.query(query, [email, hashedPassword], (err, results) => {
        if (err) {
            console.error('Error al insertar en la base de datos:', err);
            return res.json({ success: false, message: 'Error al registrar el usuario.' });
        }
        res.json({ success: true });
    });
});


// Iniciar el servidor
app.listen(port, () => {
    console.log(`Servidor escuchando en http://localhost:${port}`);
});
