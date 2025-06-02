const fs = require('fs');
const exifr = require('exifr');
const config = require('../config/config');
const path = require('path');

////////////////////////////////    AREA DE CONFIGURACION    ////////////////////////////////

const publicPath = config.publicPath;



////////////////////////////////    API    ////////////////////////////////
exports.fetchEXIFData = async(serverPath, imagePath) => {
    try {
        const imageToExif = path.join(publicPath, serverPath, imagePath);
        return exifr.parse(imageToExif)
    } catch (error) {
        console.log('Ocurrió un error: %o', error);
    }
}

exports.convertToJPEG = function(pathToImage) {
  if (!pathToImage) {
    return false;
  }

  return convertImageToJPEG(pathToImage, config.convertedPath);
}


////////////////////////////////    CAPA DE SERVICIOS    ////////////////////////////////
/**
 * Convierte una imagen cualquiera a JPEG, almacenando el archivo convertido en la carpeta
 * especificada como destinationFolder
 * @param sourceImage la imagen fuente que se quiere convertir
 * @param destinationFolder la ubicación de la imagen ya convertida
 * @returns boolean | string
 */
function convertImageToJPEG(sourceImage, destinationFolder) {
  const imageName = path.parse(sourceImage).name;
  const execSync = require('child_process').execSync;

  const destinationImage = path.join(destinationFolder, imageName + '.jpg');

  /**
   * La ejecución de convert no tiene retorno; por lo tanto no hay nada que capturar aquí
   * Directamente preguntamos luego si existe el archivo destino y retornamos:
   * - si el archivo destino existe, la ruta
   * - en caso contrario, false
   */
  try {
    execSync('convert "' + sourceImage + '" "' + destinationImage + '"');

  }catch(error){
    console.error('convert image failed')
    return false;

  }

  if (fs.existsSync(destinationImage)) {
    return path.relative(config.publicPath, destinationImage);
  }

  return false;
}
