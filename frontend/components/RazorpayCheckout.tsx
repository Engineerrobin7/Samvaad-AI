import React from 'react';

type Props = {
  amount: number; // in rupees
  currency?: string;
  onSuccess?: (data: any) => void;
  onError?: (err: any) => void;
};

export default function RazorpayCheckout({ amount, currency = 'INR', onSuccess, onError }: Props) {
  const loadScript = (src: string) =>
    new Promise((resolve) => {
      const script = document.createElement('script');
      script.src = src;
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });

  const handleCheckout = async () => {
    try {
      const res = await fetch('/api/payments/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount })
      });
      const data = await res.json();
      if (!data?.success) throw new Error('Failed to create order');

      const order = data.order;

      const loaded = await loadScript('https://checkout.razorpay.com/v1/checkout.js');
      if (!loaded) throw new Error('Razorpay SDK failed to load');

      const options: any = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || '',
        amount: order.amount,
        currency: order.currency || currency,
        name: 'Samvaad AI',
        description: 'Purchase',
        order_id: order.id,
        handler: async function (response: any) {
          // Verify on server
          const verifyRes = await fetch('/api/payments/verify', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(response)
          });
          const verifyData = await verifyRes.json();
          if (verifyData?.success) {
            onSuccess?.(verifyData);
          } else {
            onError?.(verifyData);
          }
        },
        prefill: {},
        theme: { color: '#3399cc' }
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.open();
    } catch (err) {
      console.error('Checkout error', err);
      onError?.(err);
    }
  };

  return (
    <button onClick={handleCheckout} className="px-4 py-2 bg-blue-600 text-white rounded">
      Pay ₹{amount}
    </button>
  );
}
