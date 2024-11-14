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
app.use(express.json());


// Middleware para verificar si el usuario es un administrador
function isAdmin(req, res, next) {
    console.log("Sesión:", req.session); // Añadir este log
    if (req.session && req.session.role === 'admin') {
        return next();
    } else {
        res.status(403).json({ message: 'Acceso denegado.' });
    }
}


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

// Ruta de inicio de sesión
app.post('/api/login', (req, res) => {
    console.log('Datos recibidos en /api/login:', req.body); // Esta línea imprime los datos recibidos
    const { email, password } = req.body; 

    // Consultar la base de datos para verificar las credenciales solo con email y password
    db.query('SELECT * FROM usuarios WHERE email = ?', [email], (err, results) => {
        if (err) {
            console.error('Error al verificar las credenciales:', err);
            res.status(500).json({ success: false });
        } else {
            if (results.length === 1) {
                const user = results[0];
                // Comparar la contraseña ingresada con la almacenada en la base de datos
                bcrypt.compare(password, user.password, (err, isMatch) => {
                    if (err) {
                        console.error('Error al comparar contraseñas:', err);
                        res.status(500).json({ success: false });
                    } else if (isMatch) {
                        // Crear una sesión para el usuario y devolver nombre
                        req.session.userId = user.id;
                        res.json({ success: true, nombre: user.nombre});
                    } else {
                        res.json({ success: false, message: "Contraseña incorrecta" });
                    }
                });
            } else {
                res.json({ success: false, message: "Usuario no encontrado" });
            }
        }
    });
});


// Ruta para iniciar sesión como RRHH
app.post('/login-rrhh', (req, res) => {
    const { email, password } = req.body;

    // Buscar el usuario en la tabla usuarios_admin
    const query = 'SELECT * FROM usuarios_admin WHERE email = ?';
    db.query(query, [email], (err, results) => {
        if (err) {
            console.error("Error al consultar la base de datos:", err);
            return res.status(500).json({ message: "Error interno del servidor" });
        }

        // Si no encontramos al usuario con ese correo
        if (results.length === 0) {
            return res.status(401).json({ message: "Correo no registrado" });
        }

        const usuario = results[0];

        // Comparar la contraseña con bcrypt
        bcrypt.compare(password, usuario.password, (err, isMatch) => {
            if (err) {
                console.error("Error al comparar la contraseña:", err);
                return res.status(500).json({ message: 'Error en el servidor.' });
            }

            if (isMatch) {
                // Si la contraseña es correcta, guardar la sesión del usuario
                req.session.userId = usuario.id; // Guarda el id del usuario en la sesión
                req.session.role = 'admin'; // Guarda el rol como 'admin'

                // Enviar respuesta con redirección al frontend
                res.json({ redirect: true, url: '/inicio-admin.html' }); // Redirige al administrador
            } else {
                // Si la contraseña no es correcta
                res.status(401).json({ message: 'Correo o contraseña incorrectos.' });
            }
        });
    });
});

// Obtener todas las solicitudes pendientes
app.get('/api/solicitudes', (req, res) => {
    const query = 'SELECT * FROM solicitudes_vacaciones WHERE estado = "pendiente"';
    db.query(query, (err, results) => {
        if (err) {
            console.error("Error al obtener las solicitudes:", err);
            return res.status(500).json({ message: "Error al obtener las solicitudes" });
        }
        res.json(results);
    });
});

app.post('/api/solicitudes/:id/aceptar', (req, res) => {
    const { id } = req.params;
    const query = 'UPDATE solicitudes SET estado = "aceptada" WHERE id = ?';
    db.query(query, [id], (err, result) => {
        if (err) {
            console.error("Error al aceptar la solicitud:", err);
            return res.status(500).json({ message: "Error al aceptar la solicitud" });
        }
        res.json({ message: 'Solicitud aceptada' });
    });
});

app.post('/api/solicitudes/:id/denegar', (req, res) => {
    const { id } = req.params;
    const query = 'UPDATE solicitudes SET estado = "denegada" WHERE id = ?';
    db.query(query, [id], (err, result) => {
        if (err) {
            console.error("Error al denegar la solicitud:", err);
            return res.status(500).json({ message: "Error al denegar la solicitud" });
        }
        res.json({ message: 'Solicitud denegada' });
    });
});


//Cerrar Sesión
app.post('/api/logout', (req, res) => {
    req.session.destroy(error => {
        if (error) {
            console.error('Error al cerrar sesión:', error);
            res.status(500).send('Error al cerrar sesión');
        } else {
            res.sendStatus(200);
        }
    });
});


