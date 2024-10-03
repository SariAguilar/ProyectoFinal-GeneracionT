const express = require('express');
const bodyParser = require('body-parser');
const mysql = require('mysql');
const bcrypt = require('bcrypt');
const session = require('express-session');
const app = express();
const path = require('path');
const port = 3000;

// Middleware
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

// Configuración de sesiones
app.use(session({
    secret: 's3kr3t0#CULT°', 
    resave: false,
    saveUninitialized: true
}));

// Conexión a la base de datos
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'servidor',
    database: 'gestion_vacaciones'
});

db.connect(err => {
    if (err) {
        console.error('Error conectando a la base de datos:', err);
        return;
    }
    console.log('Conectado a la base de datos MySQL');
});

// Verificar empleado en la base de datos (automáticamente usando el DNI)
app.post('/api/verify-employee', (req, res) => {
    const { dni } = req.body; // Suponiendo que el DNI se envía en el cuerpo de la solicitud

    const query = 'SELECT * FROM empleados WHERE dni = ?';

    db.query(query, [dni], (err, results) => {
        if (err) throw err;
        res.json({ exists: results.length > 0 });
    });
});

// Registrar nuevo usuario (empleado)
app.post('/api/register-user', (req, res) => {
    const { email, password, dni } = req.body; // Obtener el dni del cuerpo

    // Validar que el DNI no esté vacío
    if (!dni) {
        return res.json({ success: false, message: 'DNI no puede estar vacío.' });
    }

    // Buscar el empleado en la tabla empleados usando el DNI
    const findEmpleadoQuery = 'SELECT id FROM empleados WHERE dni = ?';

    db.query(findEmpleadoQuery, [dni], (err, results) => {
        if (err) {
            console.error('Error al buscar el empleado:', err);
            return res.json({ success: false, message: 'Error al buscar el empleado.' });
        }

        // Verificar si se encontró el empleado
        if (results.length === 0) {
            console.error('Empleado no encontrado con ese DNI:', dni);
            return res.json({ success: false, message: 'Empleado no encontrado.' });
        }

        // Obtener el id del empleado
        const empleado_id = results[0].id;
        console.log('Empleado ID encontrado:', empleado_id);

        // Encriptar la contraseña
        const hashedPassword = bcrypt.hashSync(password, 10);

        // Insertar el nuevo usuario con el empleado_id en la tabla usuarios
        const insertUsuarioQuery = 'INSERT INTO usuarios (empleado_id, email, password) VALUES (?, ?, ?)';

        db.query(insertUsuarioQuery, [empleado_id, email, hashedPassword], (err, results) => {
            if (err) {
                console.error('Error al insertar en la base de datos:', err);
                return res.json({ success: false, message: 'Error al registrar el usuario.' });
            }

            res.json({ success: true, message: 'Usuario registrado exitosamente.' });
        });
    });
});

// Servir la página de opciones de login
app.get('/login-options', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'login-options.html')); 
});

// Servir la página de registro
app.get('/registrar', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'registrar.html')); 
});

// Iniciar el servidor
app.listen(port, () => {
    console.log(`Servidor escuchando en http://localhost:${port}`);
});
