"use client";
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useSearchParams, useRouter } from 'next/navigation';
import { 
  Coins, 
  ArrowLeft, 
  CreditCard, 
  Shield, 
  CheckCircle,
  Loader2,
  Zap,
  Sparkles,
  PartyPopper,
  ArrowRight
} from 'lucide-react';
import { useBuyTokensMutation } from '@/redux/api/tokenApi';
import { toast } from 'sonner';
import {
  Elements,
  CardElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';

// Initialize Stripe with your publishable key
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

// Card Form Component
const CheckoutForm = ({ 
  totalTokens, 
  totalAmount,
  onSuccess,
  onError 
}: { 
  totalTokens: number;
  totalAmount: number;
  onSuccess: () => void;
  onError: (error: string) => void;
}) => {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);
  const [buyTokensFn] = useBuyTokensMutation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!stripe || !elements) {
      toast.error('Stripe is not initialized');
      return;
    }

    setIsProcessing(true);

    try {
      // Create payment method
      const cardElement = elements.getElement(CardElement);
      if (!cardElement) {
        throw new Error('Card element not found');
      }

      const { error, paymentMethod } = await stripe.createPaymentMethod({
        type: 'card',
        card: cardElement,
      });

      if (error) {
        throw new Error(error.message);
      }

      // Call buy tokens API
      const response = await buyTokensFn({
        paymentMethodId: paymentMethod.id,
        totalToken: totalTokens,
      }).unwrap();

      if (response?.success) {
        toast.success(`Successfully purchased ${totalTokens} tokens!`);
        onSuccess();
      } else {
        throw new Error(response?.message || 'Failed to purchase tokens');
      }
    } catch (error: any) {
      console.error('Payment error:', error);
      toast.error(error.message || 'Payment failed. Please try again.');
      onError(error.message);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-300">
          Card Details
        </label>
        <div className="bg-[#1a1a1a] border border-white/10 rounded-xl p-4 focus-within:border-yellow-400/50 transition-colors">
          <CardElement
            options={{
              style: {
                base: {
                  color: '#ffffff',
                  fontSize: '16px',
                  fontFamily: 'inherit',
                  '::placeholder': {
                    color: '#6b7280',
                  },
                  iconColor: '#fbbf24',
                },
                invalid: {
                  color: '#ef4444',
                  iconColor: '#ef4444',
                },
              },
              hidePostalCode: true,
            }}
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={!stripe || isProcessing}
        className="w-full py-3 rounded-full font-semibold bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-300 hover:to-orange-400 text-black transition-all shadow-[0_0_20px_rgba(251,191,36,0.3)] hover:shadow-[0_0_30px_rgba(251,191,36,0.5)] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {isProcessing ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            Processing...
          </>
        ) : (
          <>
            <Zap className="w-5 h-5" />
            Pay ${totalAmount}
          </>
        )}
      </button>
    </form>
  );
};

