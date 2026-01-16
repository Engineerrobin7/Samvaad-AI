import Razorpay from 'razorpay';
import crypto from 'crypto';

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || '',
  key_secret: process.env.RAZORPAY_KEY_SECRET || ''
});

export async function createOrder(amountInRupees: number, currency = 'INR', receipt?: string) {
  // Razorpay expects amount in the smallest currency unit (paise for INR)
  const amount = Math.round(amountInRupees * 100);
  const options = {
    amount,
    currency,
    receipt: receipt || `rcpt_${Date.now()}`,
    payment_capture: 1
  } as any;

  const order = await razorpay.orders.create(options);
  return order;
}

export function verifyPaymentSignature(orderId: string, paymentId: string, signature: string) {
  const payload = `${orderId}|${paymentId}`;
  const expected = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET || '').update(payload).digest('hex');
  return expected === signature;
}
