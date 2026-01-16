'use client';

import { useState } from 'react';
import { useUser } from '@clerk/nextjs';

declare global {
  interface Window {
    Razorpay: any;
  }
}

interface Plan {
  id: string;
  name: string;
  price: number;
  features: string[];
  popular?: boolean;
}

export default function PaymentPage() {
  const { user } = useUser();
  const [loading, setLoading] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);

  const plans: Plan[] = [
    {
      id: 'free',
      name: 'Free',
      price: 0,
      features: [
        '50 translations per month',
        'Basic language support',
        'Community access',
        'Standard support'
      ]
    },
    {
      id: 'pro',
      name: 'Pro',
      price: 499,
      popular: true,
      features: [
        'Unlimited translations',
        'All languages',
        'AI-powered suggestions',
        'Priority support',
        'Advanced analytics',
        'Collaboration features'
      ]
    },
    {
      id: 'enterprise',
      name: 'Enterprise',
      price: 1999,
      features: [
        'Everything in Pro',
        'Custom AI models',
        'API access',
        'Dedicated support',
        'Team management',
        'Custom integrations',
        'SLA guarantee'
      ]
    }
  ];

  const handlePayment = async (plan: Plan) => {
    if (plan.price === 0) {
      alert('You are already on the free plan!');
      return;
    }

    setLoading(true);
    setSelectedPlan(plan.id);

    try {
      // Create order on backend
      const response = await fetch('http://localhost:5000/api/payments/create-order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${await user?.getToken()}`
        },
        body: JSON.stringify({
          amount: plan.price,
          planId: plan.id
        })
      });

      const order = await response.json();

      // Initialize Razorpay
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: order.amount,
        currency: order.currency,
        name: 'Samvaad AI',
        description: `${plan.name} Plan Subscription`,
        order_id: order.id,
        handler: async function (response: any) {
          // Verify payment on backend
          const verifyResponse = await fetch('http://localhost:5000/api/payments/verify', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${await user?.getToken()}`
            },
            body: JSON.stringify({
              orderId: response.razorpay_order_id,
              paymentId: response.razorpay_payment_id,
              signature: response.razorpay_signature,
              planId: plan.id
            })
          });

          if (verifyResponse.ok) {
            alert('Payment successful! Your subscription is now active.');
            window.location.reload();
          } else {
            alert('Payment verification failed. Please contact support.');
          }
        },
        prefill: {
          name: user?.fullName || '',
          email: user?.primaryEmailAddress?.emailAddress || '',
        },
        theme: {
          color: '#3B82F6'
        }
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();
    } catch (error) {
      console.error('Payment error:', error);
      alert('Payment failed. Please try again.');
    } finally {
      setLoading(false);
      setSelectedPlan(null);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Choose Your Plan
          </h1>
          <p className="text-xl text-gray-600">
            Unlock the full power of AI-powered translation
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className={`relative bg-white rounded-2xl shadow-xl p-8 ${
                plan.popular ? 'ring-4 ring-blue-500 transform scale-105' : ''
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <span className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-1 rounded-full text-sm font-semibold">
                    Most Popular
                  </span>
                </div>
              )}

              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                <div className="flex items-baseline justify-center gap-2">
                  <span className="text-5xl font-bold">₹{plan.price}</span>
                  {plan.price > 0 && <span className="text-gray-600">/month</span>}
                </div>
              </div>

              <ul className="space-y-4 mb-8">
                {plan.features.map((feature, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <svg
                      className="w-6 h-6 text-green-500 flex-shrink-0"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    <span className="text-gray-700">{feature}</span>
                  </li>
                ))}
              </ul>

              <button
                onClick={() => handlePayment(plan)}
                disabled={loading && selectedPlan === plan.id}
                className={`w-full py-3 rounded-lg font-semibold transition ${
                  plan.popular
                    ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700'
                    : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {loading && selectedPlan === plan.id
                  ? 'Processing...'
                  : plan.price === 0
                  ? 'Current Plan'
                  : 'Subscribe Now'}
              </button>
            </div>
          ))}
        </div>

        {/* Features Comparison */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <h2 className="text-3xl font-bold text-center mb-8">Feature Comparison</h2>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b-2">
                  <th className="text-left py-4 px-4">Feature</th>
                  <th className="text-center py-4 px-4">Free</th>
                  <th className="text-center py-4 px-4">Pro</th>
                  <th className="text-center py-4 px-4">Enterprise</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { name: 'Translations per month', free: '50', pro: 'Unlimited', enterprise: 'Unlimited' },
                  { name: 'Languages', free: 'Basic', pro: 'All', enterprise: 'All + Custom' },
                  { name: 'AI Suggestions', free: '❌', pro: '✅', enterprise: '✅' },
                  { name: 'Analytics', free: 'Basic', pro: 'Advanced', enterprise: 'Custom' },
                  { name: 'Collaboration', free: '❌', pro: '✅', enterprise: '✅' },
                  { name: 'API Access', free: '❌', pro: '❌', enterprise: '✅' },
                  { name: 'Support', free: 'Community', pro: 'Priority', enterprise: 'Dedicated' }
                ].map((row, i) => (
                  <tr key={i} className="border-b">
                    <td className="py-4 px-4 font-medium">{row.name}</td>
                    <td className="py-4 px-4 text-center">{row.free}</td>
                    <td className="py-4 px-4 text-center">{row.pro}</td>
                    <td className="py-4 px-4 text-center">{row.enterprise}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* FAQ */}
        <div className="mt-12 bg-white rounded-2xl shadow-xl p-8">
          <h2 className="text-3xl font-bold text-center mb-8">Frequently Asked Questions</h2>
          
          <div className="space-y-6">
            {[
              {
                q: 'Can I cancel my subscription anytime?',
                a: 'Yes, you can cancel your subscription at any time. You will continue to have access until the end of your billing period.'
              },
              {
                q: 'What payment methods do you accept?',
                a: 'We accept all major credit/debit cards, UPI, net banking, and digital wallets through Razorpay.'
              },
              {
                q: 'Is there a free trial?',
                a: 'Yes! The Free plan is available forever with no credit card required. You can upgrade anytime.'
              },
              {
                q: 'Do you offer refunds?',
                a: 'Yes, we offer a 30-day money-back guarantee if you are not satisfied with our service.'
              }
            ].map((faq, i) => (
              <div key={i} className="border-b pb-6 last:border-b-0">
                <h3 className="font-semibold text-lg mb-2">{faq.q}</h3>
                <p className="text-gray-600">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Load Razorpay Script */}
      <script src="https://checkout.razorpay.com/v1/checkout.js" async />
    </div>
  );
}
