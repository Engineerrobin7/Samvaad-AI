import express from 'express';
import { uploadFaq, upload } from '../controllers/faq.controller';

const router = express.Router();

router.post('/upload', upload.single('faqfile'), uploadFaq);

export default router;