// Main Checkout Component
function Checkout() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [totalTokens, setTotalTokens] = useState<number>(0);
  const [totalAmount, setTotalAmount] = useState<number>(0);
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  const TOKEN_PRICE = 20;

  useEffect(() => {
    const tokensParam = searchParams.get('tokens');
    if (tokensParam) {
      const tokens = parseInt(tokensParam, 10);
      setTotalTokens(tokens);
      setTotalAmount(tokens * TOKEN_PRICE);
    } else {
      // Redirect back if no tokens param
      router.push('/buy-tokens');
    }
  }, [searchParams, router]);

  const handlePaymentSuccess = () => {
    setPaymentSuccess(true);
    setTimeout(() => {
      router.push('/my-profile');
    }, 4000);
  };

  const handlePaymentError = (error: string) => {
    console.error('Payment error:', error);
  };

  if (!totalTokens) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen w-full bg-black font-sans overflow-x-hidden py-20">
      {/* Background gradients */}
      <div
        className="fixed inset-0 pointer-events-none bg-[radial-gradient(ellipse_at_top,#8B1A00,transparent_60%),radial-gradient(ellipse_at_bottom,#0A0000,#000)]"
        style={{ zIndex: 0 }}
      />

      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-yellow-400/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl animate-pulse delay-1000" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-yellow-500/5 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 max-w-3xl mx-auto px-4">
        {/* Back Button */}
        {!paymentSuccess && (
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-8"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to packages
          </button>
        )}

        {/* Checkout Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className={`bg-[#1a1a1a]/80 backdrop-blur-sm rounded-2xl border ${
            paymentSuccess ? 'border-green-500/50' : 'border-yellow-400/20'
          } p-8 relative overflow-hidden`}
        >
          {/* Success Confetti Background */}
          {paymentSuccess && (
            <>
              <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-yellow-500/5" />
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-green-400 via-yellow-400 to-orange-500" />
              
              {/* Floating Particles */}
              {[...Array(20)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute w-2 h-2 rounded-full"
                  style={{
                    background: ['#fbbf24', '#f97316', '#34d399', '#60a5fa', '#a78bfa'][i % 5],
                    left: `${Math.random() * 100}%`,
                    top: `${Math.random() * 100}%`,
                  }}
                  initial={{ y: 0, opacity: 0 }}
                  animate={{
                    y: [0, -100, -200],
                    opacity: [0, 1, 0],
                    scale: [0, 1.5, 0],
                  }}
                  transition={{
                    duration: 2 + Math.random() * 2,
                    repeat: Infinity,
                    delay: Math.random() * 2,
                  }}
                />
              ))}
            </>
          )}

          {paymentSuccess ? (
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.6, type: "spring" }}
              className="text-center py-8 relative z-10"
            >
              {/* Animated Checkmark */}
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                className="relative inline-block"
              >
                <div className="absolute inset-0 rounded-full bg-green-500/20 animate-ping" />
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-green-400 to-emerald-600 flex items-center justify-center mx-auto mb-6 shadow-[0_0_60px_rgba(52,211,153,0.3)]">
                  <CheckCircle className="w-12 h-12 text-white" />
                </div>
              </motion.div>

              {/* Success Title */}
              <motion.h2
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="text-4xl font-bold text-white mb-3 flex items-center justify-center gap-3"
              >
                Payment Successful!
                <PartyPopper className="w-8 h-8 text-yellow-400" />
              </motion.h2>

              {/* Token Purchase Info */}
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="bg-black/40 rounded-xl p-6 max-w-sm mx-auto mb-6 border border-yellow-400/20"
              >
                <div className="flex items-center justify-center gap-4">
                  <div className="w-14 h-14 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center shadow-[0_0_30px_rgba(251,191,36,0.3)]">
                    <Coins className="w-7 h-7 text-black" />
                  </div>
                  <div className="text-left">
                    <p className="text-sm text-gray-400">Tokens Added</p>
                    <p className="text-2xl font-bold text-white">
                      +{totalTokens} <span className="text-yellow-400 text-sm">Tokens</span>
                    </p>
                  </div>
                </div>
              </motion.div>

              {/* Success Message */}
              <motion.p
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="text-gray-300 mb-6"
              >
                Your tokens have been successfully added to your account.
                <br />
                <span className="text-yellow-400 text-sm">
                  You can now use them to unlock premium features!
                </span>
              </motion.p>

              {/* Redirect Timer */}
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.6 }}
                className="flex flex-col items-center gap-4"
              >
                <div className="flex items-center gap-2 text-sm text-gray-400">
                  <Loader2 className="w-4 h-4 animate-spin text-yellow-400" />
                  Redirecting to profile...
                </div>

                {/* Action Buttons */}
                <div className="flex gap-4">
                  <button
                    onClick={() => router.push('/my-profile')}
                    className="px-6 py-2 rounded-full bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-300 hover:to-orange-400 text-black font-semibold transition-all flex items-center gap-2 shadow-[0_0_20px_rgba(251,191,36,0.2)]"
                  >
                    Go to Profile
                    <ArrowRight className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => router.push('/buy-tokens')}
                    className="px-6 py-2 rounded-full bg-white/10 hover:bg-white/20 text-white font-semibold transition-all border border-white/10"
                  >
                    Buy More
                  </button>
                </div>
              </motion.div>
            </motion.div>
          ) : (
            <>
              {/* Header */}
              <div className="text-center mb-8">
                <div className="inline-flex items-center gap-3 px-6 py-2 rounded-full bg-yellow-400/10 border border-yellow-400/20 backdrop-blur-sm mb-4">
                  <Coins className="w-5 h-5 text-yellow-400" />
                  <span className="text-yellow-400/90 text-sm font-medium">Checkout</span>
                </div>
                <h1 className="text-3xl font-bold text-white mb-2">
                  Complete Your Purchase
                </h1>
                <p className="text-gray-400">
                  You are about to purchase {totalTokens} tokens
                </p>
              </div>

              {/* Order Summary */}
              <div className="bg-black/40 rounded-xl border border-white/10 p-6 mb-8">
                <h3 className="text-sm font-semibold text-gray-400 mb-4">
                  Order Summary
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Tokens</span>
                    <span className="text-white font-semibold">
                      {totalTokens} × ${TOKEN_PRICE}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Subtotal</span>
                    <span className="text-white font-semibold">
                      ${totalAmount}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Processing Fee</span>
                    <span className="text-green-400">$0.00</span>
                  </div>
                  <div className="h-px bg-white/10" />
                  <div className="flex justify-between">
                    <span className="text-white font-bold">Total</span>
                    <span className="text-2xl font-bold text-yellow-400">
                      ${totalAmount}
                    </span>
                  </div>
                </div>
              </div>

              {/* Stripe Elements */}
              <Elements stripe={stripePromise}>
                <CheckoutForm
                  totalTokens={totalTokens}
                  totalAmount={totalAmount}
                  onSuccess={handlePaymentSuccess}
                  onError={handlePaymentError}
                />
              </Elements>

              {/* Security Badge */}
              <div className="flex items-center justify-center gap-2 mt-6">
                <Shield className="w-4 h-4 text-gray-500" />
                <span className="text-xs text-gray-500">
                  Secured by Stripe. Your payment information is encrypted.
                </span>
              </div>
            </>
          )}
        </motion.div>
      </div>
    </div>
  );
}

export default Checkout;