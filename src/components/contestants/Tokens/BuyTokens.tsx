"use client";
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Coins,
  CreditCard,
  Shield,
  CheckCircle,
  Minus,
  Plus,
  ArrowRight,
  Sparkles
} from 'lucide-react';
import { useGetMyProfileQuery } from '@/redux/api/userApi';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';

function BuyTokens() {
  const [tokenCount, setTokenCount] = useState<number>(1);
  const [isProcessing, setIsProcessing] = useState(false);
  const { data: getMyProfileData } = useGetMyProfileQuery({});
  const profileData = getMyProfileData?.result;
  const router = useRouter();
  const token = Cookies.get("accessToken");

  const TOKEN_PRICE = 20;

  const handleDecrease = () => {
    if (tokenCount > 1) {
      setTokenCount(tokenCount - 1);
    }
  };

  const handleIncrease = () => {
    setTokenCount(tokenCount + 1);
  };

  const handleBuyTokens = () => {
    setIsProcessing(true);

    if (!token) {
      router.push("/login");
      return;
    }

    // Redirect to checkout with token amount
    router.push(`/checkout?tokens=${tokenCount}`);
    setIsProcessing(false);
  };

  // Calculate total amount
  const totalAmount = tokenCount * TOKEN_PRICE;

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

      {/* Grid Pattern */}
      <div
        className="absolute inset-0 opacity-30"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%239C92AC' fill-opacity='0.05'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
        }}
      />

      <div className="relative z-10 max-w-4xl mx-auto px-4">
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-3 px-6 py-2 rounded-full bg-yellow-400/10 border border-yellow-400/20 backdrop-blur-sm mb-6">
            <Coins className="w-5 h-5 text-yellow-400" />
            <span className="text-yellow-400/90 text-sm font-medium">Buy Tokens</span>
          </div>

          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold bg-gradient-to-r from-yellow-400 via-orange-500 to-red-600 bg-clip-text text-transparent mb-4">
            Get More Tokens
          </h1>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Purchase tokens to unlock premium features and boost your dating experience
          </p>
        </motion.div>

        {/* Token Balance Card */}
        {token && <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="bg-gradient-to-r from-yellow-400/10 to-orange-500/10 border border-yellow-400/20 rounded-2xl p-6 mb-12 backdrop-blur-sm"
        >
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center shadow-[0_0_30px_rgba(251,191,36,0.3)]">
                <Coins className="w-8 h-8 text-black" />
              </div>
              <div>
                <p className="text-gray-400 text-sm">Your Balance</p>
                <p className="text-3xl font-bold text-white">
                  {profileData?.token || 0} <span className="text-yellow-400 text-lg">Tokens</span>
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-400">
              <Shield className="w-4 h-4 text-yellow-400" />
              <span>Secure transactions</span>
            </div>
          </div>
        </motion.div>}

        {/* Single Token Package with Counter */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="max-w-lg mx-auto"
        >
          <div className="relative rounded-2xl overflow-hidden border-2 border-yellow-400 shadow-[0_0_40px_rgba(251,191,36,0.15)] bg-gradient-to-br from-[#1a1a1a] to-[#0a0a0a] p-8">
            {/* Popular Badge
            <div className="absolute top-4 right-4 z-10">
              <div className="bg-gradient-to-r from-yellow-400 to-orange-500 text-black text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1">
                <Sparkles className="w-3 h-3 fill-black" />
                Popular
              </div>
            </div> */}

            {/* Package Icon */}
            <div className="flex justify-center mb-6">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-yellow-400/20 to-orange-500/20 flex items-center justify-center border border-yellow-400/30">
                <Coins className="w-10 h-10 text-yellow-400" />
              </div>
            </div>

            {/* Token Counter */}
            <div className="text-center mb-6">
              <h3 className="text-gray-400 text-sm font-medium mb-2">Select Token Amount</h3>
              <div className="flex items-center justify-center gap-4">
                <button
                  onClick={handleDecrease}
                  disabled={tokenCount <= 1}
                  className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${tokenCount <= 1
                    ? 'bg-gray-800/50 text-gray-600 cursor-not-allowed'
                    : 'bg-yellow-400/20 hover:bg-yellow-400/30 text-yellow-400 hover:scale-105'
                    } border border-yellow-400/30`}
                >
                  <Minus className="w-5 h-5" />
                </button>

                <div className="min-w-[100px] text-center">
                  <span className="text-4xl font-bold text-white">{tokenCount}</span>
                  <span className="text-yellow-400 text-sm ml-1">Tokens</span>
                </div>

                <button
                  onClick={handleIncrease}
                  className="w-12 h-12 rounded-full bg-yellow-400/20 hover:bg-yellow-400/30 text-yellow-400 hover:scale-105 transition-all border border-yellow-400/30 flex items-center justify-center"
                >
                  <Plus className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Price Display */}
            <div className="text-center mb-6">
              <div className="flex items-center justify-center gap-3">
                <span className="text-3xl font-bold text-yellow-400">
                  ${totalAmount}
                </span>
                <span className="text-sm text-gray-400">
                  (${TOKEN_PRICE} / token)
                </span>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                You will receive {tokenCount} token{tokenCount > 1 ? 's' : ''}
              </p>
            </div>

            {/* Buy Button */}
            <button
              onClick={handleBuyTokens}
              disabled={isProcessing}
              className="w-full py-4 rounded-full font-semibold bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-300 hover:to-orange-400 text-black transition-all shadow-[0_0_30px_rgba(251,191,36,0.3)] hover:shadow-[0_0_50px_rgba(251,191,36,0.5)] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-lg"
            >
              {isProcessing ? (
                <>
                  <div className="w-5 h-5 border-2 border-t-transparent rounded-full animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  Buy Now
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>

          </div>
        </motion.div>

        {/* Payment Methods */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="bg-[#1a1a1a]/80 backdrop-blur-sm rounded-2xl border border-white/10 p-6 mt-12"
        >
          <div className="flex items-center flex-wrap gap-8 justify-center">
            <div className="flex items-center gap-3">
              <CreditCard className="w-6 h-6 text-gray-400" />
              <span className="text-gray-300 text-sm">Secure Payment</span>
            </div>
            <div className="flex items-center gap-3">
              <Shield className="w-6 h-6 text-gray-400" />
              <span className="text-gray-300 text-sm">Protected</span>
            </div>
            <div className="flex items-center gap-3">
              <CheckCircle className="w-6 h-6 text-green-400" />
              <span className="text-gray-300 text-sm">Instant Update Balance</span>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

export default BuyTokens;