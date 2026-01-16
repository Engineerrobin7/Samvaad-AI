import multer from 'multer';
import path from 'path';

const upload = multer({
  dest: 'uploads/faq/',
  limits: { fileSize: 20 * 1024 * 1024 }, // 20MB
  fileFilter: (req, file, cb) => {
    const allowedTypes = /pdf/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());

    if (extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only PDF files are allowed'));
    }
  },
});

export const multerUpload = upload;
