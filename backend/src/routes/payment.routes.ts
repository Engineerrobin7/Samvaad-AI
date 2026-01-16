import express from 'express';
import { createOrder, verifyPayment } from '../controllers/payment.controller';

const router = express.Router();

router.post('/create-order', createOrder);
router.post('/verify', verifyPayment);

export default router;