app.get('/api/mi-perfil', (req, res) => {
    const usuarioId = req.session.userId;  // Supone que el ID del usuario está almacenado en la sesión

    db.query(`
        SELECT e.nombre, e.apellido, e.dni, e.fecha_nacimiento, e.fecha_ingreso, e.rol, e.dias_vacaciones_acumulados, u.email 
        FROM empleados AS e
        JOIN usuarios AS u ON e.id = u.empleado_id
        WHERE u.id = ?
    `, [usuarioId], (error, results) => {
        if (error) {
            console.error('Error al obtener los datos del perfil:', error);
            res.status(500).json({ success: false, message: 'Error al cargar el perfil' });
        } else if (results.length > 0) {
            const usuario = results[0];
            res.json({ success: true, usuario });
        } else {
            res.json({ success: false, message: 'Usuario no encontrado' });
        }
    });
});
// Verificar empleado en la base de datos (automáticamente usando el DNI)
app.post('/api/verify-employee', (req, res) => {
    const { firstName, lastName, dni, birthDate } = req.body;
    console.log('Datos recibidos en el backend:', { firstName, lastName, dni, birthDate });

    // Consulta SQL
    const query = 'SELECT id FROM empleados WHERE dni = ?';
    db.query(query, [dni], (err, result) => {
        if (err) {
            console.error('Error al buscar el empleado:', err);
            return res.status(500).json({ error: 'Error al buscar el empleado' });
        }
    
        if (result.length > 0) {
            res.json({ exists: true });
        } else {
            res.json({ exists: false });
        }
    });
    
});
app.get('/api/obtener-perfil', (req, res) => {
    const empleadoId = req.session.empleadoId;

    if (!empleadoId) {
        return res.status(401).json({ error: 'No autorizado' });
    }

    connection.query('SELECT nombre FROM empleados WHERE id = ?', [empleadoId], (error, results) => {
        if (error) {
            console.error('Error en la consulta:', error);
            return res.status(500).json({ error: 'Error en el servidor' });
        }
        if (results.length > 0) {
            const nombre = results[0].nombre;
            res.json({ nombre });
        } else {
            res.status(404).json({ error: 'Empleado no encontrado' });
        }
    });
});

// Registrar nuevo usuario (empleado)
app.post('/api/register-user', (req, res) => {
    const { email, password, dni } = req.body;

    console.log('DNI recibido:', dni);  // Verifica el valor del DNI

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

app.post('/api/solicitar-vacaciones', (req, res) => {
    const { fechaInicio, fechaFin, observaciones } = req.body;
    const empleadoId = req.session.userId;

    db.query(`
        INSERT INTO solicitudes_vacaciones (empleado_id, fecha_inicio, fecha_fin, estado, observaciones)
        VALUES (?, ?, ?, 'pendiente', ?)
    `, [empleadoId, fechaInicio, fechaFin, observaciones], (error, results) => {
        if (error) {
            console.error('Error al registrar la solicitud de vacaciones:', error);
            res.status(500).json({ success: false, message: 'Error al registrar la solicitud' });
        } else {
            res.json({ success: true, message: 'Solicitud enviada correctamente' });
        }
    });
});


//historial de solicitudes
app.get('/api/solicitudes-vacaciones', (req, res) => {
    const empleadoId = req.session.userId;

    db.query(
        'SELECT fecha_inicio, fecha_fin, estado, observaciones FROM solicitudes_vacaciones WHERE empleado_id = ? ORDER BY fecha_inicio DESC',
        [empleadoId],
        (error, results) => {
            if (error) {
                console.error(error);
                res.status(500).json({ success: false, message: 'Error al obtener el historial de solicitudes de vacaciones' });
            } else {
                res.json({ success: true, solicitudes: results });
            }
        }
    );
});


app.get('/api/solicitudes-pendientes', (req, res) => {
    // Verifica si el usuario tiene permisos de administrador (RRHH)
    if (req.session.userRole !== 'admin') {
        return res.status(403).json({ success: false, message: 'Acceso denegado' });
    }

    // Selecciona las solicitudes con estado "pendiente"
    db.query(
        'SELECT s.id, s.fecha_inicio, s.fecha_fin, s.estado, s.observaciones, e.nombre, e.apellido ' +
        'FROM solicitudes_vacaciones s JOIN empleados e ON s.empleado_id = e.id WHERE s.estado = "pendiente"',
        (error, results) => {
            if (error) {
                console.error(error);
                res.status(500).json({ success: false, message: 'Error al obtener solicitudes' });
            } else {
                res.json({ success: true, solicitudes: results });
            }
        }
    );
});


app.post('/api/gestionar-solicitud', (req, res) => {
    const { id, estado } = req.body;

    // Verifica si el usuario tiene permisos de administrador (RRHH)
    if (req.session.userRole !== 'admin') {
        return res.status(403).json({ success: false, message: 'Acceso denegado' });
    }

    // Actualiza el estado de la solicitud en la base de datos
    db.query(
        'UPDATE solicitudes_vacaciones SET estado = ? WHERE id = ?',
        [estado, id],
        (error, results) => {
            if (error) {
                console.error(error);
                res.status(500).json({ success: false, message: 'Error al actualizar solicitud' });
            } else if (results.affectedRows === 0) {
                res.status(404).json({ success: false, message: 'Solicitud no encontrada' });
            } else {
                res.json({ success: true, message: 'Solicitud actualizada correctamente' });
            }
        }
    );
});


// Rutas para servir las páginas de login y registro
app.get('/login-options', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'login-options.html'));
});

app.get('/registrar', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'registrar.html'));
});

app.get('/login-empleado', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'login-empleado.html'));
});

app.get('/login-RRHH', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'login-rrhh.html'));
});

app.get('/inicio-empleado', (req, res) => {
    if (req.session.userId) {  // Cambia 'req.session.user' por 'req.session.userId'
        res.sendFile(path.join(__dirname, 'views', 'inicio-empleado.html'));
    } else {
        res.redirect('/login-empleado');  // Redirige a la página de login si no está autenticado
    }
});

// Ruta protegida para el panel de RRHH
app.get('/inicio-admin.html', isAdmin, (req, res) => {
    res.sendFile(path.join(__dirname,  'inicio-admin.html'));
});





// Iniciar el servidor
app.listen(port, () => {
    console.log(`Servidor escuchando en http://localhost:${port}`);
});
