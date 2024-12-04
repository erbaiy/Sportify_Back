import { diskStorage } from 'multer';
import * as path from 'path';

// Define allowed file types
const MIME_TYPE_MAP = {
  'image/png': 'png',
  'image/jpeg': 'jpg',
  'image/jpg': 'jpg',
};

// Multer configuration
export const multerConfig = {
  storage: diskStorage({
    destination: './uploads',
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
      cb(null, uniqueSuffix + path.extname(file.originalname));
    },
  }),
  fileFilter: (req, file, cb) => {
    const isValid = !!MIME_TYPE_MAP[file.mimetype];
    const error = isValid ? null : new Error('Invalid file type!');
    cb(error, isValid);
  },
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  },
};

// Custom decorator for file upload
export const multerOptions = {
  storage: multerConfig.storage,
  fileFilter: multerConfig.fileFilter,
  limits: multerConfig.limits,
};