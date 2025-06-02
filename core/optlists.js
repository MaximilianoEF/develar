const mimeTypeOptList = [
  { val: 'no_definido',                   extension: 'no_definido',       label: 'Seleccione opción',  slug: 'Seleccione opción', type: 'no_definido' },
  { val: 'image/jpeg',                    extension: 'jpeg',              label: 'Imagen JPEG',        slug: 'Imagen JPEG', type: 'image' },
  { val: 'image/gif',                     extension: 'gif',               label: 'Imagen GIF',         slug: 'Imagen GIF', type: 'image'  },
  { val: 'image/png',                     extension: 'png',               label: 'Imagen PNG',         slug: 'Imagen PNG', type: 'image'  },
  { val: 'image/tiff',                    extension: 'tiff',              label: 'Imagen TIFF',        slug: 'Imagen TIFF', type: 'image'  },
  { val: 'application/pdf',               extension: 'pdf',               label: 'Documento PDF',      slug: 'Documento PDF', type: 'pdf' },
  { val: 'inode/directory',               extension: 'directory',         label: 'Directorio',         slug: 'Directorio', type: 'directory' },
  { val: 'application/msword',            extension: 'doc',              label: 'Documento Word',     slug: 'Documento Word', type: 'word' },
  { val: 'application/vnd.ms-powerpoint',            extension: 'ppt',              label: 'Documento Word',     slug: 'Documento Word', type: 'powerpoint' },
  { val: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',            extension: 'docx',             label: 'Documento Word',     slug: 'Documento Word', type: 'word' },
];

exports.mimeTypeOptList = mimeTypeOptList;
