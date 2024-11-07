// node server.js
const express = require('express');
const bodyParser = require('body-parser');
const mysql = require('mysql');
const bcrypt = require('bcrypt');
const session = require('express-session');
const path = require('path');
const app = express();
const port = 3000;

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true })); // Habilita URL-encoded para datos enviados por formularios
app.use(express.static(path.join(__dirname, 'public')));

// Configuración de sesiones
app.use(session({
    secret: 's3kr3t0#CULT°', 
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false, maxAge: 60000 } // Agregar maxAge para duración de la sesión
}));

// Conexión a la base de datos
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',             // Usuario de la base de datos
    password: 'servidor',     // Contraseña de la base de datos
    database: 'gestion_vacaciones' // Esquema de la base de datos
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
    const { dni } = req.body;

    if (!dni) {
        return res.status(400).json({ success: false, message: 'DNI no puede estar vacío.' });
    }

    const query = 'SELECT * FROM empleados WHERE dni = ?';

    db.query(query, [dni], (err, results) => {
        if (err) {
            console.error('Error al verificar el empleado:', err);
            return res.status(500).json({ success: false, message: 'Error al verificar el empleado.' });
        }
        res.json({ success: true, exists: results.length > 0 });
    });
});

// Registrar nuevo usuario (empleado)
app.post('/api/register-user', (req, res) => {
    const { email, password, dni } = req.body;

    if (!dni || !email || !password) {
        return res.status(400).json({ success: false, message: 'DNI, correo y contraseña son obligatorios.' });
    }

    const findEmpleadoQuery = 'SELECT id FROM empleados WHERE dni = ?';

    db.query(findEmpleadoQuery, [dni], (err, results) => {
        if (err) {
            console.error('Error al buscar el empleado:', err);
            return res.status(500).json({ success: false, message: 'Error al buscar el empleado.' });
        }

        if (results.length === 0) {
            console.error('Empleado no encontrado con ese DNI:', dni);
            return res.status(404).json({ success: false, message: 'Empleado no encontrado.' });
        }

        const empleado_id = results[0].id;

        bcrypt.hash(password, 10, (err, hashedPassword) => {
            if (err) {
                console.error('Error al encriptar la contraseña:', err);
                return res.status(500).json({ success: false, message: 'Error al registrar el usuario.' });
            }

            const insertUsuarioQuery = 'INSERT INTO usuarios (empleado_id, email, password) VALUES (?, ?, ?)';

            db.query(insertUsuarioQuery, [empleado_id, email, hashedPassword], (err, results) => {
                if (err) {
                    console.error('Error al insertar en la base de datos:', err);
                    return res.status(500).json({ success: false, message: 'Error al registrar el usuario.' });
                }

                res.json({ success: true, message: 'Usuario registrado exitosamente.' });
            });
        });
    });
});

// Verificar disponibilidad de fechas para vacaciones
app.post('/api/verificar-disponibilidad', (req, res) => {
    const { fechaInicio, fechaFin } = req.body;

    if (!fechaInicio || !fechaFin) {
        return res.status(400).json({ success: false, message: 'Las fechas son obligatorias.' });
    }

    const query = 'SELECT COUNT(*) as count FROM solicitudes_vacaciones WHERE fecha_inicio <= ? AND fecha_fin >= ?';

    db.query(query, [fechaFin, fechaInicio], (err, results) => {
        if (err) {
            console.error('Error al verificar la disponibilidad:', err);
            return res.status(500).json({ success: false, message: 'Error al verificar la disponibilidad.' });
        }

        const ocupados = results[0].count;
        const limiteVacaciones = 5;

        if (ocupados >= limiteVacaciones) {
            return res.status(400).json({ success: false, message: 'No hay disponibilidad para esas fechas.' });
        }

        res.json({ success: true, message: 'Fechas disponibles.' });
    });
});

// Obtener días de vacaciones según antigüedad
app.post('/api/dias-vacaciones', (req, res) => {
    const { antiguedad } = req.body;

    let dias = 5;

    if (antiguedad >= 1 && antiguedad <= 3) {
        dias = 10;
    } else if (antiguedad > 3) {
        dias = 15;
    }

    res.json({ success: true, dias });
});

// Verificar si el empleado puede pedir vacaciones según asistencia
app.post('/api/puede-pedir-vacaciones', (req, res) => {
    const { idEmpleado } = req.body;

    const query = 'SELECT COUNT(*) as diasAsistidos FROM asistencias WHERE id_empleado = ? AND estado = "presente"';

    db.query(query, [idEmpleado], (err, results) => {
        if (err) {
            console.error('Error al verificar asistencia:', err);
            return res.status(500).json({ success: false, message: 'Error al verificar la asistencia.' });
        }

        const diasAsistidos = results[0].diasAsistidos;
        const limiteAsistencias = 20;

        if (diasAsistidos < limiteAsistencias) {
            return res.status(400).json({ success: false, message: 'No tiene suficiente asistencia para pedir vacaciones.' });
        }

        res.json({ success: true, message: 'Puede pedir vacaciones.' });
    });
});

// Mostrar historial de vacaciones
app.post('/api/historial-vacaciones', (req, res) => {
    const { idEmpleado } = req.body;

    const query = 'SELECT * FROM historial_vacaciones WHERE id_empleado = ?';

    db.query(query, [idEmpleado], (err, results) => {
        if (err) {
            console.error('Error al obtener el historial de vacaciones:', err);
            return res.status(500).json({ success: false, message: 'Error al obtener el historial de vacaciones.' });
        }

        res.json({ success: true, historial: results });
    });
});

// Rutas para servir las páginas de login y registro
app.get('/login-options', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'login-options.html'));
});

app.get('/registrar', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'registrar.html'));
});

// Iniciar el servidor
app.listen(port, () => {
    console.log(`Servidor escuchando en http://localhost:${port}`);
});
