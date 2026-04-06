import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { X, Phone, Lock, ArrowRight, CheckCircle } from 'lucide-react';
import { VITE_API_URL } from '../config/env';

const API_URL = VITE_API_URL;

interface CustomerAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  restaurantId: string;
  guestSessionId: string;
  onLoginSuccess: (user: any) => void;
}

const CustomerAuthModal: React.FC<CustomerAuthModalProps> = ({ 
  isOpen, 
  onClose, 
  restaurantId,
  guestSessionId,
  onLoginSuccess 
}) => {
  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [receivedOtp, setReceivedOtp] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [timer, setTimer] = useState(0);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [timer]);

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (phone.length < 10) {
      setError('Please enter a valid 10-digit phone number');
      return;
    }

    setIsLoading(true);
    setError(null);
    setReceivedOtp(null);

    try {
      const response = await axios.post(`${API_URL}/auth/customer/send-otp`, { 
        phone: phone.replace(/\D/g, '') 
      });
      
      // Capture OTP for development/testing
      if (response.data.otp) {
        setReceivedOtp(response.data.otp);
      }
      
      setStep('otp');
      setTimer(60);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to send OTP');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.length < 6) {
      setError('Please enter the 6-digit OTP');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await axios.post(`${API_URL}/auth/customer/verify-otp`, {
        phone: phone.replace(/\D/g, ''),
        otp,
        guestSessionId,
        restaurantId
      });

      const { user, accessToken } = response.data.data;
      
      // Store customer token separately or use existing auth logic
      localStorage.setItem('customerToken', accessToken);
      localStorage.setItem('customerUser', JSON.stringify(user));
      
      onLoginSuccess(user);
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Invalid OTP');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="relative w-full max-w-md bg-white dark:bg-gray-900 rounded-3xl shadow-2xl overflow-hidden border border-white/20"
      >
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
          title="Close"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="p-8">
          <div className="mb-8 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 mb-4 bg-orange-100 dark:bg-orange-900/30 rounded-2xl">
              {step === 'phone' ? (
                <Phone className="w-8 h-8 text-orange-600" />
              ) : (
                <Lock className="w-8 h-8 text-orange-600" />
              )}
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              {step === 'phone' ? 'Welcome Back!' : 'Enter Verification Code'}
            </h2>
            <p className="mt-2 text-gray-500 dark:text-gray-400">
              {step === 'phone' 
                ? 'Login to track your loyalty points and access dynamic coupons.' 
                : `We've sent a 6-digit code to ${phone}`}
            </p>
            {receivedOtp && (
              <div className="mt-4 p-3 bg-brand-500/10 border border-brand-500/20 rounded-xl">
                <p className="text-[10px] font-black text-brand-500 uppercase tracking-widest text-center mb-1">Testing OTP</p>
                <p className="text-2xl font-black text-brand-500 text-center tracking-[0.2em]">{receivedOtp}</p>
              </div>
            )}
          </div>

          <form onSubmit={step === 'phone' ? handleSendOtp : handleVerifyOtp} className="space-y-6">
            {step === 'phone' ? (
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
                  <span className="text-sm font-medium">+91</span>
                </div>
                <input
                  type="tel"
                  maxLength={10}
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                  className="block w-full pl-12 pr-4 py-4 bg-gray-50 dark:bg-gray-800 border-none rounded-2xl text-lg font-medium focus:ring-2 focus:ring-orange-500 transition-all"
                  placeholder="Enter phone number"
                  disabled={isLoading}
                />
              </div>
            ) : (
              <div className="relative">
                <input
                  type="text"
                  maxLength={6}
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                  className="block w-full px-4 py-4 bg-gray-50 dark:bg-gray-800 border-none rounded-2xl text-3xl tracking-[1em] text-center font-bold focus:ring-2 focus:ring-orange-500 transition-all placeholder:tracking-normal placeholder:text-base placeholder:font-normal"
                  placeholder="000000"
                  disabled={isLoading}
                  autoFocus
                />
              </div>
            )}

            {error && (
              <motion.p 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center text-sm font-medium text-red-500"
              >
                {error}
              </motion.p>
            )}

            <button
              type="submit"
              disabled={isLoading}
              title={step === 'phone' ? 'Send OTP' : 'Verify & Log In'}
              aria-label={step === 'phone' ? 'Send OTP' : 'Verify & Log In'}
              className="group relative w-full py-4 bg-orange-600 hover:bg-orange-700 disabled:bg-gray-400 text-white rounded-2xl font-bold text-lg shadow-lg shadow-orange-600/20 transition-all overflow-hidden"
            >
              <div className="relative z-10 flex items-center justify-center gap-2">
                {isLoading ? (
                  <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    {step === 'phone' ? 'Send OTP' : 'Verify & Log In'}
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </div>
            </button>
          </form>

          {step === 'otp' && (
            <div className="mt-6 text-center">
              <button 
                type="button"
                disabled={timer > 0 || isLoading}
                onClick={handleSendOtp}
                className="text-sm font-medium text-orange-600 hover:text-orange-700 disabled:text-gray-400"
              >
                {timer > 0 ? `Resend code in ${timer}s` : 'Resend Code'}
              </button>
            </div>
          )}

          <div className="mt-8 pt-8 border-t border-gray-100 dark:border-gray-800 flex items-center justify-center gap-2 text-xs text-gray-400">
            <CheckCircle className="w-3 h-3" />
            <span>Secure Phone Verification</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default CustomerAuthModal;
