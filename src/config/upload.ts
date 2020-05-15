import path from 'path'; // utilizamos para referenciar o caminho até o arquivo
import crypto from 'crypto'; // Utilizamos para criar uma seguencia hash
import multer from 'multer'; // Utilizamos para tratar arquivos

const walkFile = path.resolve(__dirname, '..', '..', 'tmp');

export default {
  directory: walkFile,

  storage: multer.diskStorage({
    destination: walkFile,
    filename(request, file, callback) {
      // Cria uma string de numero aleatorios
      const fileHash = crypto.randomBytes(10).toString('HEX');

      // Junta a string criada acima, com o nome original, para não ter nome duplicado
      const fileName = `${fileHash}-${file.originalname}`;

      return callback(null, fileName);
    },
  }),
};
