import { diskStorage } from 'multer';
import { extname } from 'path';

export const imageUploadConfig = {
  storage: diskStorage({
    destination: './uploads/reviews',
    filename: (req, file, callback) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
      callback(null, uniqueSuffix + extname(file.originalname));
    },
  }),
};
