import { Request, Response } from 'express';
import * as paymentService from '../services/payment.service';
import pool from '../db/pool';

export const createOrder = async (req: Request, res: Response) => {
  try {
    const { amount, currency, receipt } = req.body;
    if (!amount || typeof amount !== 'number') {
      return res.status(400).json({ success: false, message: 'Invalid amount (number expected)' });
    }

    const order = await paymentService.createOrder(amount, currency || 'INR', receipt);
    return res.json({ success: true, order });
  } catch (err: any) {
    console.error('createOrder error', err);
    return res.status(500).json({ success: false, message: 'Failed to create order', error: err?.message || err });
  }
};

export const verifyPayment = async (req: Request, res: Response) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({ success: false, message: 'Missing required payment fields' });
    }

    const verified = paymentService.verifyPaymentSignature(razorpay_order_id, razorpay_payment_id, razorpay_signature);
    if (!verified) {
      return res.status(400).json({ success: false, message: 'Invalid signature' });
    }

    // Record payment in DB (best-effort). Table `payments` should exist.
    try {
      await pool.query(
        `INSERT INTO payments (order_id, payment_id, signature, amount, currency, status, created_at)
         VALUES ($1, $2, $3, $4, $5, $6, NOW())`,
        [razorpay_order_id, razorpay_payment_id, razorpay_signature, req.body.amount || null, req.body.currency || 'INR', 'verified']
      );
    } catch (dbErr) {
      console.warn('Failed to persist payment to DB (continuing):', dbErr?.message || dbErr);
    }

    return res.json({ success: true, message: 'Payment verified' });
  } catch (err: any) {
    console.error('verifyPayment error', err);
    return res.status(500).json({ success: false, message: 'Failed to verify payment', error: err?.message || err });
  }
};
