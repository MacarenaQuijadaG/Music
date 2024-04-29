const pool = require('./config');

const args = process.argv.slice(2);

const comando = args[0];
const params = args.slice(1);


// pasa json a argumento
async function queryWithObject(objetoQuery) {
    try {
        const res = await pool.query(objetoQuery);
        console.log(res.rows);
        return res; 
    } catch (err) {
        console.error('Error al ejecutar consulta:', err.message);
        return null; 
    } finally {
        await pool.end();
    }
}


// Funcion para agregar un nuevo estudiante
async function nuevo(params) {
    

    const [nombre, rut, curso, nivel] = params;
    const objetoQuery = {
        text: 'INSERT INTO registro_actual (nombre, rut, curso, nivel) VALUES ($1, $2, $3, $4)',
        values: [nombre, rut, curso, nivel]
    };

    try {
        const existeEstudiante = await pool.query({
            text: 'SELECT COUNT(*) FROM registro_actual WHERE rut = $1',
            values: [rut]
        });

        if (existeEstudiante.rows[0].count > 0) {
            console.error(`Ya existe un estudiante con el RUT ${rut}`);
            return;
        }

        await queryWithObject(objetoQuery);
        console.log(`Estudiante ${nombre} agregado`);
    } catch (err) {
        console.error('Error al intentar agregar un nuevo estudiante:', err.message);
    }
}

// consulta estudiantes
async function consulta() {
    const objetoQuery = {
        text: 'SELECT * FROM registro_actual'
    };

    await queryWithObject(objetoQuery);
}

// Función para consultar por RUT
async function consultarPorRut(params) {
    if (params.length !== 1) {
        console.error('Número de parámetros incorrecto para consultar por RUT.');
        return;
    }

    const objetoQuery = {
        text: 'SELECT * FROM registro_actual WHERE rut = $1',
        values: [params[0]]
    };

    await queryWithObject(objetoQuery);
}

// Funcion para editar los datos
async function editar(params) {
    if (params.length !== 4) {
        console.error('Número de parámetros incorrecto para editar los datos de un estudiante.');
        return;
    }

    const [nombre, rut, curso, nivel] = params;

    try {
        // Verificar si el estudiante existe
        const existeEstudiante = await pool.query({
            text: 'SELECT COUNT(*) FROM registro_actual WHERE rut = $1',
            values: [rut]
        });

        if (existeEstudiante.rows[0].count === 0) {
            console.error(`No existe un estudiante con el RUT ${rut}`);
            return;
        }

        // Consulta de actualización
        const objetoQuery = {
            text: 'UPDATE registro_actual SET nombre = $1, rut = $2, curso = $3, nivel = $4 WHERE rut = $2 RETURNING *',
            values: [nombre, rut, curso, nivel]
        };

        const res = await queryWithObject(objetoQuery);

        // verifica resultado y actualiza
        if (res && res.rowCount > 0) {
            console.log(`Se actualizó el estudiante con el RUT ${rut}:`, res.rows[0]);
        } else {
            console.error(`No se pudo actualizar el estudiante con el RUT ${rut}`);
        }        
    } catch (error) {
        console.error('Error al editar el registro en la tabla:', error.message);
    }
}


// Funcion para eliminar
async function eliminar() {
    try {
        const existeRegistro = await pool.query('SELECT COUNT(*) FROM registro_actual');

        if (existeRegistro.rows[0].count === 0) {
            console.error('No hay registros para eliminar');
            return;
        }

        const objetoQuery = {
            text: 'DELETE FROM registro_actual'
        };

        const res = await queryWithObject(objetoQuery);
        console.log(`Se eliminaron ${res.rowCount} registros`);
    } catch (error) {
        console.error('Error al eliminar estudiantes:', error.message);
    }
}

// Manejo de comandos
switch (comando) {
    case 'nuevo':
        nuevo(params);
        break;
    case 'consulta':
        consulta();
        break;
    case 'rut':
        consultarPorRut(params);
        break;
    case 'editar':
        editar(params);
        break;
    case 'eliminar':
        eliminar();
        break;
    default:
        console.log('Comando no reconocido');
}


// Te dejo los comandos que yo utilice para probar los eventos que hice.
// node index.js nuevo 'Juan Pérez' '12345678-9' 'Piano' '90'
// node index.js consulta
// node index.js rut 12345678-9
// node index.js editar 'Juan Pérez' '12345678-9' 'Guitarra' '85'
// node index.js eliminar '12345678-9'
