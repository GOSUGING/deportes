const express = require('express');
const fs = require('fs').promises;
const path = require('path');

const app = express();
const PORT = 3000;

// Acceder a la carpeta 'public'
app.use(express.static(path.join(__dirname, 'public'))); 

// Middleware para parsear JSON
app.use(express.json());


const SPORTS_FILE_PATH = path.join(__dirname, 'sports.json');


// Función para leer el archivo de deportes
async function readSportsFile() {
    try {
        await fs.access(SPORTS_FILE_PATH); // Verificar si el archivo existe
    } catch (error) {
        // Si el archivo no existe, crearlo con un array vacío
        await fs.writeFile(SPORTS_FILE_PATH, '[]', 'utf8');
    }

    // Leer y devolver el contenido del archivo
    const data = await fs.readFile(SPORTS_FILE_PATH, 'utf8');
    return JSON.parse(data);
}

// 1. Ruta para agregar un nuevo deporte
app.get('/agregar', async (req, res) => {
    const { nombre, precio } = req.query;
    try {
        const sports = await readSportsFile();
        sports.push({ nombre, precio });
        await fs.writeFile(SPORTS_FILE_PATH, JSON.stringify(sports, null, 2));
        res.send('Deporte agregado correctamente');
    } catch (error) {
        console.error('Error al agregar deporte:', error.message);
        res.status(500).send(`Error interno del servidor: ${error.message}`);
    }
});

// 2. Ruta para obtener todos los deportes
app.get('/deportes', async (req, res) => {
    try {
        const sports = await readSportsFile();
        res.json({ deportes: sports });
    } catch (error) {
        console.error('Error al leer el archivo:', error.message);
        res.status(500).send(`Error interno del servidor: ${error.message}`);
    }
});

// 3. Ruta para editar el precio de un deporte
app.get('/editar', async (req, res) => {
    const { nombre, precio } = req.query;
    try {
        const sports = await readSportsFile();
        const index = sports.findIndex(sport => sport.nombre === nombre);
        if (index !== -1) {
            sports[index].precio = precio;
            await fs.writeFile(SPORTS_FILE_PATH, JSON.stringify(sports, null, 2));
            res.send('Deporte editado correctamente');
        } else {
            res.status(404).send('Deporte no encontrado');
        }
    } catch (error) {
        console.error('Error al editar deporte:', error.message);
        res.status(500).send(`Error interno del servidor: ${error.message}`);
    }
});

// 4. Ruta para eliminar un deporte
app.get('/eliminar', async (req, res) => {
    const { nombre } = req.query;
    try {
        const sports = await readSportsFile();
        const filteredSports = sports.filter(sport => sport.nombre !== nombre);
        await fs.writeFile(SPORTS_FILE_PATH, JSON.stringify(filteredSports, null, 2));
        res.send('Deporte eliminado correctamente');
    } catch (error) {
        console.error('Error al eliminar deporte:', error.message);
        res.status(500).send(`Error interno del servidor: ${error.message}`);
    }
});

// Iniciar servidor
app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
