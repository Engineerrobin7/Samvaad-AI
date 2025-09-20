// src/routes/pdf.routes.ts
import { Router } from 'express';
import multer from 'multer';
import { pdfController } from '../controllers/pdf.controller';

const router = Router();

// Configure multer for file uploads
const upload = multer({ dest: 'uploads/faq/' });

// Define PDF routes
router.post('/upload', upload.single('file'), pdfController.uploadPdf);
router.post('/chat', pdfController.chatWithPdf);

export default router;