const crypto = require('crypto');
const fs = require('fs');
const dirTree = require('directory-tree');

// Muestra un listado de hashes; es platform-dependant, esto quiere decir que
// depende de la biblioteca OpenSSL instalada en el sistema donde se ejecuta
// este script
// console.log(crypto.getHashes());

const params = process.argv;
const globalMap = new Map();

if (params.length == 3) {
    const scanFolder = params[2];

    if (fs.existsSync(scanFolder)) {
        const theTree = dirTree(scanFolder, { attributes: ['type', 'extension']});
        traverseDirTree(theTree);

        console.log(globalMap);
    } else {
        console.error('ERROR: La carpeta no existe.');
    }
} else {
    console.error('ERROR: Te faltan parámetros');
    console.error('Uso: node checksums.js CARPETA');
}

/**
 * Recorre un árbol generado por la biblioteca directory-tree; para cada file
 * encontrado, invoca función makeChecksum, generadora de la suma de
 * verificación
 *
 * Pre: el árbol generado por directory-tree
 * Post:
 */
function traverseDirTree(dirNode) {
    if (dirNode.type === 'directory') {
        // Es un directory; continuamos escaneo
        if (dirNode.children && dirNode.children.length > 0) {
            dirNode.children.forEach((children) => traverseDirTree(children));
        }
    } else {
        // Es un file; generamos checksum
        const file = dirNode.path;
        makeChecksum(file, updateMap);
    }
}

/**
 * Genera la suma de verificación para el archivo recibido como argumento
 * Pre: el archivo cuya suma de verif. se ha de generar
 * Post:
 */
function makeChecksum(filename, updateMap) {
    if (fs.existsSync(filename)) {
        const hash = crypto.createHash('md5');
        const readFile = fs.readFileSync(filename);
        const checksum = hash.update(readFile, 'utf8').digest('hex');
        updateMap(filename, checksum);
    } else {
        console.error('ERROR: No existe el archivo %s', filename);
    }
}

/**
 * Actualiza el diccionario global con el checksum y el nombre del archivo,
 * si éste existía previamente
 * Pre:
 * - el nombre del archivo
 * - la suma de verificación correspondiente
 *
 * Post:
 */
function updateMap(file, theChecksum) {
    if (globalMap.has(theChecksum)) {
        const currentArray = globalMap.get(theChecksum);
        currentArray.push(file);
        globalMap.set(theChecksum, currentArray);
    } else {
        globalMap.set(theChecksum, [file]);
    }
}